import { GDB0101DataSource } from "../data-source";
import { StoreEntity2 } from "../dto/store.dto";
import { store } from "../entity/gdb0101/store.entity";

export default class Store2Service {

    public findItemInStorentity = (itemId: number, entity: StoreEntity2) => {

        const result = (Object.keys(entity) as (keyof typeof entity)[]).find((key) => {

            if (entity[key] == itemId) {
                return entity[key] == itemId;
            }
        });

        return result;

    }

    public findEmptySlotInStorentity = (entity: StoreEntity2) => {

        const result = (Object.keys(entity) as (keyof typeof entity)[]).find((key) => {

            if (entity[key] == 0) {
                if (key.includes("it")) {
                    return entity[key] == 0;
                }
            }
        });

        return result;

    }

    public findEmptySlotAmountInStoreEntity = (entity: StoreEntity2) => {

        const emptySlotPosition = this.findEmptySlotInStorentity(entity);
        if (emptySlotPosition == undefined) {
            return undefined;
        }

        type ObjectKey = keyof typeof entity;
        const itemAmountPosition = emptySlotPosition.replace("it", "io") as ObjectKey;
        return itemAmountPosition;
    }

    public findItemAmountPositionInStoreEntity = (itemId: number, entity: StoreEntity2) => {

        const itemPosition = this.findItemInStorentity(itemId, entity);
        if (itemPosition == undefined) {
            return undefined;
        }

        type ObjectKey = keyof typeof entity;
        const itemAmountPosition = itemPosition.replace("it", "io") as ObjectKey;
        return itemAmountPosition;

    }

    public countDuplicateItem = (itemId: number, entity: StoreEntity2) => {

        let count = 0;
        const result = (Object.keys(entity) as (keyof typeof entity)[]).find((key) => {

            if (entity[key] == itemId) {
                count++;
            }
        });

        return count;

    }

    public getAllDuplicatePosition = (itemId: number, entity: StoreEntity2) => {

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

    public setValueIntoStoreEntity = <K extends keyof store>(key: K, value: store[K]) => {
        const _store: store = Object.assign({}, store); // Consider also the ES6 spread operator here
        _store[key] = value;
        return _store;
    };

}