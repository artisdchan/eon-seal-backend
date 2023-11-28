import { Router } from "express";
import passport from "passport";
import { DashboardController } from "../controller/dashboard.controller";

class DashboardRoutes {
    router = Router();
    controller = new DashboardController();

    constructor() {
        this.intializeRoutes();
    }

    intializeRoutes() {
        this.router.get("/", this.controller.dashboard);
    }

}

export default new DashboardRoutes().router;