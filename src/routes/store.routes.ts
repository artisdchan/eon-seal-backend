import { Router } from "express";
import passport from "passport";
import StoreController from "../controller/store.controller";

class StoreRoutes {
    router = Router();
    controller = new StoreController();

    constructor() {
        this.intializeRoutes();
    }

    intializeRoutes() {
        this.router.get('/rc', passport.authenticate('jwt'), this.controller.getRCAmount);
    }

}

export default new StoreRoutes().router;