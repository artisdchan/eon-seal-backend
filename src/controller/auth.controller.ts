import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SealMemberDataSource } from "../data-source";
import { idtable1 } from "../entity/seal_member/idtable.entity";
import { usermsgex } from "../entity/seal_member/usermsgex.entity";
import { WebUserDetail } from "../entity/seal_member/web_user_detail.entity";
import DBUtils from "../utils/db.utils";
import { JWT_SECRET } from "../utils/secret.utils";

export default class AuthController {

    public login = async (req: Request, res: Response, next: NextFunction) => {
        const token = jwt.sign({ user: req.user }, JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { expires: new Date(Date.now() + 86400 * 1000), httpOnly: true });
        res.status(200).json({ token });
        next();
    }

    public verify = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;
            const googleResponse = await (await fetch(`https://www.googleapis.com/oauth2/v2/userinfo/?access_token=${token}`)).json();
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }

            const userMsgExEntity = await SealMemberDataSource.manager.findOneBy(usermsgex, { email: googleResponse.email });
            if (userMsgExEntity == null) {
                return res.status(404).json({ status: 404, message: 'User ID is not exist.', email: googleResponse.email })
            } else {

                const userWeb = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: userMsgExEntity.userId });
                let userLevel = 0;
                if (userWeb != null) {
                    userLevel = userWeb.userLevel
                }

                const dbUtils = new DBUtils();
                let tblName = await dbUtils.getIdTable(userWeb!.user_id);
                const user = await SealMemberDataSource.manager.query(`SELECT * FROM ${tblName} WHERE id = '${userWeb!.user_id}'`) as idtable1[]
    
                if (user == null) {
                    return res.status(404).json({ status: 404, message: 'User ID is not exist.', email: googleResponse.email })
                }

                const token = jwt.sign({
                    user: {
                        gameUserId: userMsgExEntity.userId,
                        email: userMsgExEntity.email!,
                        userLevel: userLevel,
                        userStatus: user[0].Status
                    }
                }, JWT_SECRET, { expiresIn: "1h" });
                // res.cookie("token", token, {expires: new Date(Date.now() + 86400 * 1000), httpOnly: true});
                return res.status(200).json({ token });
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }

    }

}