import { Request, Response } from "express";
import { GDB0101DataSource, ItemDataSource, SealMemberDataSource } from "../data-source";
import { BuyBackCpRequest, ItemDetail, MarketItemResponseDTO, RemoveItemRequest, ValidateItemRequest } from "../dto/market.dto";
import { CashInventory } from "../entity/gdb0101/cash_inventory.entity";
import { pc } from "../entity/gdb0101/pc.entity";
import { store } from "../entity/gdb0101/store.entity";
import { MarketWhiteList, WhiteListItemBag } from "../entity/item/market_white_list.entity";
import { SealItem } from "../entity/item/seal_item.entity";
import { usermsgex } from "../entity/seal_member/usermsgex.entity";
import { WebUserDetail } from "../entity/seal_member/web_user_detail.entity";
import CashInventoryService from "../service/cash_inventory.service";
import LogService from "../service/log.service";
import StoreService from "../service/store.service";
import { EONHUB_API_KEY } from "../utils/secret.utils";

export default class MarketController {

    public getUserWhitListItem = async (req: Request, res: Response) => {
        try {

            const storeService = new StoreService();
            const cashInventoryService = new CashInventoryService();
            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            if (!ItemDataSource.isInitialized) {
                await ItemDataSource.initialize();
            }
            const { email } = req.query

            const requestApiKey = req.get('API-KEY') as string;
            if (requestApiKey != EONHUB_API_KEY) {
                console.error('Invalid API-KEY.');
                return res.sendStatus(401);
            }

            const userMsgExEntity = await SealMemberDataSource.manager.findOneBy(usermsgex, { email: String(email) })
            if (userMsgExEntity == null) {
                return res.status(400).json({ status: 400, message: 'Game ID is not found' })
            }

            // Find Character name
            const pcEntityList = await GDB0101DataSource.manager.findBy(pc, { user_id: userMsgExEntity.userId });
            if (pcEntityList == null) {
                return res.status(400).json({ status: 400, message: 'Character is not found.' });
            }

            for (let eacPc of pcEntityList) {
                if (eacPc.play_flag > 0) {
                    return res.status(400).json({ status: 400, message: 'Please offline and wait 5 minutes before further process.' })
                }
            }

            const characterName: string[] = [];
            pcEntityList.map((each) => characterName.push(each.char_name));

            const storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: userMsgExEntity.userId });

            // Find cash item in cash_inventory by character names
            const cashInventoryEntity = await GDB0101DataSource.manager.createQueryBuilder()
                .select("cashInventory")
                .from(CashInventory, "cashInventory")
                .where("cashInventory.char_name IN (:...charNames)", { charNames: characterName })
                .getMany();

            let charBag: ItemDetail[] = []
            let accountBag: ItemDetail[] = []

            const whiteListItem = await ItemDataSource.manager.find(MarketWhiteList);

            for (let eachWhiteList of whiteListItem) {

                if (eachWhiteList.itemBag == WhiteListItemBag.ACCOUNT_CASH_INVENTORY) {

                    const sealItemEntity = await ItemDataSource.manager.findBy(SealItem, { userId: userMsgExEntity.userId });
                    for (let each of sealItemEntity) {
                        if (each.itemId == eachWhiteList.itemId) {
                            accountBag.push({
                                itemId: eachWhiteList.itemId,
                                itemName: eachWhiteList.itemName,
                                refineLevel: 0,
                                itemOption: each.ItemOp1,
                                itemEffectCode: Number(each.ItemOp2),
                                itemEffectMessage: '',
                                itemPictureUrl: eachWhiteList.itemPictureUrl,
                                itemBag: eachWhiteList.itemBag,
                                itemType: eachWhiteList.itemType,
                                itemAmount: each.ItemOp1
                            })
                        }
                    }

                } else if (eachWhiteList.itemBag == WhiteListItemBag.IN_GAME_ITEM_INVENTORY) {

                    if (storeEntity != null) {
                        const itemPosition = storeService.getAllDuplicatePosition(eachWhiteList.itemId, storeEntity);
                        for (let eachItemPos of itemPosition) {
                            if (eachItemPos != undefined) {
                                const tmp: keyof store = eachItemPos
                                const itemEffectPos = storeService.findItemEffectPositionInStoreEntity(tmp, storeEntity);
                                const itemRefinePos = storeService.findItemRefinePositionInStoreEntity(tmp, storeEntity);
                                const itemAmountPos = storeService.findItemAmountPositionFromItemPosition(tmp, storeEntity);
                                accountBag.push({
                                    itemId: eachWhiteList.itemId,
                                    itemName: eachWhiteList.itemName,
                                    refineLevel: Number(storeEntity[itemRefinePos]),
                                    itemEffectCode: Number(storeEntity[itemEffectPos]),
                                    // TODO translate effect code
                                    itemEffectMessage: '',
                                    itemOption: Number(storeEntity[itemAmountPos]),
                                    itemPictureUrl: eachWhiteList.itemPictureUrl,
                                    itemBag: eachWhiteList.itemBag,
                                    itemType: eachWhiteList.itemType,
                                    itemAmount: 1
                                })
                            }
                        }
                    }

                } else if (eachWhiteList.itemBag == WhiteListItemBag.CHARACTER_CASH_INVENTORY) {

                    for (let eachCashInv of cashInventoryEntity) {
                        const itemPosition = cashInventoryService.getAllDuplicatePosition(eachWhiteList.itemId, eachCashInv);
                        for (let eachItemPos of itemPosition) {
                            if (eachItemPos != undefined) {
                                const itemEffectPos = cashInventoryService.findItemEffectPositionInStoreEntity(eachItemPos, eachCashInv)
                                const itemRefinePos = cashInventoryService.findItemRefinePositionInStoreEntity(eachItemPos, eachCashInv)
                                const itemOptionPos = cashInventoryService.findItemAmountPositionFromItemPosition(eachItemPos, eachCashInv)
                                charBag.push({
                                    itemId: eachWhiteList.itemId,
                                    itemName: eachWhiteList.itemName,
                                    refineLevel: Number(eachCashInv[itemRefinePos]),
                                    itemEffectCode: Number(eachCashInv[itemEffectPos]),
                                    // TODO translate effect code
                                    itemEffectMessage: '',
                                    itemOption: Number(eachCashInv[itemOptionPos]),
                                    itemPictureUrl: eachWhiteList.itemPictureUrl,
                                    itemBag: eachWhiteList.itemBag,
                                    itemType: eachWhiteList.itemType,
                                    itemAmount: 1
                                })
                            }
                        }
                    }

                }

            }

            const response: MarketItemResponseDTO = {
                accountBag: accountBag,
                characterBag: charBag
            }

            return res.status(200).json({ status: 200, data: response })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public buyBackCp = async (req: Request, res: Response) => {

        try {

            const requestApiKey = req.get('API-KEY') as string;
            if (requestApiKey != EONHUB_API_KEY) {
                console.error('Invalid API-KEY.');
                return res.status(401).json({ status: 401, message: 'unauthorized' });
            }

            const logService = new LogService()
            const request = req.body as BuyBackCpRequest

            const webUser = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: request.gameUserId, status: 'ACTIVE' })
            if (webUser == null) {
                return res.status(400).json({ status: 400, message: 'invalid game user' })
            }

            let log = await logService.insertLogItemTransaction("SWAP", 'CP_TO_EON_POINT', "PREPARE_SWAP", webUser.user_id, undefined);

            const storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: request.gameUserId })
            if (storeEntity == null) {
                log = await logService.updateLogItemTransaction("CP_TO_EON_POINT", 'invalid game user', log);
                return res.status(400).json({ status: 400, message: 'invalid game user' })
            }

            if (request.cpAmount > webUser.crystalPoint) {
                log = await logService.updateLogItemTransaction("CP_TO_EON_POINT", `Insufficient CP Amount. Require: ${request.cpAmount} CP.`, log);
                return res.status(400).json({ status: 400, message: 'Insufficient CP Amount' })
            }

            // if (request.cegelAmount > storeEntity.segel) {
            //     log = await logService.updateLogItemTransaction("CP_TO_EON_POINT", `Insufficient Cegel Amount. Require: ${request.cegelAmount} Cegel.`, log);
            //     return res.status(400).json({ status: 400, message: 'Insufficient Cegel Amount' })
            // }

            // storeEntity.segel -= request.cegelAmount
            // await GDB0101DataSource.manager.save(storeEntity)

            webUser.crystalPoint -= request.cpAmount
            await SealMemberDataSource.manager.save(webUser)

            await logService.updateLogItemTransaction("DONE", `Successfuly swap ${request.cpAmount} CP to EON Point.`, log)

            return res.status(200).json({ status: 200, data: null })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public validateItem = async (req: Request, res: Response) => {
        try {

            const requestApiKey = req.get('API-KEY') as string;
            if (requestApiKey != EONHUB_API_KEY) {
                console.error('Invalid API-KEY.');
                return res.status(401).json({ status: 401, message: 'unauthorized' });
            }

            const request = req.body as ValidateItemRequest

            const whiteListItem = await ItemDataSource.manager.findOneBy(MarketWhiteList, { itemId: request.itemId, itemBag: request.itemBag })
            if (whiteListItem == null) {
                return res.status(400).json({ status: 400, message: 'invalid item.' })
            }

            const userMsgExEntity = await SealMemberDataSource.manager.findOneBy(usermsgex, { email: request.email })
            if (userMsgExEntity == null) {
                return res.status(400).json({ status: 400, message: 'invalid user' })
            }

            // Find Character name
            const pcEntityList = await GDB0101DataSource.manager.findBy(pc, { user_id: userMsgExEntity.userId });
            if (pcEntityList == null) {
                return res.status(400).json({ status: 400, message: 'Character is not found.' });
            }

            for (let eacPc of pcEntityList) {
                if (eacPc.play_flag > 0) {
                    return res.status(400).json({ status: 400, message: 'Please offline and wait 5 minutes before further process.' })
                }
            }

            const characterName: string[] = [];
            pcEntityList.map((each) => characterName.push(each.char_name));

            let response: ItemDetail

            if (request.itemBag == WhiteListItemBag.CHARACTER_CASH_INVENTORY) {
                const cashInventoryService = new CashInventoryService()
                // Find cash item in cash_inventory by character names
                const cashInventoryEntity = await GDB0101DataSource.manager.createQueryBuilder()
                    .select("cashInventory")
                    .from(CashInventory, "cashInventory")
                    .where("cashInventory.char_name IN (:...charNames)", { charNames: characterName })
                    .getMany();

                for (let eachCashInv of cashInventoryEntity) {
                    const itemPosition = cashInventoryService.getAllDuplicatePosition(whiteListItem.itemId, eachCashInv);
                    for (let eachItemPos of itemPosition) {
                        if (eachItemPos != undefined) {
                            const itemEffectPos = cashInventoryService.findItemEffectPositionInStoreEntity(eachItemPos, eachCashInv)
                            const itemRefinePos = cashInventoryService.findItemRefinePositionInStoreEntity(eachItemPos, eachCashInv)
                            const itemOptionPos = cashInventoryService.findItemAmountPositionFromItemPosition(eachItemPos, eachCashInv)

                            if (Number(eachCashInv[itemEffectPos]) == request.itemEffectCode && Number(eachCashInv[itemRefinePos]) == request.itemRefine && Number(eachCashInv[itemOptionPos]) == request.itemOption) {
                                response = {
                                    itemId: whiteListItem.itemId,
                                    itemName: whiteListItem.itemName,
                                    refineLevel: Number(eachCashInv[itemRefinePos]),
                                    itemEffectCode: Number(eachCashInv[itemEffectPos]),
                                    // TODO translate effect code
                                    itemEffectMessage: '',
                                    itemOption: Number(eachCashInv[itemOptionPos]),
                                    itemPictureUrl: whiteListItem.itemPictureUrl,
                                    itemBag: whiteListItem.itemBag,
                                    itemType: whiteListItem.itemType,
                                    itemAmount: 1
                                }
                                return res.status(200).json({ status: 200, data: response })
                            }
                        }
                    }
                }

            } else if (request.itemBag == WhiteListItemBag.ACCOUNT_CASH_INVENTORY) {

                const sealItemEntity = await ItemDataSource.manager.findOneBy(SealItem, { userId: userMsgExEntity.userId, itemId: request.itemId, ItemOp1: request.itemOption, ItemOp2: request.itemEffectCode, ItemLimit: request.itemRefine });
                if (sealItemEntity != null) {
                    response = {
                        itemId: whiteListItem.itemId,
                        itemName: whiteListItem.itemName,
                        refineLevel: sealItemEntity.ItemLimit,
                        itemOption: sealItemEntity.ItemOp1,
                        itemEffectCode: Number(sealItemEntity.ItemOp2),
                        itemEffectMessage: '',
                        itemPictureUrl: whiteListItem.itemPictureUrl,
                        itemBag: whiteListItem.itemBag,
                        itemType: whiteListItem.itemType,
                        itemAmount: sealItemEntity.ItemOp1
                    }
                    return res.status(200).json({ status: 200, data: response })
                }
            }

            return res.status(400).json({ status: 400, message: 'invalid item' })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public removeItem = async (req: Request, res: Response) => {
        try {

            const requestApiKey = req.get('API-KEY') as string;
            if (requestApiKey != EONHUB_API_KEY) {
                console.error('Invalid API-KEY.');
                return res.status(401).json({ status: 401, message: 'unauthorized' });
            }

            const request = req.body as RemoveItemRequest

            const whiteListItem = await ItemDataSource.manager.findOneBy(MarketWhiteList, { itemId: request.itemId, itemBag: request.itemBag })
            if (whiteListItem == null) {
                return res.status(400).json({ status: 400, message: 'invalid item.' })
            }

            const userMsgExEntity = await SealMemberDataSource.manager.findOneBy(usermsgex, { email: request.email })
            if (userMsgExEntity == null) {
                return res.status(400).json({ status: 400, message: 'invalid user' })
            }

            // Find Character name
            const pcEntityList = await GDB0101DataSource.manager.findBy(pc, { user_id: userMsgExEntity.userId });
            if (pcEntityList == null) {
                return res.status(400).json({ status: 400, message: 'Character is not found.' });
            }

            for (let eacPc of pcEntityList) {
                if (eacPc.play_flag > 0) {
                    return res.status(400).json({ status: 400, message: 'Please offline and wait 5 minutes before further process.' })
                }
            }

            const characterName: string[] = [];
            pcEntityList.map((each) => characterName.push(each.char_name));

            if (request.itemBag == WhiteListItemBag.CHARACTER_CASH_INVENTORY) {
                const cashInventoryService = new CashInventoryService()
                // Find cash item in cash_inventory by character names
                const cashInventoryEntity = await GDB0101DataSource.manager.createQueryBuilder()
                    .select("cashInventory")
                    .from(CashInventory, "cashInventory")
                    .where("cashInventory.char_name IN (:...charNames)", { charNames: characterName })
                    .getMany();

                for (let eachCashInv of cashInventoryEntity) {
                    const itemPosition = cashInventoryService.getAllDuplicatePosition(whiteListItem.itemId, eachCashInv);
                    for (let eachItemPos of itemPosition) {
                        if (eachItemPos != undefined) {
                            const itemEffectPos = cashInventoryService.findItemEffectPositionInStoreEntity(eachItemPos, eachCashInv)
                            const itemRefinePos = cashInventoryService.findItemRefinePositionInStoreEntity(eachItemPos, eachCashInv)
                            const itemOptionPos = cashInventoryService.findItemAmountPositionFromItemPosition(eachItemPos, eachCashInv)

                            if (Number(eachCashInv[itemEffectPos]) == request.itemEffectCode && Number(eachCashInv[itemRefinePos]) == request.itemRefine && Number(eachCashInv[itemOptionPos]) == request.itemOption) {

                                const itemObj = cashInventoryService.setValueIntoCashInventoryEntity(eachItemPos, 0)
                                const itemEffectObj = cashInventoryService.setValueIntoCashInventoryEntity(itemEffectPos, 0)
                                const itemRefindObj = cashInventoryService.setValueIntoCashInventoryEntity(itemRefinePos, 0)
                                const itemOptionObj = cashInventoryService.setValueIntoCashInventoryEntity(itemOptionPos, 0)

                                await GDB0101DataSource.manager.getRepository(CashInventory).save({
                                    ...eachCashInv,
                                    ...itemObj,
                                    ...itemEffectObj,
                                    ...itemRefindObj,
                                    ...itemOptionObj,
                                })

                                return res.status(200).json({ status: 200, data: null })
                            }
                        }
                    }
                }

            } else if (request.itemBag == WhiteListItemBag.ACCOUNT_CASH_INVENTORY) {

                const sealItemEntity = await ItemDataSource.manager.findOneBy(SealItem, { userId: userMsgExEntity.userId, itemId: request.itemId, ItemOp1: request.itemOption, ItemOp2: request.itemEffectCode, ItemLimit: request.itemRefine });
                if (sealItemEntity != null) {

                    await ItemDataSource.manager.getRepository(SealItem).delete(sealItemEntity)

                    return res.status(200).json({ status: 200, data: null })
                }
            }

            return res.status(400).json({ status: 400, message: 'invalid item' })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

}