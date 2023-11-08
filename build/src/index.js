"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// import passport from "passport";
const routes_1 = __importDefault(require("./routes"));
// import "./service/passport.service";
require("reflect-metadata");
class Server {
    constructor(app) {
        this.config(app);
        new routes_1.default(app);
        // SealMemberDataSource.initialize()
    }
    config(app) {
        const corsOptions = {
            origin: "*",
        };
        // app.set("view engine", "ejs");
        app.use((0, cors_1.default)(corsOptions));
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true }));
        // app.use(cookieParser());
        // Adding required middlewares
        // app.use(
        //   session({
        //     secret: "askduhakdnkbiygvhbad7a6s*&^*S^D8asdbk",
        //     resave: false,
        //     saveUninitialized: false,
        //   })
        // );
        // app.use(passport.authenticate("session"));
        // app.use(passport.initialize());
        // app.use(passport.session());
        // app.use(express.static('public'));
    }
}
exports.default = Server;
