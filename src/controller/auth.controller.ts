import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/secret.utils";

export default class AuthController {
    
    public login = async (req: Request, res: Response, next: NextFunction) => {
        const token = jwt.sign({ user: req.user }, JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, {expires: new Date(Date.now() + 86400 * 1000), httpOnly: true});
        res.sendStatus(200);
        next();
    }

}