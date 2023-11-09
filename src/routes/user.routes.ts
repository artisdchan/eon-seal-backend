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
    }

}

export default new UserRoutes().router;