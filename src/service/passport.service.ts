import passport from "passport";
import passportLocal from "passport-local"
import passportJwt from "passport-jwt";
import { AuthenUser } from "../dto/authen.dto";
import { SealMemberDataSource } from "../data-source";
import { idtable1 } from "../entity/idtable.entity";
import DBUtils from "../utils/db.utils";

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const LocalStrategy = passportLocal.Strategy;

passport.serializeUser((user: AuthenUser, done) => {
    return done(null, user);
});

passport.deserializeUser(async (id: AuthenUser, done) => {
    try {

        let user;
        user = await SealMemberDataSource.manager.createQueryBuilder()
        .select().from(idtable1, 'idtable1').where('idtable1.id = :id', { id: id.username }).getOne();

        if (user == null) {
            console.error("user not found", id.username);
            return done(null, false);
        } else {
            done(null, {
                username: user.id,
                email: user.email!
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

        const hashedPass = await SealMemberDataSource.manager.query(`SELECT OLD_PASSWORD('${password}')`) as string
        let tblName = await dbUtils.getIdTable(username);

        let user = await SealMemberDataSource.manager.query(`SELECT * FROM ${tblName} WHERE id = ${username}`) as idtable1
        if (!user) {
            return done(null, false, { message: 'Invalid username or password.' });
        }
        if (!user.passwd) {
            return done(null, false, { message: 'Invalid username or password.' });
        }
        if (hashedPass.toLowerCase != user.passwd.toLowerCase) {
            return done(null, false, { message: 'Invalid username or password.' });
        }

        done(null, {
            username: user.id,
            email: user.email!
        });
    }
))