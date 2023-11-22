import { store } from "../entity/store.entity";

export default class StoreService {

    public findItemInStorentity = (itemId: number, entity: store) => {

        const result = (Object.keys(entity) as (keyof typeof entity)[]).find((key) => {

            if (entity[key] == itemId) {
                return entity[key] == itemId;
            }
          });

        return result;

    }

    public findEmptySlotInStorentity = (entity: store) => {

        const result = (Object.keys(entity) as (keyof typeof entity)[]).find((key) => {

            if (entity[key] == 0) {
                if (key.includes("it")) {
                    return entity[key] == 0;
                }
            }
          });

        return result;

    }

    public findEmptySlotAmountInStoreEntity = (entity: store) => {

        const emptySlotPosition = this.findEmptySlotInStorentity(entity);
        if (emptySlotPosition == undefined) {
            return undefined;
        }

        type ObjectKey = keyof typeof entity;
        const itemAmountPosition = emptySlotPosition.replace("it", "io") as ObjectKey;
        return itemAmountPosition;
    }

    public findItemAmountPositionInStoreEntity = (itemId: number, entity: store) => {

        const itemPosition = this.findItemInStorentity(itemId, entity);
            if (itemPosition == undefined) {
                return undefined;
            }

            type ObjectKey = keyof typeof entity;
            const itemAmountPosition = itemPosition.replace("it", "io") as ObjectKey;
            return itemAmountPosition;

    }

    public setValueIntoStoreEntity = <K extends keyof store>(key: K, value: store[K]) => {
        const _store: store = Object.assign({}, store); // Consider also the ES6 spread operator here
        _store[key] = value;
        return _store;
    };

}