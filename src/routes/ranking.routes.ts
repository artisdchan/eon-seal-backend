import { Router } from "express";
import passport from "passport";
import RankingController from "../controller/ranking.controller";

class RankingRoutes {
    router = Router();
    controller = new RankingController();

    constructor() {
        this.intializeRoutes();
    }

    intializeRoutes() {
        this.router.get("/", this.controller.ranking);
    }

}

export default new RankingRoutes().router;