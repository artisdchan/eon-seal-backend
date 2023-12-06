import { ItemDataSource } from "../data-source";
import { SealItem } from "../entity/item/seal_item.entity";

export default class ItemService {

    public insertAccountCashInventory = async (userId: string, itemId: number, itemAmount: number): Promise<string> => {

        if (!ItemDataSource.isInitialized) {
            await ItemDataSource.initialize();
        }
        
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

}