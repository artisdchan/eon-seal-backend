import { Router } from "express";
import passport from "passport";
import ConfigController from "../controller/config.controller";

class ConfigRoutes {
    router = Router();
    controller = new ConfigController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/', passport.authenticate('jwt'), this.controller.getConfigByKey);
    }
}

export default new ConfigRoutes().router;