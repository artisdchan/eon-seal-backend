import { Router } from "express";
import passport from "passport";
import CrystalController from "../controller/crystal.controller";

class CrystalRoutes {
    router = Router();
    controller = new CrystalController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post('/purchase', passport.authenticate('jwt'), this.controller.purchase);
        this.router.get('/', passport.authenticate('jwt'), this.controller.getCystalShopList);
    }
}

export default new CrystalRoutes().router;