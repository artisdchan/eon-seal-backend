import { Router } from "express";
import passport from "passport";
import { PackageController } from "../controller/package.controller";

class PackageRoutes {
    router = Router();
    creditShopController = new PackageController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/shop', passport.authenticate('jwt'), this.creditShopController.getPackageList)
        this.router.post('/shop/purchase/:packageId', passport.authenticate('jwt'), this.creditShopController.purchasePackage)
    }
}

export default new PackageRoutes().router;