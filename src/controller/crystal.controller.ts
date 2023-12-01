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
import { WebUserDetail } from "../entity/seal_member/web_user_detail.entity";
import CashInventoryService from "../service/cash_inventory.service";
import LogService from "../service/log.service";
import StoreService from "../service/store.service";

export default class CrystalController {

    public purchase = async (req: Request, res: Response) => {

        const logService = new LogService();
        const currentUser = req.user as AuthenUser;

        let log = await logService.insertLogItemTransaction("CRYSTAL_SHOP", "PURCHASE_ITEM", "PREPARE_PROCESS", currentUser.gameUserId, undefined);

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

            const webUserDetail = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: currentUser.gameUserId });
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

            const purchaseCount = await LogItemDataSource.manager.countBy(CrystalShopPurchaseHistory, { actionUserId: currentUser.gameUserId, purchasedCrystalShopId: crystalShop.id })
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

            if (crystalShop.accountPurchaseLimit != 0 && crystalShop.accountPurchaseLimit <= purchaseCount && crystalShop.enablePurchaseOverLimit) {
                priceCrystal = Math.ceil(priceCrystal + (priceCrystal * crystalShop.overLimitPricePercent / 100)) 
                priceCegel = Math.ceil(priceCegel + (priceCegel * crystalShop.overLimitPricePercent / 100))
            }

            // reduct crystal point
            webUserDetail.crystalPoint -= priceCrystal
            await SealMemberDataSource.manager.save(webUserDetail);

            log = await logService.updateLogItemTransaction("PREPARE_INVENTORY", undefined, log);
            let errMsg = "";
            // add item into store
            if (crystalShop.itemBag == CrystalItemBag.IN_GAME_ITEM_INVENTORY) {
                errMsg = await this.insertInGameInventory(currentUser.gameUserId, crystalShop.itemId, crystalShop.itemAmount, priceCegel);
                if (errMsg != "") {
                    log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg, log);
                    return res.status(400).json({ status: 400, message: errMsg });
                }
            } else if (crystalShop.itemBag == CrystalItemBag.ACCOUNT_CASH_INVENTORY) {
                errMsg = await this.insertAccountCashInventory(currentUser.gameUserId, crystalShop.itemId, crystalShop.itemAmount);
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
                purchasedCrystalShopId: crystalShop.id
            })

            return res.sendStatus(200);

        } catch (error) {
            console.error(error);
            // log = await logService.updateLogItemTransaction("FAIL", 'internal server error.', log);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
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
            const { page, perPage, itemType, itemName } = req.query as unknown as CrystalShopRequestDTO;

            const query = await ItemDataSource.manager.getRepository(CrystalShop).createQueryBuilder('crystalShop').where('crystalShop.status = :status', { status: 'ACTIVE' });
            if (itemType) {
                query.andWhere('crystalShop.item_type = :itemType', { itemType });
            }

            if (itemName) {
                query.andWhere('crystalShop.item_name LIKE :itemName', { itemName: `%${itemName}%` });
            }

            const offSet = getOffSet(page, perPage);
            const [crystalShop, count] = await query.limit(perPage).offset(offSet).getManyAndCount();
            const crystalResponseDTOList: CrystalShopResponseDTO[] = []

            for (let eachCrystalShop of crystalShop) {

                const purchaseCount = await LogItemDataSource.manager.countBy(CrystalShopPurchaseHistory, { purchasedCrystalShopId: eachCrystalShop.id, actionUserId: currentUser.gameUserId });
                let price = eachCrystalShop.priceCrystal;
                let priceCegel = eachCrystalShop.priceCegel;
                let isBuyable = true;

                if (eachCrystalShop.itemType != CrystalItemType.UNLIMIT) {

                    // calculate price if purchase count is more than account limit and able to purchase over limit
                    if (eachCrystalShop.accountPurchaseLimit != 0 && eachCrystalShop.accountPurchaseLimit <= purchaseCount) {
                        if (!eachCrystalShop.enablePurchaseOverLimit) {
                            isBuyable = false;
                        } else {
                            price = Math.ceil(price + (price * eachCrystalShop.overLimitPricePercent / 100));
                            priceCegel = Math.ceil(priceCegel + (priceCegel * eachCrystalShop.overLimitPricePercent / 100));
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
           
            const webUserDetail = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: currentUser.gameUserId });
            if (webUserDetail == null) {
                return res.status(400).json({ status: 400, message: 'User is not found.' });
            }

            let storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: currentUser.gameUserId });
            if (storeEntity == null) {
                return res.status(400).json({ status: 400, message: 'User is not found.' });
            }

            return res.status(200).json({ status: 200, data: {
                crystalPoint: webUserDetail.crystalPoint,
                cegel: storeEntity.segel
            }})
    

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    private insertInGameInventory = async (userId: string, itemId: number, itemAmount: number, cegelPrice: number): Promise<string> => {

        const storeService = new StoreService();

        let storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: userId });
        if (storeEntity == null) {
            return 'Character is not exist.';
        }

        if (storeEntity.segel < cegelPrice) {
            return 'Insufficient cegel.'
        }

        storeEntity.segel -= cegelPrice;

        let itemPosition = storeService.findItemInStorentity(itemId, storeEntity);
        if (itemPosition == undefined) {
            itemPosition = storeService.findEmptySlotInStorentity(storeEntity);
            if (itemPosition == undefined) {
                return 'No available slot.';
            }
        }

        let itemAmountPosition = storeService.findItemAmountPositionInStoreEntity(itemId, storeEntity);
        if (itemAmountPosition == undefined) {
            itemAmountPosition = storeService.findEmptySlotAmountInStoreEntity(storeEntity);
            if (itemAmountPosition == undefined) {
                return 'No available slot.';
            }
        } else {
            itemAmount = Number(storeEntity[itemAmountPosition]) + itemAmount;
        }

        const itemObj = storeService.setValueIntoStoreEntity(itemPosition, itemId);
        const itemAmountObj = storeService.setValueIntoStoreEntity(itemAmountPosition, itemAmount);

        await GDB0101DataSource.manager.getRepository(store).save({
            ...storeEntity,
            ...itemObj,
            ...itemAmountObj
        })

        return "";
    }

    private insertAccountCashInventory = async (userId: string, itemId: number, itemAmount: number): Promise<string> => {

        const cashItem = await ItemDataSource.manager.findOneBy(SealItem, { userId: userId, itemId: itemId });
        if (cashItem == null) {
            await ItemDataSource.manager.save(SealItem, {
                itemId: itemId,
                ItemOp1: itemAmount - 1,
                ItemOp2: 0,
                ItemLimit: 0,
                userId: userId,
                OwnerDate: new Date,
                bxaid: 'BUY'
            });
        } else {
            cashItem.ItemOp1 += itemAmount;
            await ItemDataSource.manager.save(SealItem, cashItem);
        }


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