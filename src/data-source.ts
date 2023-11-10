import { DataSource } from "typeorm";
import { idtable1, idtable2, idtable3, idtable4, idtable5 } from "./entity/idtable.entity";
import { usermsgex } from "./entity/usermsgex.entity";
import { SEAL_DB_HOST, SEAL_DB_PASS, SEAL_DB_PORT, SEAL_DB_USER } from "./utils/secret.utils";

export const SealMemberDataSource = new DataSource({
    type: "mysql",
    host: SEAL_DB_HOST,
    port: Number(SEAL_DB_PORT),
    username: SEAL_DB_USER,
    password: SEAL_DB_PASS,
    database: "seal_member",
    synchronize: false,
    logging: true,
    entities: [
        idtable1,idtable2,idtable3,idtable4,idtable5, 
        usermsgex
    ],
    connectTimeout: 2000,
    acquireTimeout: 2000
})

// export const initializeSealMember = SealMemberDataSource.initialize()
//     .then(() => {
//         console.log("seal_member Data Source has been initialized!")
//     })
//     .catch((err) => {
//         console.error("Error during Data Source initialization", err)
//     })