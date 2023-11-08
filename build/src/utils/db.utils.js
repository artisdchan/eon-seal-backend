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
class DBUtils {
    constructor() {
        this.getIdTable = (username) => __awaiter(this, void 0, void 0, function* () {
            const id = Array.from(username)[0];
            const table1 = ['a', 'b', 'c', 'd'];
            const table2 = ['e', 'f', 'g', 'h', 'i'];
            const table3 = ['j', 'k', 'l', 'm', 'n'];
            const table4 = ['o', 'p', 'q', 'r', 's'];
            const table5 = ['t', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            if (table1.includes(id)) {
                return 'idtable1';
            }
            else if (table2.includes(id)) {
                return 'idtable2';
            }
            else if (table3.includes(id)) {
                return 'idtable3';
            }
            else if (table4.includes(id)) {
                return 'idtable4';
            }
            else {
                return 'idtable5';
            }
        });
    }
}
exports.default = DBUtils;
