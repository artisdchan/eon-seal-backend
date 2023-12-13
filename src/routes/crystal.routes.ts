import { Router } from "express";
import passport from "passport";
import CrystalController from "../controller/crystal.controller";
import { PackageController } from "../controller/package.controller";

class CrystalRoutes {
    router = Router();
    controller = new CrystalController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post('/:type/purchase', passport.authenticate('jwt'), this.controller.purchase);
        this.router.get('/:type', passport.authenticate('jwt'), this.controller.getCystalShopList);
        this.router.get('/:type/money', passport.authenticate('jwt'), this.controller.getMoney);
    }
}

export default new CrystalRoutes().router;