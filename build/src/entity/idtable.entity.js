"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.idtable5 = exports.idtable4 = exports.idtable3 = exports.idtable2 = exports.idtable1 = void 0;
const typeorm_1 = require("typeorm");
let idtable1 = class idtable1 {
};
exports.idtable1 = idtable1;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], idtable1.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable1.prototype, "passwd", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable1.prototype, "vip", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable1.prototype, "viptime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable1.prototype, "point", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable1.prototype, "reg_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable1.prototype, "userLevel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable1.prototype, "char_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable1.prototype, "gameserver_burnho", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable1.prototype, "serverenter_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable1.prototype, "enter_ip", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable1.prototype, "record_lock", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable1.prototype, "lock_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable1.prototype, "web_block", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable1.prototype, "game_block", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable1.prototype, "delete_flag", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable1.prototype, "delete_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable1.prototype, "pay_flag", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable1.prototype, "update_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable1.prototype, "nick_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable1.prototype, "lovekey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable1.prototype, "loveauth", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable1.prototype, "pass", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable1.prototype, "Mac", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable1.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable1.prototype, "fcsaccountguid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable1.prototype, "recommender", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable1.prototype, "LoginDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable1.prototype, "LoginCount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable1.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable1.prototype, "RegIp", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable1.prototype, "Cash", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable1.prototype, "HorCah", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable1.prototype, "Coin", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable1.prototype, "trueId", void 0);
exports.idtable1 = idtable1 = __decorate([
    (0, typeorm_1.Entity)()
], idtable1);
let idtable2 = class idtable2 {
};
exports.idtable2 = idtable2;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], idtable2.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable2.prototype, "passwd", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable2.prototype, "vip", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable2.prototype, "viptime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable2.prototype, "point", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable2.prototype, "reg_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable2.prototype, "userLevel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable2.prototype, "char_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable2.prototype, "gameserver_burnho", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable2.prototype, "serverenter_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable2.prototype, "enter_ip", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable2.prototype, "record_lock", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable2.prototype, "lock_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable2.prototype, "web_block", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable2.prototype, "game_block", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable2.prototype, "delete_flag", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable2.prototype, "delete_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable2.prototype, "pay_flag", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable2.prototype, "update_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable2.prototype, "nick_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable2.prototype, "lovekey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable2.prototype, "loveauth", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable2.prototype, "pass", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable2.prototype, "Mac", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable2.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable2.prototype, "fcsaccountguid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable2.prototype, "recommender", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable2.prototype, "LoginDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable2.prototype, "LoginCount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable2.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable2.prototype, "RegIp", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable2.prototype, "Cash", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable2.prototype, "HorCah", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable2.prototype, "Coin", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable2.prototype, "trueId", void 0);
exports.idtable2 = idtable2 = __decorate([
    (0, typeorm_1.Entity)()
], idtable2);
let idtable3 = class idtable3 {
};
exports.idtable3 = idtable3;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], idtable3.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable3.prototype, "passwd", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable3.prototype, "vip", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable3.prototype, "viptime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable3.prototype, "point", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable3.prototype, "reg_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable3.prototype, "userLevel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable3.prototype, "char_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable3.prototype, "gameserver_burnho", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable3.prototype, "serverenter_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable3.prototype, "enter_ip", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable3.prototype, "record_lock", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable3.prototype, "lock_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable3.prototype, "web_block", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable3.prototype, "game_block", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable3.prototype, "delete_flag", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable3.prototype, "delete_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable3.prototype, "pay_flag", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable3.prototype, "update_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable3.prototype, "nick_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable3.prototype, "lovekey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable3.prototype, "loveauth", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable3.prototype, "pass", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable3.prototype, "Mac", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable3.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable3.prototype, "fcsaccountguid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable3.prototype, "recommender", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable3.prototype, "LoginDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable3.prototype, "LoginCount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable3.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable3.prototype, "RegIp", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable3.prototype, "Cash", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable3.prototype, "HorCah", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable3.prototype, "Coin", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable3.prototype, "trueId", void 0);
exports.idtable3 = idtable3 = __decorate([
    (0, typeorm_1.Entity)()
], idtable3);
let idtable4 = class idtable4 {
};
exports.idtable4 = idtable4;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], idtable4.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable4.prototype, "passwd", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable4.prototype, "vip", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable4.prototype, "viptime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable4.prototype, "point", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable4.prototype, "reg_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable4.prototype, "userLevel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable4.prototype, "char_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable4.prototype, "gameserver_burnho", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable4.prototype, "serverenter_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable4.prototype, "enter_ip", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable4.prototype, "record_lock", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable4.prototype, "lock_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable4.prototype, "web_block", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable4.prototype, "game_block", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable4.prototype, "delete_flag", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable4.prototype, "delete_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable4.prototype, "pay_flag", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable4.prototype, "update_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable4.prototype, "nick_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable4.prototype, "lovekey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable4.prototype, "loveauth", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable4.prototype, "pass", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable4.prototype, "Mac", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable4.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable4.prototype, "fcsaccountguid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable4.prototype, "recommender", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable4.prototype, "LoginDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable4.prototype, "LoginCount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable4.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable4.prototype, "RegIp", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable4.prototype, "Cash", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable4.prototype, "HorCah", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable4.prototype, "Coin", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable4.prototype, "trueId", void 0);
exports.idtable4 = idtable4 = __decorate([
    (0, typeorm_1.Entity)()
], idtable4);
let idtable5 = class idtable5 {
};
exports.idtable5 = idtable5;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], idtable5.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable5.prototype, "passwd", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable5.prototype, "vip", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable5.prototype, "viptime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable5.prototype, "point", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable5.prototype, "reg_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable5.prototype, "userLevel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable5.prototype, "char_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable5.prototype, "gameserver_burnho", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable5.prototype, "serverenter_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable5.prototype, "enter_ip", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable5.prototype, "record_lock", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable5.prototype, "lock_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable5.prototype, "web_block", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable5.prototype, "game_block", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable5.prototype, "delete_flag", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable5.prototype, "delete_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable5.prototype, "pay_flag", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable5.prototype, "update_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable5.prototype, "nick_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable5.prototype, "lovekey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable5.prototype, "loveauth", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable5.prototype, "pass", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable5.prototype, "Mac", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable5.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable5.prototype, "fcsaccountguid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable5.prototype, "recommender", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], idtable5.prototype, "LoginDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable5.prototype, "LoginCount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable5.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable5.prototype, "RegIp", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable5.prototype, "Cash", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable5.prototype, "HorCah", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], idtable5.prototype, "Coin", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], idtable5.prototype, "trueId", void 0);
exports.idtable5 = idtable5 = __decorate([
    (0, typeorm_1.Entity)()
], idtable5);
