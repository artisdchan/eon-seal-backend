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

    public getAllDuplicatePosition = (itemId: number, entity: inventory) => {

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

    public findItemAmountPositionFromItemPosition = (itemPosition: keyof inventory, entity: inventory) => {

        // const itemPosition = this.findItemInStorentity(itemId, entity);
        // if (itemPosition == undefined) {
        //     return undefined;
        // }

        type ObjectKey = keyof typeof entity;
        const itemAmountPosition = itemPosition.replace("it", "io") as ObjectKey;
        return itemAmountPosition;

    }

    public findItemEffectPositionInStoreEntity = (itemPosition: keyof inventory, entity: inventory) => {

        // const itemPosition = this.findItemInStorentity(itemId, entity);
        // if (itemPosition == undefined) {
        //     return undefined;
        // }

        type ObjectKey = keyof typeof entity;
        const itemEffectPosition = itemPosition.replace("it", "ioo") as ObjectKey;
        return itemEffectPosition;

    }

    public findItemRefinePositionInStoreEntity = (itemPosition: keyof inventory, entity: inventory) => {

        // const itemPosition = this.findItemInStorentity(itemId, entity);
        // if (itemPosition == undefined) {
        //     return undefined;
        // }

        type ObjectKey = keyof typeof entity;
        const itemRefinePosition = itemPosition.replace("it", "is") as ObjectKey;
        return itemRefinePosition;

    }

    public setValueIntoInventoryEntity = <K extends keyof inventory>(key: K, value: inventory[K]) => {
        const _inventory: inventory = Object.assign({}, inventory); // Consider also the ES6 spread operator here
        _inventory[key] = value;
        return _inventory;
    };

}