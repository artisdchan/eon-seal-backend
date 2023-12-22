import { Router } from "express";
import passport from "passport";
import ReactorController from "../controller/reactor.controller";

class ReactorRoutes {
    router = Router();
    controller = new ReactorController();

    constructor() {
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post('/', passport.authenticate('jwt'), this.controller.upReactorLevel);
        this.router.get('/', passport.authenticate('jwt'), this.controller.getReactor)
        this.router.post('/claim', passport.authenticate('jwt'), this.controller.claimItem)
        this.router.get('/level', passport.authenticate('jwt'), this.controller.getCurrentReactorState)
    }
}

export default new ReactorRoutes().router;