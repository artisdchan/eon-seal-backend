import { Router } from "express";
import passport from "passport";
import AuthController from "../controller/auth.controller";
import { JWT_SECRET } from "../utils/secret.utils";
import jwt from "jsonwebtoken";

class AuthRoutes {
    router = Router();
    controller = new AuthController();

    constructor() {
        this.intializeRoutes();
    }

    intializeRoutes() {
        // this.router.post("/login", passport.authenticate("password", { failureRedirect: '/error', failureMessage: true }), this.controller.login);
        this.router.post('/login', function(req, res, next) {
            passport.authenticate('password', function(err: any, user: any, message: any) {
                if (err) {
                    return next(err);
                }

                if (!user) {
                    return res.status(401).json(message);
                }

                const token = jwt.sign({ user: req.user }, JWT_SECRET, { expiresIn: "1h" });
                res.cookie("token", token, {expires: new Date(Date.now() + 86400 * 1000), httpOnly: true});
                return res.status(200).json({token});

            })(req, res, next);
            
        });
    }
}

export default new AuthRoutes().router;