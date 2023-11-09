import { DataSource } from "typeorm";
import { idtable1, idtable2, idtable3, idtable4, idtable5 } from "./entity/idtable.entity";

export const SealMemberDataSource = new DataSource({
    type: "mysql",
    host: "102.129.138.72",
    port: 3306,
    username: "root",
    password: "1001xx",
    database: "seal_member",
    synchronize: false,
    logging: true,
    entities: [idtable1,idtable2,idtable3,idtable4,idtable5],
    subscribers: [],
    migrations: [],
})
export const initializeSealMember = SealMemberDataSource.initialize()
    .then(() => {
        console.log("seal_member Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })