import { GDB0101DataSource } from "../data-source";
import { store } from "../entity/gdb0101/store.entity";

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

    public initialStoreQueryString = (userId: string, storePass: number) => {
        return `INSERT INTO gdb0101.store (user_id,it0,io0,it1,io1,it2,io2,it3,io3,it4,io4,it5,io5,it6,io6,it7,io7,it8,io8,it9,io9,it10,io10,it11,io11,it12,io12,it13,io13,it14,io14,it15,io15,it16,io16,it17,io17,it18,io18,it19,io19,it20,io20,it21,io21,it22,io22,it23,io23,it24,io24,it25,io25,it26,io26,it27,io27,it28,io28,it29,io29,it30,io30,it31,io31,it32,io32,it33,io33,it34,io34,it35,io35,it36,io36,it37,io37,it38,io38,it39,io39,it40,io40,it41,io41,it42,io42,it43,io43,it44,io44,it45,io45,it46,io46,it47,io47,it48,io48,it49,io49,it50,io50,it51,io51,it52,io52,it53,io53,it54,io54,it55,io55,it56,io56,it57,io57,it58,io58,it59,io59,it60,io60,it61,io61,it62,io62,it63,io63,it64,io64,it65,io65,it66,io66,it67,io67,it68,io68,it69,io69,it70,io70,it71,io71,it72,io72,it73,io73,it74,io74,it75,io75,it76,io76,it77,io77,it78,io78,it79,io79,negel,segel,pw,is0,is1,is2,is3,is4,is5,is6,is7,is8,is9,is10,is11,is12,is13,is14,is15,is16,is17,is18,is19,is20,is21,is22,is23,is24,is25,is26,is27,is28,is29,is30,is31,is32,is33,is34,is35,is36,is37,is38,is39,is40,is41,is42,is43,is44,is45,is46,is47,is48,is49,is50,is51,is52,is53,is54,is55,is56,is57,is58,is59,is60,is61,is62,is63,is64,is65,is66,is67,is68,is69,is70,is71,is72,is73,is74,is75,is76,is77,is78,is79,ioo0,ioo1,ioo2,ioo3,ioo4,ioo5,ioo6,ioo7,ioo8,ioo9,ioo10,ioo11,ioo12,ioo13,ioo14,ioo15,ioo16,ioo17,ioo18,ioo19,ioo20,ioo21,ioo22,ioo23,ioo24,ioo25,ioo26,ioo27,ioo28,ioo29,ioo30,ioo31,ioo32,ioo33,ioo34,ioo35,ioo36,ioo37,ioo38,ioo39,ioo40,ioo41,ioo42,ioo43,ioo44,ioo45,ioo46,ioo47,ioo48,ioo49,ioo50,ioo51,ioo52,ioo53,ioo54,ioo55,ioo56,ioo57,ioo58,ioo59,ioo60,ioo61,ioo62,ioo63,ioo64,ioo65,ioo66,ioo67,ioo68,ioo69,ioo70,ioo71,ioo72,ioo73,ioo74,ioo75,ioo76,ioo77,ioo78,ioo79,cash1,time1,cash2,time2,cash3,time3) VALUES ('${userId}',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'${storePass}',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);`
    }

}