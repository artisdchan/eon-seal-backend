import { DataSource } from "typeorm";
import { idtable1, idtable2, idtable3, idtable4, idtable5 } from "./entity/idtable.entity";
import { inventory } from "./entity/inventory.entity";
import { log_item_transaction } from "./entity/log.entity";
import { pc } from "./entity/pc.entity";
import { store } from "./entity/store.entity";
import { usermsgex } from "./entity/usermsgex.entity";
import { SEAL_DB_HOST, SEAL_DB_PASS, SEAL_DB_PORT, SEAL_DB_USER } from "./utils/secret.utils";

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
        usermsgex
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
        pc, inventory, store
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
        log_item_transaction
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