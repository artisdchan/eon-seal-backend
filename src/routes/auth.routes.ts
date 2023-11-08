import { Router } from "express";
import AuthController from "../controller/auth.controller";

class AuthRoutes {
    router = Router();
    controller = new AuthController();

    constructor() {
        this.intializeRoutes();
    }

    intializeRoutes() {
        this.router.post("/login", this.controller.login);
    }

}

export default new AuthRoutes().router;