import passport from "passport";
import passportLocal from "passport-local"
import passportJwt from "passport-jwt";
import { AuthenUser } from "../dto/authen.dto";
import { SealMemberDataSource } from "../data-source";
import { idtable1 } from "../entity/idtable.entity";
import DBUtils from "../utils/db.utils";
import { HashPasswordDTO } from "../dto/user.dto";
import { JWT_SECRET } from "../utils/secret.utils";

const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const LocalStrategy = passportLocal.Strategy;

passport.serializeUser((user: AuthenUser, done) => {
    return done(null, user);
});

passport.deserializeUser(async (id: AuthenUser, done) => {
    try {

        const dbUtils = new DBUtils();

        let tblName = await dbUtils.getIdTable(id.username);

        if (!SealMemberDataSource.isInitialized) {
            await SealMemberDataSource.initialize();
        }
        let user = await SealMemberDataSource.manager.query(`SELECT * FROM ${tblName} WHERE id = '${id.username}'`) as idtable1

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
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            const hashedPass = await SealMemberDataSource.manager.query(`SELECT OLD_PASSWORD('${password}') AS hash_password`) as HashPasswordDTO[]
            let tblName = await dbUtils.getIdTable(username);

            let user = await SealMemberDataSource.manager.query(`SELECT * FROM ${tblName} WHERE id = '${username}'`) as idtable1[]
            if (!user) {
                return done(null, false, { message: 'Invalid username or password.' });
            }
            if (!user[0].passwd) {
                return done(null, false, { message: 'Invalid username or password.' });
            }
            if (hashedPass[0].hash_password.toLowerCase() != user[0].passwd.toLowerCase()) {
                return done(null, false, { message: 'Invalid username or password.' });
            }

            done(null, {
                username: user[0].id,
                email: user[0].email!
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
            let tblName = await dbUtils.getIdTable(jwtPayload.user.username);
            const user = await SealMemberDataSource.manager.query(`SELECT * FROM ${tblName} WHERE id = '${jwtPayload.user.username}'`) as idtable1[]

            if (user == null) {
                console.error("user not found", jwtPayload.userId);
                return done(null, false);
            }

            done(null, {
                username: user[0].id,
                email: user[0].email!
            });

        } catch (error) {
            return done(null, false);
        }
    }
));