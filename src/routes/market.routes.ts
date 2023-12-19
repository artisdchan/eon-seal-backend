import { Router } from "express";
import passport from "passport";
import MarketController from "../controller/market.controller";

class MarketRoutes {
    router = Router();
    controller = new MarketController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post('/whitelist', this.controller.getUserWhitListItem);
        this.router.post('/buyback/cp', this.controller.buyBackCp)
        this.router.post('/validate', this.controller.validateItem)
    }
}

export default new MarketRoutes().router;