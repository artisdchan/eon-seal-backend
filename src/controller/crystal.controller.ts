import { Request, Response } from "express";
import { GDB0101DataSource, ItemDataSource, LogItemDataSource, SealMemberDataSource } from "../data-source";
import { AuthenUser } from "../dto/authen.dto";
import { CrystalShopRequestDTO, CrystalShopResponseDTO, PurchaseCrystalShopRequestDTO } from "../dto/crystal.dto";
import { getOffSet, getPageination, PaginationAndDataResponse } from "../dto/pagination.dto";
import { CashInventory } from "../entity/gdb0101/cash_inventory.entity";
import { store } from "../entity/gdb0101/store.entity";
import { CrystalItemBag, CrystalItemStatus, CrystalItemType, CrystalShop } from "../entity/item/crystal_shop.entity";
import { SealItem } from "../entity/item/seal_item.entity";
import { CrystalShopPurchaseHistory } from "../entity/log_item/log_crystal_purchase.entity";
import { WebConfig, WebConfigConstant } from "../entity/seal_member/web_config.entity";
import { WebUserDetail } from "../entity/seal_member/web_user_detail.entity";
import CashInventoryService from "../service/cash_inventory.service";
import LogService from "../service/log.service";
import StoreService from "../service/store.service";
import { startOfToday, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { Between, LessThan, MoreThan } from "typeorm";
import { FusionItemConfig, ItemLevel, ItemType } from "../entity/item/fusion_item.entity";
import ItemService from "../service/item.service";

export default class CrystalController {

    public purchase = async (req: Request, res: Response) => {

        const logService = new LogService();
        const currentUser = req.user as AuthenUser;
        const type = req.params.type

        let log = await logService.insertLogItemTransaction(`${type.toUpperCase()}_SHOP`, "PURCHASE_ITEM", "PREPARE_PROCESS", currentUser.gameUserId, undefined);

        try {

            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            if (!ItemDataSource.isInitialized) {
                await ItemDataSource.initialize();
            }
            if (!LogItemDataSource.isInitialized) {
                await LogItemDataSource.initialize();
            }

            const request = req.body as PurchaseCrystalShopRequestDTO;

            const webUserDetail = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: currentUser.gameUserId, status: 'ACTIVE' });
            if (webUserDetail == null) {
                log = await logService.updateLogItemTransaction("FAIL", 'User ID is not exist.', log);
                return res.status(400).json({ status: 400, message: 'User is not found.' });
            }

            let crystalShop = await ItemDataSource.manager.findOneBy(CrystalShop, { id: request.purchasedId, status: CrystalItemStatus.ACTIVE });
            if (crystalShop == null) {
                log = await logService.updateLogItemTransaction("FAIL", 'Invalid request.', log);
                return res.status(400).json({ status: 400, message: 'Invalid request.' });
            }

            // check available crystal point
            if (webUserDetail.crystalPoint < crystalShop.priceCrystal) {
                log = await logService.updateLogItemTransaction("FAIL", 'Insufficient crystal.', log);
                return res.status(400).json({ status: 400, message: 'Insufficient crystal.' })
            }

            let purchaseCount = 0;
            let dateFrom: Date = new Date
            let dateTo: Date = new Date
            if (crystalShop.itemType == CrystalItemType.DAILY) {
                dateFrom = startOfToday();
                dateTo = endOfDay(new Date);
            } else if (crystalShop.itemType == CrystalItemType.WEEKLY) {
                dateFrom = startOfWeek(new Date, { weekStartsOn: 1 })
                dateTo = endOfWeek(new Date, { weekStartsOn: 1 })
            } else if (crystalShop.itemType == CrystalItemType.MONTHLY) {
                dateFrom = startOfMonth(new Date)
                dateTo = endOfMonth(new Date)
            }
            purchaseCount = await LogItemDataSource.manager.countBy(CrystalShopPurchaseHistory, { actionUserId: currentUser.gameUserId, purchasedCrystalShopId: crystalShop.id, purchasedTime: Between(dateFrom, dateTo) })
            // account purchase reach limit and not able to purchase over limit.
            if (crystalShop.accountPurchaseLimit != 0 && crystalShop.accountPurchaseLimit <= purchaseCount && !crystalShop.enablePurchaseOverLimit) {
                log = await logService.updateLogItemTransaction("FAIL", 'The item has been reached purchase limit.', log);
                return res.status(400).json({ status: 400, message: 'The item has been reached purchase limit.' })
            }

            // global purchase reach limit and not able to purchase over limit
            if (crystalShop.globalPurchaseLimit != 0 && crystalShop.globalPurchaseLimit <= crystalShop.countGlobalPurchase) {
                log = await logService.updateLogItemTransaction("FAIL", 'The item has been reached global purchase limit.', log);
                return res.status(400).json({ status: 400, message: 'The item has been reached purchase limit.' })
            }

            log = await logService.updateLogItemTransaction("PREPARE_UPDATE_CRYSTAL_POINT", undefined, log);
            // calculate price
            let priceCrystal = crystalShop.priceCrystal;
            let priceCegel = crystalShop.priceCegel;
            let priceRedDragon = crystalShop.priceRedDragon;
            let priceBlueDragon = crystalShop.priceBlueDragon;

            if (crystalShop.accountPurchaseLimit != 0 && crystalShop.accountPurchaseLimit <= purchaseCount && crystalShop.enablePurchaseOverLimit) {
                // const tmp = (Math.floor(purchaseCount + 1 / crystalShop.accountPurchaseLimit)).toFixed(0);
                const tmp = (purchaseCount + 1 / crystalShop.accountPurchaseLimit).toFixed(0);
                if (purchaseCount + 1 > 9 ) {
                    log = await logService.updateLogItemTransaction("FAIL", 'The item has been reached purchase limit.', log);
                    return res.status(400).json({ status: 400, message: 'The item has been reached purchase limit.' })
                }
                priceCrystal = Math.ceil(priceCrystal + ((priceCrystal * crystalShop.overLimitPricePercent / 100) * (Number(tmp))))
                priceCegel = Math.ceil(priceCegel + ((priceCegel * crystalShop.overLimitPricePercent / 100) * (Number(tmp))))
                priceRedDragon = Math.ceil(priceRedDragon + ((priceRedDragon * crystalShop.overLimitPricePercent / 100) * (Number(tmp))))
                priceBlueDragon = Math.ceil(priceBlueDragon + ((priceBlueDragon * crystalShop.overLimitPricePercent / 100 * (Number(tmp)))))
            }

            if (priceRedDragon != 0 || priceBlueDragon != 0) {

                const storeService = new StoreService();

                let storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: currentUser.gameUserId });
                if (storeEntity == null) {
                    log = await logService.updateLogItemTransaction("PREPARE_UPDATE_DRAGON_POINT", 'Insufficient dragon point.', log);
                    return res.status(400).json({ status: 400, message: 'Insufficient dragon point.' })
                }

                let blueDragonAmount = 0;
                let redDragonAmount = 0;

                const blueDragonItemIdConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.BLUE_DRAGON_ITEM_ID_CONFIG }).getOne())?.configValue));
                const redDragonItemIdConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RED_DRAGON_ITEM_ID_CONFIG }).getOne())?.configValue));

                const blueDragonItemPos = await storeService.getAllDuplicatePosition(blueDragonItemIdConfig, storeEntity);
                for (let each of blueDragonItemPos) {
                    const amountPos = storeService.findItemAmountPositionFromItemPosition(each, storeEntity);
                    blueDragonAmount += Number(storeEntity[amountPos]) + 1
                }

                const redDragonItemPos = await storeService.getAllDuplicatePosition(redDragonItemIdConfig, storeEntity);
                for (let each of redDragonItemPos) {
                    const amountPos = storeService.findItemAmountPositionFromItemPosition(each, storeEntity);
                    redDragonAmount += Number(storeEntity[amountPos]) + 1
                }

                // blueDragonAmount = storeService.countDuplicateItem(blueDragonItemIdConfig, storeEntity)
                // redDragonAmount = storeService.countDuplicateItem(redDragonItemIdConfig, storeEntity)

                if (blueDragonAmount < priceBlueDragon || redDragonAmount < priceRedDragon) {
                    log = await logService.updateLogItemTransaction("PREPARE_UPDATE_DRAGON_POINT", 'Insufficient dragon point.', log);
                    return res.status(400).json({ status: 400, message: 'Insufficient dragon point.' })
                }

                if (priceRedDragon != 0) {
                    if (priceRedDragon == redDragonAmount) {

                        log = await logService.updateLogItemTransaction("PREPARE_UPDATE_RED_DRAGON", undefined, log);

                        let updateRcObj: store = storeEntity
                        for (let each of redDragonItemPos) {
                            const amountPos = storeService.findItemAmountPositionFromItemPosition(each, storeEntity);
                            updateRcObj = {
                                ...updateRcObj,
                                ...storeService.setValueIntoStoreEntity(each, 0),
                                ...storeService.setValueIntoStoreEntity(amountPos, 0)
                            }
                        }

                        await GDB0101DataSource.manager.getRepository(store).save({
                            ...updateRcObj
                        })

                    } else {
                        log = await logService.updateLogItemTransaction("PREPARE_UPDATE_RED_DRAGON", undefined, log);
                        let leftAmount = priceRedDragon
                        let updateRcObj: store = storeEntity

                        for (let each of redDragonItemPos) {
                            const amountPos = storeService.findItemAmountPositionFromItemPosition(each, storeEntity);
                            if (Number(storeEntity[amountPos]) + 1 == leftAmount) {
                                leftAmount = 0;
                                updateRcObj = {
                                    ...updateRcObj,
                                    ...storeService.setValueIntoStoreEntity(each, 0),
                                    ...storeService.setValueIntoStoreEntity(amountPos, 0)
                                }
                            } else if (Number(storeEntity[amountPos]) + 1 > leftAmount) {
                                // leftAmount = 0;
                                updateRcObj = {
                                    ...updateRcObj,
                                    ...storeService.setValueIntoStoreEntity(amountPos, (Number(storeEntity[amountPos]) - leftAmount))
                                }
                            } else if (Number(storeEntity[amountPos]) + 1 < leftAmount) {
                                leftAmount -= (Number(storeEntity[amountPos]) + 1)
                                updateRcObj = {
                                    ...updateRcObj,
                                    ...storeService.setValueIntoStoreEntity(each, 0),
                                    ...storeService.setValueIntoStoreEntity(amountPos, 0)
                                }
                            }
                        }

                        await GDB0101DataSource.manager.getRepository(store).save({
                            ...updateRcObj
                        })
                    }
                }

                if (priceBlueDragon != 0) {
                    if (priceBlueDragon == blueDragonAmount) {

                        log = await logService.updateLogItemTransaction("PREPARE_UPDATE_RED_DRAGON", undefined, log);

                        let updateRcObj: store = storeEntity
                        for (let each of blueDragonItemPos) {
                            const amountPos = storeService.findItemAmountPositionFromItemPosition(each, storeEntity);
                            updateRcObj = {
                                ...updateRcObj,
                                ...storeService.setValueIntoStoreEntity(each, 0),
                                ...storeService.setValueIntoStoreEntity(amountPos, 0)
                            }
                        }

                        await GDB0101DataSource.manager.getRepository(store).save({
                            ...updateRcObj
                        })

                    } else {
                        log = await logService.updateLogItemTransaction("PREPARE_UPDATE_RED_DRAGON", undefined, log);
                        let leftAmount = priceBlueDragon
                        let updateRcObj: store = storeEntity

                        for (let each of blueDragonItemPos) {
                            const amountPos = storeService.findItemAmountPositionFromItemPosition(each, storeEntity);
                            if (Number(storeEntity[amountPos]) + 1 == leftAmount) {
                                leftAmount = 0;
                                updateRcObj = {
                                    ...updateRcObj,
                                    ...storeService.setValueIntoStoreEntity(each, 0),
                                    ...storeService.setValueIntoStoreEntity(amountPos, 0)
                                }
                            } else if (Number(storeEntity[amountPos]) + 1 > leftAmount) {
                                // leftAmount = 0;
                                updateRcObj = {
                                    ...updateRcObj,
                                    ...storeService.setValueIntoStoreEntity(amountPos, (Number(storeEntity[amountPos]) - leftAmount))
                                }
                            } else if (Number(storeEntity[amountPos]) + 1 < leftAmount) {
                                leftAmount -= (Number(storeEntity[amountPos]) + 1)
                                updateRcObj = {
                                    ...updateRcObj,
                                    ...storeService.setValueIntoStoreEntity(each, 0),
                                    ...storeService.setValueIntoStoreEntity(amountPos, 0)
                                }
                            }
                        }

                        await GDB0101DataSource.manager.getRepository(store).save({
                            ...updateRcObj
                        })
                    }
                }

            }

            // reduct crystal point
            webUserDetail.crystalPoint -= priceCrystal
            await SealMemberDataSource.manager.save(webUserDetail);

            log = await logService.updateLogItemTransaction("PREPARE_UPDATE_CRYSTAL_POINT", undefined, log);
            if (priceCegel != 0) {
                const storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: currentUser.gameUserId });
                if (!storeEntity || storeEntity.segel < priceCegel) {

                    log = await logService.updateLogItemTransaction("PREPARE_UPDATE_CRYSTAL_POINT", 'Insufficient cegel.', log);
                    return res.status(400).json({ status: 400, message: 'Insufficient cegel.' })
                }
            }

            const itemService = new ItemService()
            log = await logService.updateLogItemTransaction("PREPARE_INVENTORY", undefined, log);
            let errMsg = "";
            // add item into store
            if (crystalShop.itemBag == CrystalItemBag.IN_GAME_ITEM_INVENTORY) {
                // errMsg = await this.insertInGameInventory(currentUser.gameUserId, crystalShop.itemId, crystalShop.itemAmount, priceCegel);
                errMsg = await this.insertInGameInventory(currentUser.gameUserId, crystalShop.itemId, crystalShop.itemAmount, priceCegel, crystalShop.itemEffect, crystalShop.itemRefine);
                if (errMsg != "") {
                    log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg, log);
                    return res.status(400).json({ status: 400, message: errMsg });
                }
            } else if (crystalShop.itemBag == CrystalItemBag.ACCOUNT_CASH_INVENTORY) {
                errMsg = await this.insertAccountCashInventory(currentUser.gameUserId, crystalShop.itemId, crystalShop.itemAmount, crystalShop.itemEffect, crystalShop.itemRefine);
                if (errMsg != "") {
                    log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg, log);
                    return res.status(400).json({ status: 400, message: errMsg });
                }
            } else if (crystalShop.itemBag == CrystalItemBag.CHARACTER_CASH_INVENTORY) {
                // errMsg = await this.insertCharacterCashInventory(currentUser.gameUserId, request.characterName, crystalShop.itemId, crystalShop.itemAmount);
                // if (errMsg != "") {
                //     log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg, log);
                //     return res.status(400).json({ status: 400, message: errMsg });
                // }
            } else if (crystalShop.itemBag == CrystalItemBag.RANDOM_COSTUME_RARE) {
                const randomItem = await this.randomCostume(ItemLevel.RARE);
                errMsg = await this.insertAccountCashInventory(currentUser.gameUserId, randomItem.itemId, 1, 0, 0);
                if (errMsg != "") {
                    log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg, log);
                    return res.status(400).json({ status: 400, message: errMsg });
                }
            } else if (crystalShop.itemBag == CrystalItemBag.RANDOM_COSTUME_EPIC) {
                const randomItem = await this.randomCostume(ItemLevel.EPIC);
                errMsg = await this.insertAccountCashInventory(currentUser.gameUserId, randomItem.itemId, 1, 0, 0);
                if (errMsg != "") {
                    log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg, log);
                    return res.status(400).json({ status: 400, message: errMsg });
                }
            } else {
                // DO NOTHING
            }

            // update global count
            crystalShop.countGlobalPurchase++;
            crystalShop = await ItemDataSource.manager.save(CrystalShop, crystalShop);

            log = await logService.updateLogItemTransaction("SUCCESS", `Successfully purchase item from Crystal Shop.`, log);
            await LogItemDataSource.manager.save(CrystalShopPurchaseHistory, {
                actionUserId: currentUser.gameUserId,
                purchasedItemId: crystalShop.itemId,
                purchasedCegelPrice: priceCegel,
                purchasedCrystalPrice: priceCrystal,
                purchasedTime: new Date,
                purchasedCrystalShopId: crystalShop.id,
                purchasedRedDragonPrice: priceRedDragon,
                purchasedBlueDragonPrice: priceBlueDragon,
            })

            return res.sendStatus(200);

        } catch (error) {
            console.error(error);
            // log = await logService.updateLogItemTransaction("FAIL", 'internal server error.', log);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    private randomCostume = async (level: ItemLevel): Promise<FusionItemConfig> => {
        const fusionItemEntityList = await ItemDataSource.manager.findBy(FusionItemConfig, {
            itemType: ItemType.COSTUME,
            itemLevel: level
        });

        const ranNum = Math.floor(Math.random() * (fusionItemEntityList.length - 1 + 1) + 1)

        return fusionItemEntityList[ranNum - 1];
    }

    public getCystalShopList = async (req: Request, res: Response) => {
        try {

            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            if (!ItemDataSource.isInitialized) {
                await ItemDataSource.initialize();
            }
            if (!LogItemDataSource.isInitialized) {
                await LogItemDataSource.initialize();
            }

            const currentUser = req.user as AuthenUser;
            const type = req.params.type;
            const { page, perPage, itemType, itemName } = req.query as unknown as CrystalShopRequestDTO;

            const query = await ItemDataSource.manager.getRepository(CrystalShop).createQueryBuilder('crystalShop').where('crystalShop.status = :status', { status: 'ACTIVE' }).andWhere('crystalShop.shopType = :type', { type: String(type).toUpperCase() });
            if (itemType) {
                query.andWhere('crystalShop.item_type = :itemType', { itemType: itemType });
            }

            if (itemName) {
                query.andWhere('crystalShop.item_name LIKE :itemName', { itemName: `%${itemName}%` });
            }

            const offSet = getOffSet(page, perPage);
            const [crystalShop, count] = await query.limit(perPage).offset(offSet).getManyAndCount();
            const crystalResponseDTOList: CrystalShopResponseDTO[] = []

            for (let eachCrystalShop of crystalShop) {

                // const purchaseCount = await LogItemDataSource.manager.countBy(CrystalShopPurchaseHistory, { purchasedCrystalShopId: eachCrystalShop.id, actionUserId: currentUser.gameUserId });

                let purchaseCount = 0;
                if (eachCrystalShop.itemType == CrystalItemType.DAILY) {
                    const dateFrom = startOfToday();
                    const dateTo = endOfDay(new Date);
                    purchaseCount = await LogItemDataSource.manager.countBy(CrystalShopPurchaseHistory, { actionUserId: currentUser.gameUserId, purchasedCrystalShopId: eachCrystalShop.id, purchasedTime: Between(dateFrom, dateTo) })
                } else if (eachCrystalShop.itemType == CrystalItemType.WEEKLY) {
                    const dateFrom = startOfWeek(new Date, { weekStartsOn: 1 })
                    const dateTo = endOfWeek(new Date, { weekStartsOn: 1 })
                    purchaseCount = await LogItemDataSource.manager.countBy(CrystalShopPurchaseHistory, { actionUserId: currentUser.gameUserId, purchasedCrystalShopId: eachCrystalShop.id, purchasedTime: Between(dateFrom, dateTo) })
                } else if (eachCrystalShop.itemType == CrystalItemType.MONTHLY) {
                    const dateFrom = startOfMonth(new Date)
                    const dateTo = endOfMonth(new Date)
                    purchaseCount = await LogItemDataSource.manager.countBy(CrystalShopPurchaseHistory, { actionUserId: currentUser.gameUserId, purchasedCrystalShopId: eachCrystalShop.id, purchasedTime: Between(dateFrom, dateTo) })
                }
                let price = eachCrystalShop.priceCrystal;
                let priceCegel = eachCrystalShop.priceCegel;
                let priceRedDragon = eachCrystalShop.priceRedDragon;
                let priceBlueDragon = eachCrystalShop.priceBlueDragon;
                let isBuyable = true;

                if (eachCrystalShop.itemType != CrystalItemType.UNLIMIT) {

                    // calculate price if purchase count is more than account limit and able to purchase over limit
                    if (eachCrystalShop.accountPurchaseLimit != 0 && eachCrystalShop.accountPurchaseLimit <= purchaseCount) {
                        if (!eachCrystalShop.enablePurchaseOverLimit) {
                            isBuyable = false;
                        } else {
                            // const tmp = (Math.floor(purchaseCount + 1 / eachCrystalShop.accountPurchaseLimit)).toFixed(0);
                            const tmp = (purchaseCount + 1 / eachCrystalShop.accountPurchaseLimit).toFixed(0);
                            if (purchaseCount + 1 > 9) {
                                isBuyable = false;
                            } else {
                                price = Math.floor(price + Math.floor(((price * eachCrystalShop.overLimitPricePercent / 100) * (Number(tmp)))))
                                priceCegel = Math.ceil(priceCegel + ((priceCegel * eachCrystalShop.overLimitPricePercent / 100) * (Number(tmp))))
                                priceRedDragon = Math.ceil(priceRedDragon + ((priceRedDragon * eachCrystalShop.overLimitPricePercent / 100) * (Number(tmp))))
                                priceBlueDragon = Math.ceil(priceBlueDragon + ((priceBlueDragon * eachCrystalShop.overLimitPricePercent / 100 * (Number(tmp)))))
                            }
                        }
                    }

                    if (eachCrystalShop.globalPurchaseLimit != 0 && eachCrystalShop.globalPurchaseLimit < eachCrystalShop.countGlobalPurchase) {
                        isBuyable = false;
                    }

                }

                const crystalShopResponseDTO: CrystalShopResponseDTO = {
                    id: eachCrystalShop.id,
                    itemId: eachCrystalShop.itemId,
                    itemName: eachCrystalShop.itemName,
                    itemAmount: eachCrystalShop.itemAmount,
                    itemPicture: eachCrystalShop.itemPicture,
                    itemType: eachCrystalShop.itemType,
                    globalPurchaseLimit: eachCrystalShop.globalPurchaseLimit,
                    globalPurchaseCount: eachCrystalShop.countGlobalPurchase,
                    accountPurchaseLimit: eachCrystalShop.accountPurchaseLimit,
                    accountPurchaseCount: purchaseCount,
                    itemCrystalPrice: price,
                    itemCegelPrice: priceCegel,
                    itemRedDragonPrice: priceRedDragon,
                    itemBlueDragonPrice: priceBlueDragon,
                    isBuyable: isBuyable,
                    itemBag: eachCrystalShop.itemBag
                }

                crystalResponseDTOList.push(crystalShopResponseDTO);

            }

            const response: PaginationAndDataResponse = {
                status: 200,
                data: crystalResponseDTOList,
                metadata: getPageination(perPage, count, page)
            }

            return res.status(200).json(response);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public getMoney = async (req: Request, res: Response) => {

        try {

            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            if (!ItemDataSource.isInitialized) {
                await ItemDataSource.initialize();
            }
            if (!LogItemDataSource.isInitialized) {
                await LogItemDataSource.initialize();
            }

            const currentUser = req.user as AuthenUser;
            const storeService = new StoreService();

            const webUserDetail = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: currentUser.gameUserId, status: 'ACTIVE' });
            if (webUserDetail == null) {
                return res.status(400).json({ status: 400, message: 'User is not found.' });
            }

            let storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: currentUser.gameUserId });
            if (storeEntity == null) {
                return res.status(400).json({ status: 400, message: 'User is not found.' });
            }

            let rcAmount = 0;
            const rcItemId = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RC_ITEM_ID_CONFIG }).getOne())?.configValue));
            const rcAmountPosition = await storeService.getAllDuplicatePosition(rcItemId, storeEntity);
            for (let each of rcAmountPosition) {
                const amountPos = storeService.findItemAmountPositionFromItemPosition(each, storeEntity);
                rcAmount += Number(storeEntity[amountPos]) + 1
            }

            const cegelAmount = storeEntity.segel;

            let blueDragonAmount = 0;
            let redDragonAmount = 0;
            let crystalAmount = 0;

            const blueDragonItemIdConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.BLUE_DRAGON_ITEM_ID_CONFIG }).getOne())?.configValue));
            const redDragonItemIdConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RED_DRAGON_ITEM_ID_CONFIG }).getOne())?.configValue));
            const crystalItemIdConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.CRYSTAL_ITEM_ID_CONFIG }).getOne())?.configValue));

            const blueDragonAmountPosition = await storeService.getAllDuplicatePosition(blueDragonItemIdConfig, storeEntity);
            for (let each of blueDragonAmountPosition) {
                const amountPos = storeService.findItemAmountPositionFromItemPosition(each, storeEntity);
                blueDragonAmount += Number(storeEntity[amountPos]) + 1
            }

            const redDragonAmountPosition = await storeService.getAllDuplicatePosition(redDragonItemIdConfig, storeEntity);
            for (let each of redDragonAmountPosition) {
                const amountPos = storeService.findItemAmountPositionFromItemPosition(each, storeEntity);
                redDragonAmount += Number(storeEntity[amountPos]) + 1
            }

            const crystalAmountPosition = await storeService.getAllDuplicatePosition(crystalItemIdConfig, storeEntity);
            for (let each of crystalAmountPosition) {
                const amountPos = storeService.findItemAmountPositionFromItemPosition(each, storeEntity);
                crystalAmount += Number(storeEntity[amountPos]) + 1
            }

            return res.status(200).json({
                status: 200, data: {
                    crystalPoint: webUserDetail.crystalPoint,
                    cegel: cegelAmount,
                    rcAmount: rcAmount,
                    redDragonAmount: redDragonAmount,
                    blueDragonAmount: blueDragonAmount,
                    crystalAmount: crystalAmount
                }
            })


        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    private insertInGameInventory = async (userId: string, itemId: number, itemAmount: number, cegelPrice: number, itemEffect: number, itemRefine: number): Promise<string> => {

        const storeService = new StoreService();

        let storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: userId });
        if (storeEntity == null) {
            return 'Character is not exist.';
        }

        if (storeEntity.segel < cegelPrice) {
            return 'Insufficient cegel.'
        }

        storeEntity.segel -= cegelPrice;

        const emptyPosList = storeService.getAllDuplicatePosition(0, storeEntity);
        if (emptyPosList == null || emptyPosList.length < itemAmount) {
            return 'No available slot.'
        }

        let updateObj = storeEntity
        for (let i = 0; i < itemAmount; i++) {

            // let itemPosition = storeService.findEmptySlotInStorentity(storeEntity);
            // if (itemPosition == undefined) {
            //     return 'No available slot.';
            // }

            let itemAmountPosition = storeService.findItemAmountPositionFromItemPosition(emptyPosList[i], storeEntity);
            if (itemAmountPosition == undefined) {
                return 'No available slot.';
            }

            let itemEffectPosition = storeService.findItemEffectPositionInStoreEntity(emptyPosList[i], storeEntity)
            if (itemEffectPosition == undefined) {
                return 'No available slot.';
            }

            let itemRefinePosition = storeService.findItemRefinePositionInStoreEntity(emptyPosList[i], storeEntity)
            if (itemRefinePosition == undefined) {
                return 'No available slot.';
            }

            const itemObj = storeService.setValueIntoStoreEntity(emptyPosList[i], itemId);
            const itemAmountObj = storeService.setValueIntoStoreEntity(itemAmountPosition, 0);
            const itemEffectObj = storeService.setValueIntoStoreEntity(itemEffectPosition, itemEffect);
            const itemRefineObj = storeService.setValueIntoStoreEntity(itemRefinePosition, itemRefine)

            updateObj = {
                ...updateObj,
                ...itemObj,
                ...itemAmountObj,
                ...itemEffectObj,
                ...itemRefineObj
            }

        }

        await GDB0101DataSource.manager.getRepository(store).save({
            ...storeEntity,
            ...updateObj,
        })
        // let itemPosition = storeService.findEmptySlotInStorentity(storeEntity);
        // if (itemPosition == undefined) {
        //     return 'No available slot.';
        // }

        // let itemAmountPosition = storeService.findEmptySlotAmountInStoreEntity(storeEntity);
        // if (itemAmountPosition == undefined) {
        //     return 'No available slot.';
        // }

        // const itemObj = storeService.setValueIntoStoreEntity(itemPosition, itemId);
        // const itemAmountObj = storeService.setValueIntoStoreEntity(itemAmountPosition, itemAmount - 1);

        // await GDB0101DataSource.manager.getRepository(store).save({
        //     ...storeEntity,
        //     ...itemObj,
        //     ...itemAmountObj
        // })

        return "";
    }

    private insertAccountCashInventory = async (userId: string, itemId: number, itemAmount: number, itemEffect: number, itemRefineOrLimit: number): Promise<string> => {

        await ItemDataSource.manager.save(SealItem, {
            itemId: itemId,
            ItemOp1: itemAmount - 1,
            ItemOp2: itemEffect,
            ItemLimit: itemRefineOrLimit,
            userId: userId,
            OwnerDate: new Date,
            bxaid: 'BUY'
        });

        return "";
    }

    private insertCharacterCashInventory = async (userId: string, characterName: string, itemId: number, itemAmount: number): Promise<string> => {

        const cashInventoryService = new CashInventoryService();

        const cashInventoryEntity = await GDB0101DataSource.manager.createQueryBuilder()
            .select("cashInventory")
            .from(CashInventory, "cashInventory")
            .where("cashInventory.char_name = (:charName)", { charName: characterName })
            .getOne();
        if (cashInventoryEntity == null) {
            return "Character is not found."
        }

        let itemPosition = cashInventoryService.findItemInCashInventoryntity(itemId, cashInventoryEntity);
        if (itemPosition == undefined) {
            itemPosition = cashInventoryService.findEmptySlotInCashInventoryntity(cashInventoryEntity);
            if (itemPosition == undefined) {
                return 'No available slot.';
            }
        }
        let itemAmountPosition = cashInventoryService.findItemAmountPositionInCashInventoryEntity(itemId, cashInventoryEntity);
        if (itemAmountPosition == undefined) {
            itemAmountPosition = cashInventoryService.findEmptySlotAmountInCashInventoryEntity(cashInventoryEntity);
            if (itemAmountPosition == undefined) {
                return 'No available slot.';
            }
        } else {
            itemAmount = Number(cashInventoryEntity[itemAmountPosition]) + itemAmount;
        }

        const itemobj = (cashInventoryService.setValueIntoCashInventoryEntity(itemPosition, itemId));
        const amountObj = (cashInventoryService.setValueIntoCashInventoryEntity(itemAmountPosition, itemAmount));

        await GDB0101DataSource.manager.getRepository(CashInventory).save({
            ...cashInventoryEntity,
            ...itemobj,
            ...amountObj
        })

        return "";
    }

}