import { DataSource } from "typeorm";
import { CashInventory } from "./entity/gdb0101/cash_inventory.entity";
import { FusionItemConfig } from "./entity/item/fusion_item.entity";
import { idtable1, idtable2, idtable3, idtable4, idtable5 } from "./entity/seal_member/idtable.entity";
import { inventory } from "./entity/gdb0101/inventory.entity";
import { log_item_transaction } from "./entity/log_item/log.entity";
import { pc } from "./entity/gdb0101/pc.entity";
import { SealItem } from "./entity/item/seal_item.entity";
import { store } from "./entity/gdb0101/store.entity";
import { usermsgex } from "./entity/seal_member/usermsgex.entity";
import { SEAL_DB_HOST, SEAL_DB_PASS, SEAL_DB_PORT, SEAL_DB_USER } from "./utils/secret.utils";
import { WebUserDetail } from "./entity/seal_member/web_user_detail.entity";
import { WebConfig } from "./entity/seal_member/web_config.entity";
import { CrystalShop } from "./entity/item/crystal_shop.entity";
import { CrystalShopPurchaseHistory } from "./entity/log_item/log_crystal_purchase.entity";

export const SealMemberDataSource = new DataSource({
    type: "mariadb",
    host: SEAL_DB_HOST,
    port: Number(SEAL_DB_PORT),
    username: SEAL_DB_USER,
    password: SEAL_DB_PASS,
    database: "seal_member",
    synchronize: false,
    logging: true,
    entities: [
        idtable1, idtable2, idtable3, idtable4, idtable5,
        usermsgex, WebUserDetail, WebConfig
    ],
    connectTimeout: 2000
})

export const GDB0101DataSource = new DataSource({
    type: "mariadb",
    host: SEAL_DB_HOST,
    port: Number(SEAL_DB_PORT),
    username: SEAL_DB_USER,
    password: SEAL_DB_PASS,
    database: "gdb0101",
    synchronize: false,
    logging: true,
    entities: [
        pc, inventory, store, CashInventory
    ],
    connectTimeout: 2000
})

export const ItemDataSource = new DataSource({
    type: "mariadb",
    host: SEAL_DB_HOST,
    port: Number(SEAL_DB_PORT),
    username: SEAL_DB_USER,
    password: SEAL_DB_PASS,
    database: "item",
    synchronize: false,
    logging: true,
    entities: [
        SealItem, FusionItemConfig, CrystalShop
    ],
    connectTimeout: 2000
})

export const LogItemDataSource = new DataSource({
    type: "mariadb",
    host: SEAL_DB_HOST,
    port: Number(SEAL_DB_PORT),
    username: SEAL_DB_USER,
    password: SEAL_DB_PASS,
    database: "log_item",
    synchronize: false,
    logging: true,
    entities: [
        log_item_transaction, CrystalShopPurchaseHistory
    ],
    connectTimeout: 2000
})

SealMemberDataSource.initialize()
    .then(() => {
        console.log("seal_member Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })
GDB0101DataSource.initialize()
    .then(() => {
        console.log("gdb0101 Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })
LogItemDataSource.initialize()
    .then(() => {
        console.log("log_item Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })
ItemDataSource.initialize()
    .then(() => {
        console.log("item Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })