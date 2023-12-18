import passport from "passport";
import passportLocal from "passport-local"
import passportJwt from "passport-jwt";
import { AuthenUser } from "../dto/authen.dto";
import { SealMemberDataSource } from "../data-source";
import { idtable1 } from "../entity/seal_member/idtable.entity";
import DBUtils from "../utils/db.utils";
import { HashPasswordDTO } from "../dto/user.dto";
import { JWT_SECRET } from "../utils/secret.utils";
import { WebUserDetail } from "../entity/seal_member/web_user_detail.entity";
import { NextFunction } from "express";

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const LocalStrategy = passportLocal.Strategy;

passport.serializeUser((user: AuthenUser, done) => {
    return done(null, user);
});

passport.deserializeUser(async (id: AuthenUser, done) => {
    try {

        const dbUtils = new DBUtils();

        let tblName = await dbUtils.getIdTable(id.gameUserId);

        if (!SealMemberDataSource.isInitialized) {
            await SealMemberDataSource.initialize();
        }
        let user = await SealMemberDataSource.manager.query(`SELECT * FROM ${tblName} WHERE id = '${id.gameUserId}'`) as idtable1

        if (user == null) {

            console.error("user not found", id.gameUserId);
            return done(null, false);

        } else {

            const userWeb = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: id.gameUserId, status: 'ACTIVE' });
            let userLevel = 0;
            if (userWeb != null) {
                userLevel = userWeb.userLevel
            }

            done(null, {
                gameUserId: user.id,
                email: user.email!,
                userLevel: userLevel,
                userStatus: user.Status!
            });
        }

    } catch (e) {
        console.error(e)
        return done(e, false);
    }

});

passport.use('password', new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        session: true
    },
    async (username, password, done) => {

        const dbUtils = new DBUtils();
        if (!SealMemberDataSource.isInitialized) {
            await SealMemberDataSource.initialize();
        }
        const hashedPass = await SealMemberDataSource.manager.query(`SELECT OLD_PASSWORD('${password}') AS hash_password`) as HashPasswordDTO[]
        let tblName = await dbUtils.getIdTable(username);

        let user = await SealMemberDataSource.manager.query(`SELECT * FROM ${tblName} WHERE id = '${username}'`) as idtable1[]
        if (user.length <= 0) {
            return done(null, false, { message: 'Invalid username or password.' });
        }
        if (hashedPass[0].hash_password.toLowerCase() != user[0].passwd.toLowerCase()) {
            return done(null, false, { message: 'Invalid username or password.' });
        }

        const userWeb = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: username, status: 'ACTIVE' });
        let userLevel = 0;
        if (userWeb != null) {
            userLevel = userWeb.userLevel
        }else {
            return done(null, false, { message: 'Invalid username or password' })
        }

        done(null, {
            gameUserId: user[0].id,
            email: user[0].email!,
            userLevel: userLevel,
            userStatus: user[0].Status!
        });
    }
))

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
},
    async (jwtPayload, done) => {
        try {

            const dbUtils = new DBUtils();
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            let tblName = await dbUtils.getIdTable(jwtPayload.user.gameUserId);
            const user = await SealMemberDataSource.manager.query(`SELECT * FROM ${tblName} WHERE id = '${jwtPayload.user.gameUserId}'`) as idtable1[]

            if (user == null) {
                console.error("user not found", jwtPayload.user.gameUserId);
                return done(null, false);
            }

            const userWeb = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: jwtPayload.user.gameUserId, status: 'ACTIVE' });
            let userLevel = 0;
            if (userWeb != null) {
                userLevel = userWeb.userLevel
            }

            done(null, {
                gameUserId: user[0].id,
                email: user[0].email!,
                userLevel: userLevel,
                userStatus: user[0].Status!
            });

        } catch (error) {
            return done(null, false);
        }
    }
));
