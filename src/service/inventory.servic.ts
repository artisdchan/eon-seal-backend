import { inventory } from "../entity/gdb0101/inventory.entity";

export default class InventoryService {

    public findItemInInventoryntity = (itemId: number, entity: inventory) => {

        const result = (Object.keys(entity) as (keyof typeof entity)[]).find((key) => {

            if (entity[key] == itemId) {
                return entity[key] == itemId;
            }
          });

        return result;

    }

    public findEmptySlotInInventoryntity = (entity: inventory) => {

        const result = (Object.keys(entity) as (keyof typeof entity)[]).find((key) => {

            if (entity[key] == 0) {
                if (key.includes("it")) {
                    return entity[key] == 0;
                }
            }
          });

        return result;

    }

    public findEmptySlotAmountInInventoryEntity = (entity: inventory) => {

        const emptySlotPosition = this.findEmptySlotInInventoryntity(entity);
        if (emptySlotPosition == undefined) {
            return undefined;
        }

        type ObjectKey = keyof typeof entity;
        const itemAmountPosition = emptySlotPosition.replace("it", "io") as ObjectKey;
        return itemAmountPosition;
    }

    public findItemAmountPositionInInventoryEntity = (itemId: number, entity: inventory) => {

        const itemPosition = this.findItemInInventoryntity(itemId, entity);
            if (itemPosition == undefined) {
                return undefined;
            }

            type ObjectKey = keyof typeof entity;
            const itemAmountPosition = itemPosition.replace("it", "io") as ObjectKey;
            return itemAmountPosition;

    }

    public setValueIntoInventoryEntity = <K extends keyof inventory>(key: K, value: inventory[K]) => {
        const _inventory: inventory = Object.assign({}, inventory); // Consider also the ES6 spread operator here
        _inventory[key] = value;
        return _inventory;
    };

}