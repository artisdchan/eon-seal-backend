import { Router } from "express";
import passport from "passport";
import ItemController from "../controller/item.controller";

class ItemRoutes {
    router = Router();
    controller = new ItemController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post('/:type', this.controller.addItem);
    }
}

export default new ItemRoutes().router;