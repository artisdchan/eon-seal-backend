import { Request, Response } from "express";
import { GDB0101DataSource, ItemDataSource, LogItemDataSource, SealMemberDataSource } from "../data-source";
import { AuthenUser } from "../dto/authen.dto";
import { PurchaseCrystalShopRequestDTO } from "../dto/crystal.dto";
import { CashInventory } from "../entity/gdb0101/cash_inventory.entity";
import { store } from "../entity/gdb0101/store.entity";
import { CrystalItemBag, CrystalShop } from "../entity/item/crystal_shop.entity";
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

            const crystalShop = await ItemDataSource.manager.findOneBy(CrystalShop, { id: request.purchasedId });
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
            let price = crystalShop.priceCrystal;

            if (crystalShop.accountPurchaseLimit != 0 && crystalShop.accountPurchaseLimit <= purchaseCount && crystalShop.enablePurchaseOverLimit) {
                price = price + (price * crystalShop.overLimitPricePercent / 100)
            }

            // reduct crystal point
            webUserDetail.crystalPoint -= price
            await ItemDataSource.manager.save(webUserDetail);

            log = await logService.updateLogItemTransaction("PREPARE_INVENTORY", undefined, log);
            let errMsg = "";
            // add item into store
            if (crystalShop.itemBag == CrystalItemBag.IN_GAME_INVENTORY) {
                errMsg = await this.insertInGameInventory(currentUser.gameUserId, crystalShop.itemId, crystalShop.itemAmount);
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
                errMsg = await this.insertCharacterCashInventory(currentUser.gameUserId, request.characterName, crystalShop.itemId, crystalShop.itemAmount);
                if (errMsg != "") {
                    log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg, log);
                    return res.status(400).json({ status: 400, message: errMsg });
                }
            } else {
                // DO NOTHING
            }

            log = await logService.updateLogItemTransaction("SUCCESS", `Successfully purchase item from Crystal Shop.`, log);
            await LogItemDataSource.manager.save(CrystalShopPurchaseHistory, {
                actionUserId: currentUser.gameUserId,
                purchasedItemId: crystalShop.itemId,
                purchasedCrystalPrice: crystalShop.priceCrystal,
                purchasedTime: new Date,
                purchasedCrystalShopId: crystalShop.id
            })

            return res.sendStatus(200);

        } catch (error) {
            console.error(error);
            log = await logService.updateLogItemTransaction("FAIL", 'internal server error.', log);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    private insertInGameInventory = async (userId: string, itemId: number, itemAmount: number): Promise<string> => {

        const storeService = new StoreService();

        let storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: userId });
        if (storeEntity == null) {
            return 'Character is not exist.';
        }

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

        await ItemDataSource.manager.save(SealItem, {
            itemId: itemId,
            ItemOp1: itemAmount - 1,
            ItemOp2: 0,
            ItemLimit: 0,
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