import { GDB0101DataSource, ItemDataSource } from "../data-source";
import { store } from "../entity/gdb0101/store.entity";
import { SealItem } from "../entity/item/seal_item.entity";
import StoreService from "./store.service";

export default class ItemService {

    public insertAccountCashInventory = async (userId: string, itemId: number, itemAmount: number): Promise<string> => {

        if (!ItemDataSource.isInitialized) {
            await ItemDataSource.initialize();
        }
        
        // const cashItem = await ItemDataSource.manager.findOneBy(SealItem, { userId: userId, itemId: itemId });
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

    public insertBackInventory = async (userId: string, itemId: number, itemAmount: number) : Promise<string> => {

        if (!GDB0101DataSource.isInitialized) {
            await GDB0101DataSource.initialize();
        }
        
        const storeService = new StoreService();

        let storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: userId });
        if (storeEntity == null) {
            return 'Character is not exist.';
        }

        let itemPosition = storeService.findEmptySlotInStorentity(storeEntity);
        if (itemPosition == undefined) {
            return 'No available slot.';
        }

        let itemAmountPosition = storeService.findEmptySlotAmountInStoreEntity(storeEntity);
        if (itemAmountPosition == undefined) {
            return 'No available slot.';
        }

        const itemObj = storeService.setValueIntoStoreEntity(itemPosition, itemId);
        const itemAmountObj = storeService.setValueIntoStoreEntity(itemAmountPosition, itemAmount - 1);

        await GDB0101DataSource.manager.getRepository(store).save({
            ...storeEntity,
            ...itemObj,
            ...itemAmountObj
        })

        return '';

    }

}