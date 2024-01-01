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
        this.router.get('/detail', passport.authenticate('jwt'), this.controller.getUserDetail);
        this.router.get('/info', this.controller.userInfo)
        this.router.post('/topup-credit', this.controller.addTopupCredit)
        this.router.post('/discon-char', passport.authenticate('jwt'), this.controller.disconnectCharacter)
    }

}

export default new UserRoutes().router;