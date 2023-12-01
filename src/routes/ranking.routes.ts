import { Router, Request, Response } from "express";
import passport from "passport";
import RankingController from "../controller/ranking.controller";
import apicache from 'apicache'

class RankingRoutes {
    router = Router();
    controller = new RankingController();
    cache = apicache.middleware;
    onlyStatus200 = (req: Request, res: Response) => res.statusCode === 200

    constructor() {
        this.intializeRoutes();
    }

    intializeRoutes() {
        this.router.get("/", this.cache('1 hour', this.onlyStatus200), this.controller.ranking);
    }

}

export default new RankingRoutes().router;