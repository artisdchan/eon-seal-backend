import { CashInventory } from "../entity/gdb0101/cash_inventory.entity";

export default class CashInventoryService {

    public findItemInCashInventoryntity = (itemId: number, entity: CashInventory) => {

        const result = (Object.keys(entity) as (keyof typeof entity)[]).find((key) => {

            if (entity[key] == itemId) {
                return entity[key] == itemId;
            }
          });

        return result;

    }

    public findEmptySlotInCashInventoryntity = (entity: CashInventory) => {

        const result = (Object.keys(entity) as (keyof typeof entity)[]).find((key) => {

            if (entity[key] == 0) {
                if (key.includes("it")) {
                    return entity[key] == 0;
                }
            }
          });

        return result;

    }

    public findEmptySlotAmountInCashInventoryEntity = (entity: CashInventory) => {

        const emptySlotPosition = this.findEmptySlotInCashInventoryntity(entity);
        if (emptySlotPosition == undefined) {
            return undefined;
        }

        type ObjectKey = keyof typeof entity;
        const itemAmountPosition = emptySlotPosition.replace("it", "io") as ObjectKey;
        return itemAmountPosition;
    }

    public findItemAmountPositionInCashInventoryEntity = (itemId: number, entity: CashInventory) => {

        const itemPosition = this.findItemInCashInventoryntity(itemId, entity);
            if (itemPosition == undefined) {
                return undefined;
            }

            type ObjectKey = keyof typeof entity;
            const itemAmountPosition = itemPosition.replace("it", "io") as ObjectKey;
            return itemAmountPosition;

    }

    public findItemAmountPositionFromItemPosition = (itemPosition: keyof CashInventory, entity: CashInventory) => {

        // const itemPosition = this.findItemInStorentity(itemId, entity);
        // if (itemPosition == undefined) {
        //     return undefined;
        // }

        type ObjectKey = keyof typeof entity;
        const itemAmountPosition = itemPosition.replace("it", "io") as ObjectKey;
        return itemAmountPosition;

    }

    public findItemEffectPositionInStoreEntity = (itemPosition: keyof CashInventory, entity: CashInventory) => {

        // const itemPosition = this.findItemInStorentity(itemId, entity);
        // if (itemPosition == undefined) {
        //     return undefined;
        // }

        type ObjectKey = keyof typeof entity;
        const itemEffectPosition = itemPosition.replace("it", "ioo") as ObjectKey;
        return itemEffectPosition;

    }

    public findItemRefinePositionInStoreEntity = (itemPosition: keyof CashInventory, entity: CashInventory) => {

        // const itemPosition = this.findItemInStorentity(itemId, entity);
        // if (itemPosition == undefined) {
        //     return undefined;
        // }

        type ObjectKey = keyof typeof entity;
        const itemRefinePosition = itemPosition.replace("it", "is") as ObjectKey;
        return itemRefinePosition;

    }

    public countDuplicateItem = (itemId: number, entity: CashInventory) => {

        let count = 0;
        const result = (Object.keys(entity) as (keyof typeof entity)[]).find((key) => {

            if (entity[key] == itemId) {
                count++;
            }
        });

        return count;

    }

    public getAllDuplicatePosition = (itemId: number, entity: CashInventory) => {

        let temp: any[] = []
        const result = (Object.keys(entity) as (keyof typeof entity)[]).find((key) => {

            if (entity[key] == itemId) {
                if (key.includes("it")) {
                    temp.push(key)
                }
            }
        });

        return temp;

    }

    public setValueIntoCashInventoryEntity = <K extends keyof CashInventory>(key: K, value: CashInventory[K]) => {
        const _CashInventory: CashInventory = Object.assign({}, CashInventory); // Consider also the ES6 spread operator here
        _CashInventory[key] = value;
        return _CashInventory;
    };

}