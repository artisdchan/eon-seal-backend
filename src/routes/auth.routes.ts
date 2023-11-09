import { Router } from "express";
import passport from "passport";
import AuthController from "../controller/auth.controller";

class AuthRoutes {
    router = Router();
    controller = new AuthController();

    constructor() {
        this.intializeRoutes();
    }

    intializeRoutes() {
        this.router.post("/login", passport.authenticate("password"), this.controller.login);
    }

}

export default new AuthRoutes().router;