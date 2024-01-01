import { Router, Request, Response } from "express";
import passport from "passport";
import { DashboardController } from "../controller/dashboard.controller";
import apicache from 'apicache'
import { checkLimitUserLevel } from "../utils/auth.utils";

class DashboardRoutes {
    router = Router();
    controller = new DashboardController();
    cache = apicache.options({
        headers: {
          'cache-control': 'no-cache',
        },
        respectCacheControl: true
      }).middleware;
    onlyStatus200 = (req: Request, res: Response) => res.statusCode === 200

    constructor() {
        this.intializeRoutes();
    }

    intializeRoutes() {
        this.router.get("/", passport.authenticate('jwt'), checkLimitUserLevel(99), this.controller.dashboard);
        this.router.get('/serverinfo', passport.authenticate('jwt'), checkLimitUserLevel(99), this.controller.serverInfo);
        this.router.get('/bot/serverinfo', this.controller.serverInfoBot)
        this.router.get('/bot/dashboardinfo', this.controller.dashboardBot)
        this.router.get('/findbug', this.controller.findItBug)
    }

}

export default new DashboardRoutes().router;