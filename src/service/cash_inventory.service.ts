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

    public setValueIntoCashInventoryEntity = <K extends keyof CashInventory>(key: K, value: CashInventory[K]) => {
        const _CashInventory: CashInventory = Object.assign({}, CashInventory); // Consider also the ES6 spread operator here
        _CashInventory[key] = value;
        return _CashInventory;
    };

}