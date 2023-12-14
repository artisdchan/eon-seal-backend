import { GDB0101DataSource, ItemDataSource } from "../data-source";
import { store } from "../entity/gdb0101/store.entity";
import { FusionItemConfig, ItemLevel, ItemType } from "../entity/item/fusion_item.entity";
import { SealItem } from "../entity/item/seal_item.entity";
import StoreService from "./store.service";

export default class ItemService {

    public insertAccountCashInventory = async (userId: string, itemId: number, itemAmount: number, itemEffect: number, itemLimit: number): Promise<string> => {

        if (!ItemDataSource.isInitialized) {
            await ItemDataSource.initialize();
        }
        
        // const cashItem = await ItemDataSource.manager.findOneBy(SealItem, { userId: userId, itemId: itemId });
        await ItemDataSource.manager.save(SealItem, {
            itemId: itemId,
            ItemOp1: itemAmount - 1,
            ItemOp2: itemEffect,
            ItemLimit: itemLimit,
            userId: userId,
            OwnerDate: new Date,
            bxaid: 'BUY'
        });


        return "";
    }

    public insertStackItem = async (userId: string, itemId: number, itemAmount: number, itemEffect: number, itemRefine: number) : Promise<string> => {
        
        const storeService = new StoreService();

        const storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: userId });
        if (storeEntity == null) {
            return 'Character is not exist.';
        }

        let updateObj = storeEntity
        let itemPosition = storeService.findEmptySlotInStorentity(storeEntity);
        if (itemPosition == undefined) {
            return 'No available slot.'
        }
        
        let itemAmountPosition = storeService.findItemAmountPositionFromItemPosition(itemPosition, storeEntity)
        if (itemAmountPosition == undefined) {
            return 'No available slot.'
        }

        const itemObj = storeService.setValueIntoStoreEntity(itemPosition, itemId);
        const itemAmountObj = storeService.setValueIntoStoreEntity(itemAmountPosition, itemAmount - 1);
        updateObj = {
            ...updateObj,
            ...itemObj,
            ...itemAmountObj,
        }

        await GDB0101DataSource.manager.getRepository(store).save({
            ...storeEntity,
            ...updateObj,
        })

        return '';
    }

    public insertBackInventory = async (userId: string, itemId: number, itemAmount: number, itemEffect: number, itemRefine: number) : Promise<string> => {

        if (!GDB0101DataSource.isInitialized) {
            await GDB0101DataSource.initialize();
        }
        
        const storeService = new StoreService();

        let storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: userId });
        if (storeEntity == null) {
            return 'Character is not exist.';
        }

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

        return '';

    }

    public randomCostume = async (level: ItemLevel): Promise<FusionItemConfig> => {
        const fusionItemEntityList = await ItemDataSource.manager.findBy(FusionItemConfig, {
            itemType: ItemType.COSTUME,
            itemLevel: level
        });

        const ranNum = Math.floor(Math.random() * (fusionItemEntityList.length - 1 + 1) + 1)

        return fusionItemEntityList[ranNum - 1];
    }


}