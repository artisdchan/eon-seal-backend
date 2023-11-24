import { Router } from "express";
import passport from "passport";
import UserController from "../controller/user.controller";

class UserRoutes {
    router = Router();
    controller = new UserController();

    constructor() {
        this.intializeRoutes();
    }

    intializeRoutes() {
        this.router.post("/register", this.controller.register);
        this.router.post("/reset", passport.authenticate('jwt'), this.controller.resetPassword);
        this.router.post('/topup', this.controller.topupCash);
        this.router.get('/character', passport.authenticate('jwt'), this.controller.getAllCharacterName);
        this.router.post('/forget', this.controller.forgetPassword);
    }

}

export default new UserRoutes().router;