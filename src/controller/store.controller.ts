import { Request, Response, NextFunction } from "express";
import { GDB0101DataSource, SealMemberDataSource } from "../data-source";
import { AuthenUser } from "../dto/authen.dto";
import { ConvertRCRequestDTO, ConvertRCType } from "../dto/store.dto";
import { log_item_transaction } from "../entity/log.entity";
import { store } from "../entity/store.entity";
import { usermsgex } from "../entity/usermsgex.entity";
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
            const rcItemId: number = 27232;
            // TODO Get RC Item ID From DB config

            const rcAmountPosition = storeService.findItemAmountPositionInStoreEntity(rcItemId, storeEntity);
            if (rcAmountPosition == undefined) {
                return res.status(200).json({ status: 200, totalRcAmount: 0 });
            }

            const rcAmount = Number(storeEntity[rcAmountPosition]) + 1;

            return res.status(200).json({ status: 200, totalRcAmount: rcAmount });

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
        let log = await logService.insertLogItemTransaction("CONVERT_RC", request.convertType.toString(), "PREPARE_CONVERT_RC", currentUser.gameUserId);
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

            const rcItemId: number = 27232;
            // TODO Get RC Item ID From DB config
            const cashPerRc = 1000;
            // TODO Get from DB config

            if (request.convertType == ConvertRCType.RC_TO_CASH) {
                log = await logService.updateLogItemTransaction("PREPARE_RC_AND_CASH", undefined, log);

                const rcPosition = storeService.findItemInStorentity(rcItemId, storeEntity);
                const rcAmountPosition = storeService.findItemAmountPositionInStoreEntity(rcItemId, storeEntity);

                if (rcPosition == undefined || rcAmountPosition == undefined) {
                    log = await logService.updateLogItemTransaction("PREPARE_RC_AND_CASH", 'Insufficient RC Amount.', log);
                    return res.status(400).json({ status: 400, message: 'Insufficient RC Amount.' });
                }

                const rcAmount = Number(storeEntity[rcAmountPosition]) + 1;

                if (request.rcAmount! > rcAmount) {
                    log = await logService.updateLogItemTransaction("PREPARE_RC_AND_CASH", 'Invalid RC Amount.', log);
                    return res.status(400).json({ status: 400, message: 'Invalid RC Amount.' });
                }

                log = await logService.updateLogItemTransaction("PREPARE_CALCULATE_RC", undefined, log);
                await GDB0101DataSource.manager.decrement(store, { user_id: currentUser.gameUserId }, rcAmountPosition, request.rcAmount!);

                log = await logService.updateLogItemTransaction("PREPARE_CALCULATE_CASH", undefined, log);
                const cashToBeAdd = request.rcAmount! * cashPerRc;
                userMsgExEntity.gold! += cashToBeAdd;
                await SealMemberDataSource.manager.save(userMsgExEntity);

                log = await logService.updateLogItemTransaction("SUCCESS", `RC Amount: ${request.rcAmount}, Cash Amount: ${cashToBeAdd}`, log);

            } else if (request.convertType == ConvertRCType.CASH_TO_RC) {

                log = await logService.updateLogItemTransaction("PREPARE_RC_AND_CASH", undefined, log);
                const cashTobeMinus = request.rcAmount! * cashPerRc;

                if (cashTobeMinus > userMsgExEntity.gold!) {
                    log = await logService.updateLogItemTransaction("PREPARE_RC_AND_CASH", 'Insufficient Cash Point.', log);
                    return res.status(400).json({ status: 400, message: 'Insufficient Cash Point.' });
                }

                let rcPosition = storeService.findItemInStorentity(rcItemId, storeEntity);
                let rcAmount = 0;
                if (rcPosition == undefined) {
                    rcPosition = storeService.findEmptySlotInStorentity(storeEntity);
                    if (rcPosition == undefined) {
                        log = await logService.updateLogItemTransaction("PREPARE_RC_AND_CASH", 'No available slot.', log);
                        return res.status(400).json({ status: 400, message: 'No available slot.' });
                    }
                }

                let rcAmountPosition = storeService.findItemAmountPositionInStoreEntity(rcItemId, storeEntity);
                if (rcAmountPosition == undefined) {
                    rcAmountPosition = storeService.findEmptySlotAmountInStoreEntity(storeEntity);
                    if (rcAmountPosition == undefined) {
                        log = await logService.updateLogItemTransaction("PREPARE_RC_AND_CASH", 'No available slot.', log);
                        return res.status(400).json({ status: 400, message: 'No available slot.' });
                    }
                } else {
                    rcAmount = Number(storeEntity[rcAmountPosition]) + 1;
                }

                log = await logService.updateLogItemTransaction("PREPARE_CALCULATE_CASH", undefined, log);
                userMsgExEntity.gold! -= cashTobeMinus;
                await SealMemberDataSource.manager.save(userMsgExEntity);

                log = await logService.updateLogItemTransaction("PREPARE_CALCULATE_RC", undefined, log);
                const rcItemObj = storeService.setValueIntoStoreEntity(rcPosition, rcItemId);
                const rcAmountObj = storeService.setValueIntoStoreEntity(rcAmountPosition, rcAmount + request.rcAmount! - 1);
                
                await GDB0101DataSource.manager.getRepository(store).save({
                    ...storeEntity,
                    ...rcItemObj,
                    ...rcAmountObj
                })

                log = await logService.updateLogItemTransaction("SUCCESS", `RC Amount: ${request.rcAmount}, Cash Amount: ${cashTobeMinus}`, log);

            } else {
                // DO NOTHING
            }


            return res.sendStatus(200);

        } catch (error) {
            console.error(error);
            log = await logService.updateLogItemTransaction(log.status, 'internal server error', log);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

}