import { Router } from "express";
import passport from "passport";
import FusionController from "../controller/fusion.controller";

class FusionRoutes {
    router = Router();
    controller = new FusionController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post('/', passport.authenticate('jwt'), this.controller.fusionCostume);
        this.router.get('/', passport.authenticate('jwt'), this.controller.getItemFusionList);
        this.router.post('/exchange', passport.authenticate('jwt'), this.controller.exchangeCostume);
    }
}

export default new FusionRoutes().router;