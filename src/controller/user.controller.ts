import { Request, Response, NextFunction } from "express"
import { SealMemberDataSource } from "../data-source";
import { HashPasswordDTO, RegisterRequestDTO, ResetPasswordDTO } from "../dto/user.dto";
import { idtable1, idtable2, idtable3, idtable4, idtable5 } from "../entity/idtable.entity";
import EonHubService from '../service/eonhub.service'
import DBUtils from "../utils/db.utils";

export default class UserController {

    public register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req.body as RegisterRequestDTO;
            const eonhubService = new EonHubService();

            if (!(await eonhubService.isUserExist(request.email))) {
                res.status(400).json({ message: 'The email not exists in EON-HUB.' })
                return next(null);
            }

            const value = {
                id: request.username,
                passwd: () => `OLD_PASSWORD('${request.password}')`,
                email: request.email,
                point: 0,
                userLevel: 0,
                char_name: '',
                gameserver_burnho: 0,
                enter_ip: '',
                record_lock: 0,
                lock_time: 0,
                delete_flag: 0,
                pay_flag: 0,
                update_date: new Date(),
                nick_name: '',
                lovekey: '',
                loveauth: '',
                pass: '',
                reg_date: new Date()
            }
            const dbUtils = new DBUtils();
            const tableName = await dbUtils.getIdTable(request.username);
            if (String(tableName) == 'idtable1') {
                await SealMemberDataSource.createQueryBuilder().insert().into(idtable1).values(value).execute();
            } else if (String(tableName) == 'idtable2') {
                await SealMemberDataSource.createQueryBuilder().insert().into(idtable2).values(value).execute();
            } else if (String(tableName) == 'idtable3') {
                await SealMemberDataSource.createQueryBuilder().insert().into(idtable3).values(value).execute();
            } else if (String(tableName) == 'idtable4') {
                await SealMemberDataSource.createQueryBuilder().insert().into(idtable4).values(value).execute();
            } else if (String(tableName) == 'idtable5') {
                await SealMemberDataSource.createQueryBuilder().insert().into(idtable5).values(value).execute();
            } else {
                // DO NOTHING
            }

            res.sendStatus(201);
            return next();

        } catch (error) {
            console.error(error);
            res.status(500).send({ status: 500, message: `internal server error.` });
            return next(null)
        }
    }

    public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            
            const currentUser = req.user;
            const request = req.body as ResetPasswordDTO;
            const dbUtils = new DBUtils();
            const tableName = await dbUtils.getIdTable(currentUser?.username!);

            const hashedOldPass = await SealMemberDataSource.manager.query(`SELECT OLD_PASSWORD('${request.currentPassword}') AS hash_password`) as HashPasswordDTO[]
            const user = await SealMemberDataSource.manager.query(`SELECT * FROM ${tableName} WHERE id = '${currentUser?.username}'`) as idtable1[]
            if (user[0].passwd.toLowerCase() != hashedOldPass[0].hash_password.toLowerCase()) {
                res.status(400).json({ message: 'Invalid current password.' });
                next(null);
            }

            const hashedNewPass = await SealMemberDataSource.manager.query(`SELECT OLD_PASSWORD('${request.newPassword}') AS hash_password`) as HashPasswordDTO[]
            await SealMemberDataSource.manager.query(`UPDATE ${tableName} SET passwd = '${hashedNewPass[0].hash_password}' WHERE id = '${currentUser?.username}'`)

            return res.json({ status: 200 });

        } catch (error) {
            console.error(error);
            res.status(500).send({ status: 500, message: `internal server error.` });
            return next(null)
        }
    }

}