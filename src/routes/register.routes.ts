import { Router } from "express";
import RegisterController from "../controller/register.controller";

class RegisterRoutes {
    router = Router();
    controller = new RegisterController();

    constructor() {
        this.intializeRoutes();
    }

    intializeRoutes() {
        this.router.post("/register", this.controller.register);
    }

}

export default new RegisterRoutes().router;