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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = __importDefault(require("passport-local"));
const passport_jwt_1 = __importDefault(require("passport-jwt"));
const data_source_1 = require("../data-source");
const idtable_entity_1 = require("../entity/idtable.entity");
const db_utils_1 = __importDefault(require("../utils/db.utils"));
const JwtStrategy = passport_jwt_1.default.Strategy;
const ExtractJwt = passport_jwt_1.default.ExtractJwt;
const LocalStrategy = passport_local_1.default.Strategy;
passport_1.default.serializeUser((user, done) => {
    return done(null, user);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user;
        user = yield data_source_1.SealMemberDataSource.manager.createQueryBuilder()
            .select().from(idtable_entity_1.idtable1, 'idtable1').where('idtable1.id = :id', { id: id.username }).getOne();
        if (user == null) {
            console.error("user not found", id.username);
            return done(null, false);
        }
        else {
            done(null, {
                username: user.id,
                email: user.email
            });
        }
    }
    catch (e) {
        console.error(e);
        return done(e, false);
    }
}));
passport_1.default.use('password', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    session: true
}, (username, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    const dbUtils = new db_utils_1.default();
    const hashedPass = yield data_source_1.SealMemberDataSource.manager.query(`SELECT OLD_PASSWORD('${password}')`);
    let tblName = yield dbUtils.getIdTable(username);
    let user = yield data_source_1.SealMemberDataSource.manager.query(`SELECT * FROM ${tblName} WHERE id = ${username}`);
    if (!user) {
        return done(null, false, { message: 'Invalid username or password.' });
    }
    if (!user.passwd) {
        return done(null, false, { message: 'Invalid username or password.' });
    }
    if (hashedPass.toLowerCase != user.passwd.toLowerCase) {
        return done(null, false, { message: 'Invalid username or password.' });
    }
    done(null, {
        username: user.id,
        email: user.email
    });
})));
