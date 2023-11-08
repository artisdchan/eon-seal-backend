"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSealMember = exports.SealMemberDataSource = void 0;
const typeorm_1 = require("typeorm");
const idtable_entity_1 = require("./entity/idtable.entity");
exports.SealMemberDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: "102.129.138.72",
    port: 3306,
    username: "root",
    password: "1001xx",
    database: "seal_member",
    synchronize: false,
    logging: true,
    entities: [idtable_entity_1.idtable1],
    subscribers: [],
    migrations: [],
});
exports.initializeSealMember = exports.SealMemberDataSource.initialize()
    .then(() => {
    console.log("Data Source has been initialized!");
})
    .catch((err) => {
    console.error("Error during Data Source initialization", err);
});
