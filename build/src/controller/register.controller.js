"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const idtable_entity_1 = require("../entity/idtable.entity");
class RegisterController {
    constructor() {
        this.register = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const request = req.body;
                const aaa = {
                    id: request.username,
                    passwd: () => `OLD_PASSWORD('${request.password}')`,
                    email: request.email,
                    point: 0,
                    userLevel: 0,
                    char_name: '',
                    gameserver_burnho: 0,
                    enter_ip: '',
                    record_lock: 0,
                    lock_time: 0,
                    delete_flag: 0,
                    pay_flag: 0,
                    update_date: new Date(),
                    nick_name: '',
                    lovekey: '',
                    loveauth: '',
                    pass: '',
                    reg_date: new Date()
                };
                yield data_source_1.SealMemberDataSource.createQueryBuilder().insert().into(idtable_entity_1.idtable1).values(aaa).execute();
                res.status(201);
                return next();
            }
            catch (error) {
                console.error(error);
                res.send({ status: 500, message: `internal server error.` });
                return next(null);
            }
        });
    }
}
exports.default = RegisterController;
