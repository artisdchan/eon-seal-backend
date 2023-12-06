import { Request, Response, NextFunction } from "express";
import { GDB0101DataSource, SealMemberDataSource } from "../data-source";
import { AuthenUser } from "../dto/authen.dto";
import { ConvertCrystalRequestDTO, ConvertRCRequestDTO, ConvertRCType } from "../dto/store.dto";
import { store } from "../entity/gdb0101/store.entity";
import { usermsgex } from "../entity/seal_member/usermsgex.entity";
import { WebConfig, WebConfigConstant } from "../entity/seal_member/web_config.entity";
import { WebUserDetail } from "../entity/seal_member/web_user_detail.entity";
import LogService from "../service/log.service";
import StoreService from "../service/store.service";

export default class StoreController {

    public getRCAmount = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const currentUser = req.user as AuthenUser;
            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }

            const userEntity = await SealMemberDataSource.manager.findOneBy(usermsgex, { userId: currentUser.gameUserId });
            if (userEntity == null) {
                return res.status(400).json({ status: 400, message: 'User ID is not exist.' })
            }

            const storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: currentUser.gameUserId });
            if (storeEntity == null) {
                return res.status(400).json({ status: 400, message: 'Character is not exist.' })
            }

            const storeService = new StoreService();
            const rcItemConfig = await SealMemberDataSource.manager.findOneBy(WebConfig, { configKey: WebConfigConstant.RC_ITEM_ID_CONFIG });
            const rcItemId: number = Number(rcItemConfig?.configValue);

            const rcAmountPosition = storeService.findItemAmountPositionInStoreEntity(rcItemId, storeEntity);
            if (rcAmountPosition == undefined) {
                return res.status(200).json({ status: 200, totalRcAmount: 0 });
            }

            const rcAmount = Number(storeEntity[rcAmountPosition]) + 1;
            // const rcAmount = storeService.countDuplicateItem(rcItemId, storeEntity)

            return res.status(200).json({ status: 200, totalRcAmount: rcAmount, cashAmount: userEntity.gold });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public convertRC = async (req: Request, res: Response, next: NextFunction) => {
        const currentUser = req.user as AuthenUser;
        const request = req.body as ConvertRCRequestDTO;
        const storeService = new StoreService();
        const logService = new LogService();
        let log = await logService.insertLogItemTransaction("SWAP", request.convertType.toString(), "PREPARE_SWAP", currentUser.gameUserId, undefined);
        try {

            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }

            const userMsgExEntity = await SealMemberDataSource.manager.findOneBy(usermsgex, { userId: currentUser.gameUserId });
            if (userMsgExEntity == null) {
                log = await logService.updateLogItemTransaction("PREPARE_CONVERT_RC", 'User ID is not exist.', log);
                return res.status(400).json({ status: 400, message: 'User ID is not exist.' })
            }

            let storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: currentUser.gameUserId });
            if (storeEntity == null) {
                log = await logService.updateLogItemTransaction("PREPARE_CONVERT_RC", 'Character is not exist.', log);
                return res.status(400).json({ status: 400, message: 'Character is not exist.' })
            }

            const rcItemConfig = await SealMemberDataSource.manager.findOneBy(WebConfig, { configKey: WebConfigConstant.RC_ITEM_ID_CONFIG });

            const cashPerRcConfig = await SealMemberDataSource.manager.findOneBy(WebConfig, { configKey: WebConfigConstant.CASH_PER_RC_CONFIG });
            if (cashPerRcConfig == null || rcItemConfig == null) {
                return res.status(400).json({ status: 400, message: 'Configuration is not exist.' })
            }

            const rcItemId: number = Number(rcItemConfig.configValue);
            const cashPerRc = Number(cashPerRcConfig.configValue);

            if (request.convertType == ConvertRCType.RC_TO_CASH) {
                log = await logService.updateLogItemTransaction("PREPARE_RC_AND_CASH", undefined, log);

                const rcPosition = storeService.findItemInStorentity(rcItemId, storeEntity);
                const rcAmountPosition = storeService.findItemAmountPositionInStoreEntity(rcItemId, storeEntity);

                if (rcPosition == undefined || rcAmountPosition == undefined) {
                    log = await logService.updateLogItemTransaction("PREPARE_RC_AND_CASH", 'Insufficient RC Amount.', log);
                    return res.status(400).json({ status: 400, message: 'Insufficient RC Amount.' });
                }

                const rcAmount = Number(storeEntity[rcAmountPosition]) + 1;
                // const rcAmount = storeService.countDuplicateItem(rcItemId, storeEntity);

                if (request.amount! > rcAmount) {
                    log = await logService.updateLogItemTransaction("PREPARE_RC_AND_CASH", 'Invalid RC Amount.', log);
                    return res.status(400).json({ status: 400, message: 'Invalid RC Amount.' });
                } else if (request.amount == rcAmount) {

                    log = await logService.updateLogItemTransaction("PREPARE_UPDATE_RC", undefined, log);

                    const rcItemObj = storeService.setValueIntoStoreEntity(rcPosition, 0);
                    const rcAmountObj = storeService.setValueIntoStoreEntity(rcAmountPosition, 0);
                    
                    await GDB0101DataSource.manager.getRepository(store).save({
                        ...storeEntity,
                        // ...updateRcObj
                        ...rcItemObj,
                        ...rcAmountObj
                    })
                } else {
                    log = await logService.updateLogItemTransaction("PREPARE_UPDATE_RC", undefined, log);
                    await GDB0101DataSource.manager.decrement(store, { user_id: currentUser.gameUserId }, rcAmountPosition, request.amount!);
                }
                //  else {
                    // let updateRcObj: store = storeEntity
                    // const getAllDup = storeService.getAllDuplicatePosition(rcItemId, storeEntity);
                    // for (let i = 0; i < request.amount; i++) {
                    //     updateRcObj  = {
                    //         ...updateRcObj,
                    //         ...storeService.setValueIntoStoreEntity(getAllDup[i], 0)
                    //     }
                    // }

                // }

                log = await logService.updateLogItemTransaction("PREPARE_UPDATE_CASH", undefined, log);
                const cashToBeAdd = request.amount! * cashPerRc;
                userMsgExEntity.gold! += cashToBeAdd;
                await SealMemberDataSource.manager.save(userMsgExEntity);

                log = await logService.updateLogItemTransaction("SUCCESS", `Old RC Amount: ${rcAmount}, New RC Amount: ${request.amount}, Cash Amount: ${cashToBeAdd}`, log);

            } else if (request.convertType == ConvertRCType.CASH_TO_RC) {

                log = await logService.updateLogItemTransaction("PREPARE_CASH_TO_RC", undefined, log);
                const cashTobeMinus = request.amount! * cashPerRc;

                if (cashTobeMinus > userMsgExEntity.gold!) {
                    log = await logService.updateLogItemTransaction("PREPARE_CASH_TO_RC", 'Insufficient Cash Point.', log);
                    return res.status(400).json({ status: 400, message: 'Insufficient Cash Point.' });
                }
                let rcPosition = storeService.findItemInStorentity(rcItemId, storeEntity);
                let rcAmount = 0;
                // let rcPosition = storeService.findEmptySlotInStorentity(storeEntity);
                if (rcPosition == undefined) {
                    // log = await logService.updateLogItemTransaction("PREPARE_CASH_TO_RC", 'No available slot.', log);
                    // return res.status(400).json({ status: 400, message: 'No available slot.' });
                    rcPosition = storeService.findEmptySlotInStorentity(storeEntity);
                    if (rcPosition == undefined) {
                        log = await logService.updateLogItemTransaction("PREPARE_CASH_TO_RC", 'No available slot.', log);
                        return res.status(400).json({ status: 400, message: 'No available slot.' });
                    }
                }
                // let rcAmount = request.amount;

                let rcAmountPosition = storeService.findItemAmountPositionInStoreEntity(rcItemId, storeEntity);
                // let rcAmountPosition = storeService.findEmptySlotAmountInStoreEntity(storeEntity);
                if (rcAmountPosition == undefined) {
                    // log = await logService.updateLogItemTransaction("PREPARE_CASH_TO_RC", 'No available slot.', log);
                    // return res.status(400).json({ status: 400, message: 'No available slot.' });
                    rcAmountPosition = storeService.findEmptySlotAmountInStoreEntity(storeEntity);
                    if (rcAmountPosition == undefined) {
                        log = await logService.updateLogItemTransaction("PREPARE_CASH_TO_RC", 'No available slot.', log);
                        return res.status(400).json({ status: 400, message: 'No available slot.' });
                    }
                } else {
                    rcAmount = Number(storeEntity[rcAmountPosition]) + 1;
                }

                log = await logService.updateLogItemTransaction("PREPARE_UPDATE_CASH", undefined, log);
                userMsgExEntity.gold! -= cashTobeMinus;
                await SealMemberDataSource.manager.save(userMsgExEntity);

                log = await logService.updateLogItemTransaction("PREPARE_UPDATE_RC", undefined, log);
                const rcItemObj = storeService.setValueIntoStoreEntity(rcPosition, rcItemId);
                const rcAmountObj = storeService.setValueIntoStoreEntity(rcAmountPosition, rcAmount + request.amount! - 1);

                // let updateRcObj: store = storeEntity
                // const getAllDup = storeService.getAllDuplicatePosition(0, storeEntity);
                // for (let i = 0; i < rcAmount; i++) {
                //     updateRcObj = {
                //         ...updateRcObj,
                //         ...storeService.setValueIntoStoreEntity(getAllDup[i], rcItemId)
                //     }
                // }

                await GDB0101DataSource.manager.getRepository(store).save({
                    ...storeEntity,
                    // ...updateRcObj
                    ...rcItemObj,
                    ...rcAmountObj
                })

                log = await logService.updateLogItemTransaction("SUCCESS", `RC Amount: ${request.amount}, Cash Amount: ${cashTobeMinus}`, log);

            } else if (request.convertType == ConvertRCType.CRYSTAL_TO_CP) {

                const cegelTaxConfig = await SealMemberDataSource.manager.findOneBy(WebConfig, { configKey: WebConfigConstant.CRYSTAL_CONVERT_TAX });
                if (cegelTaxConfig == null) {
                    log = await logService.updateLogItemTransaction("PREPARE_CALCULATE_CRYSTAL", 'Configuration is not found', log);
                    return res.status(400).json({ status: 400, message: 'Configuration is not found.' })
                }

                if (storeEntity.segel < Number(cegelTaxConfig.configValue)) {
                    log = await logService.updateLogItemTransaction("PREPARE_CALCULATE_CRYSTAL", 'Insufficient cegel.', log);
                    return res.status(400).json({ status: 400, message: 'Insufficient cegel.' })
                }

                const crystalItemIdQuery = await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config').where('config.config_key = :key', { key: WebConfigConstant.CRYSTAL_ITEM_ID_CONFIG }).getOne();
                const crystalItemId = Number(crystalItemIdQuery?.configValue);

                const availableCrystalItem = storeService.countDuplicateItem(crystalItemId, storeEntity);
                if (availableCrystalItem < request.amount) {
                    log = await logService.updateLogItemTransaction("PREPARE_CALCULATE_CRYSTAL", 'Insufficient crystal.', log);
                    return res.status(400).json({ status: 400, message: 'Insufficient crystal.' });
                } else {
                    log = await logService.updateLogItemTransaction("UPDATE_CRYSTAL_ITEM", undefined, log);

                    let updateCrystalObj: store = storeEntity
                    const getAllDup = storeService.getAllDuplicatePosition(crystalItemId, storeEntity);
                    for (let i = 0; i < request.amount; i++) {
                        // updateCrystalObj.push(storeService.setValueIntoStoreEntity(getAllDup[i], 0))
                        updateCrystalObj = {
                            ...updateCrystalObj,
                            ...storeService.setValueIntoStoreEntity(getAllDup[i], 0)
                        } 
                        
                    }

                    await GDB0101DataSource.manager.getRepository(store).save({
                        ...storeEntity,
                        ...updateCrystalObj!
                    })

                }

                log = await logService.updateLogItemTransaction("UPDATE_CRYSTAL_POINT", undefined, log);
                const webUserDetail = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: currentUser.gameUserId });
                if (webUserDetail == null) {
                    log = await logService.updateLogItemTransaction("UPDATE_CRYSTAL_POINT", 'User is not found.', log);
                    return res.status(400).json({ status: 400, message: 'User is not found.' });
                }

                webUserDetail.crystalPoint += request.amount;
                await SealMemberDataSource.manager.save(webUserDetail);

                log = await logService.updateLogItemTransaction("CONVERT_CRYSTAL_COMPLETE", `Old Crystal Point: ${webUserDetail.crystalPoint - request.amount}, New Crystal Point: ${webUserDetail.crystalPoint}`, log);

            } else if (request.convertType == ConvertRCType.CP_TO_CRYSTAL) {

                log = await logService.updateLogItemTransaction("CP_TO_CRYSTAL", undefined, log);

                const webUserDetail = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: currentUser.gameUserId });
                if (webUserDetail == null) {
                    log = await logService.updateLogItemTransaction("UPDATE_CRYSTAL_POINT", 'User is not found.', log);
                    return res.status(400).json({ status: 400, message: 'User is not found.' });
                }
                const cpTobeMinus = request.amount!;

                if (cpTobeMinus > webUserDetail.crystalPoint) {
                    log = await logService.updateLogItemTransaction("CP_TO_CRYSTAL", 'Insufficient Crystal Point.', log);
                    return res.status(400).json({ status: 400, message: 'Insufficient Crystal Point.' });
                }
                const crystalItemId = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.CRYSTAL_ITEM_ID_CONFIG }).getOne())?.configValue));

                let availableSlot = storeService.getAllDuplicatePosition(0, storeEntity);
                if (availableSlot.length == 0) {
                    log = await logService.updateLogItemTransaction("CP_TO_CRYSTAL", 'Storage is full.', log);
                    return res.status(400).json({ status: 400, message: 'Storage is full.' });
                }

                log = await logService.updateLogItemTransaction("PREPARE_UPDATE_CP", undefined, log);
                webUserDetail.crystalPoint -= cpTobeMinus;
                await SealMemberDataSource.manager.save(webUserDetail);

                log = await logService.updateLogItemTransaction("PREPARE_UPDATE_CRYSTAL", undefined, log);
                
                let updateRcObj: store = storeEntity
                // const getAllDup = storeService.getAllDuplicatePosition(0, storeEntity);
                for (let i = 0; i < request.amount; i++) {
                    updateRcObj = {
                        ...updateRcObj,
                        ...storeService.setValueIntoStoreEntity(availableSlot[i], crystalItemId)
                    }
                }

                await GDB0101DataSource.manager.getRepository(store).save({
                    ...storeEntity,
                    ...updateRcObj
                })

                log = await logService.updateLogItemTransaction("SUCCESS", `Crystal Amount: ${request.amount}, CP Amount: ${cpTobeMinus}`, log);

            } else {
                // DO NOTHING
            }


            return res.sendStatus(200);

        } catch (error) {
            console.error(error);
            // log = await logService.updateLogItemTransaction(log.status, 'internal server error', log);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public convertCrystal = async (req: Request, res: Response) => {

        const currentUser = req.user as AuthenUser;
        const logService = new LogService();
        const storeService = new StoreService();
        let log = await logService.insertLogItemTransaction("CONVERT_CRYSTAL", "CONVERT_CRYSTAL", "PREPARE_CONVERT_CRYTAL", currentUser.gameUserId, undefined);

        try {

            const request = req.body as ConvertCrystalRequestDTO;
            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }

            const userMsgExEntity = await SealMemberDataSource.manager.findOneBy(usermsgex, { userId: currentUser.gameUserId });
            if (userMsgExEntity == null) {
                log = await logService.updateLogItemTransaction("PREPARE_CONVERT_CRYTAL", 'User ID is not exist.', log);
                return res.status(400).json({ status: 400, message: 'User ID is not exist.' })
            }

            let storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: currentUser.gameUserId });
            if (storeEntity == null) {
                log = await logService.updateLogItemTransaction("PREPARE_CONVERT_CRYTAL", 'Character is not exist.', log);
                return res.status(400).json({ status: 400, message: 'Character is not exist.' })
            }

            const cegelTaxConfig = await SealMemberDataSource.manager.findOneBy(WebConfig, { configKey: WebConfigConstant.CRYSTAL_CONVERT_TAX });
            if (cegelTaxConfig == null) {
                log = await logService.updateLogItemTransaction("PREPARE_CONVERT_CRYTAL", 'Configuration is not found', log);
                return res.status(400).json({ status: 400, message: 'Configuration is not found.' })
            }

            const crystalItemId = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.CRYSTAL_ITEM_ID_CONFIG }).getOne())?.configValue));

            const crystalItemPosition = storeService.findItemInStorentity(crystalItemId, storeEntity);
            if (crystalItemPosition == undefined) {
                log = await logService.updateLogItemTransaction("CALCULATE_CRYTAL", 'Insufficient crystal.', log);
                return res.status(400).json({ status: 400, message: 'Insufficient crystal.' });
            }

            const crystalAmountPosition = storeService.findItemAmountPositionInStoreEntity(crystalItemId, storeEntity);
            if (crystalAmountPosition == undefined) {
                log = await logService.updateLogItemTransaction("CALCULATE_CRYTAL", 'Insufficient crystal.', log);
                return res.status(400).json({ status: 400, message: 'Insufficient crystal.' });
            }

            const availableCrystalItem = storeEntity[crystalAmountPosition] as number;
            if (availableCrystalItem < request.crystalPoint) {
                log = await logService.updateLogItemTransaction("CALCULATE_CRYTAL", 'Insufficient crystal.', log);
                return res.status(400).json({ status: 400, message: 'Insufficient crystal.' });
            } else if (availableCrystalItem == request.crystalPoint) {

                const crystalItemObj = storeService.setValueIntoStoreEntity(crystalItemPosition, 0);
                const crystalAmountObj = storeService.setValueIntoStoreEntity(crystalAmountPosition, 0);

                log = await logService.updateLogItemTransaction("UPDATE_CRYSTAL_ITEM", undefined, log);
                await GDB0101DataSource.manager.getRepository(store).save({
                    ...storeEntity,
                    ...crystalItemObj,
                    ...crystalAmountObj
                })

            } else {
                log = await logService.updateLogItemTransaction("UPDATE_CRYSTAL_ITEM", undefined, log);
                await GDB0101DataSource.manager.decrement(store, { user_id: currentUser.gameUserId }, crystalAmountPosition, request.crystalPoint);
            }

            log = await logService.updateLogItemTransaction("UPDATE_CRYSTAL_POINT", undefined, log);
            const webUserDetail = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: currentUser.gameUserId });
            if (webUserDetail == null) {
                log = await logService.updateLogItemTransaction("UPDATE_CRYSTAL_POINT", 'User is not found.', log);
                return res.status(400).json({ status: 400, message: 'User is not found.' });
            }

            webUserDetail.crystalPoint += request.crystalPoint;
            await SealMemberDataSource.manager.save(webUserDetail);

            log = await logService.updateLogItemTransaction("CONVERT_CRYSTAL_COMPLETE", `Old Crystal Point: ${webUserDetail.crystalPoint - request.crystalPoint}, New Crystal Point: ${webUserDetail.crystalPoint}`, log);
            return res.sendStatus(200);

        } catch (error) {
            console.error(error);
            // log = await logService.updateLogItemTransaction(log.status, 'internal server error', log);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

}