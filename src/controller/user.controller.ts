import { Request, Response, NextFunction } from "express"
import { SealMemberDataSource } from "../data-source";
import { HashPasswordDTO, RegisterRequestDTO, ResetPasswordDTO, TopupCashRequestDTO } from "../dto/user.dto";
import { idtable1, idtable2, idtable3, idtable4, idtable5 } from "../entity/idtable.entity";
import { usermsgex } from "../entity/usermsgex.entity";
import EonHubService from '../service/eonhub.service'
import DBUtils from "../utils/db.utils";
import { EONHUB_API_KEY } from "../utils/secret.utils";

export default class UserController {

    public register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req.body as RegisterRequestDTO;
            const eonhubService = new EonHubService();

            if (!(await eonhubService.isUserExist(request.email))) {
                res.status(400).json({ message: 'The email not exists in EON-HUB.' })
                return next(null);
            }

            const dbUtils = new DBUtils();
            const tableName = await dbUtils.getIdTable(request.username);

            const user = await SealMemberDataSource.manager.query(`SELECT * FROM ${tableName} WHERE id = '${request.username}' AND email = '${request.email}'`) as idtable1[]
            const userMsgExEntity = await SealMemberDataSource.createQueryBuilder()
                .select('usermsgex')
                .from(usermsgex, 'usermsgex')
                .where('usermsgex.email = :email', { email: request.email })
                .getOne();

            if (user.length > 0 || userMsgExEntity != null) {
                return res.status(400).json({ message: 'User is duplicate.' });
            }

            const idtableValue = {
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

            const userModel = new usermsgex();
            userModel.userId = request.username;
            userModel.email = request.email;
            userModel.gold = 0;
            userModel.nickName = '';
            userModel.oneTimeChangePwd = '';
            userModel.isGiftsReferrerGold = 'N';
            userModel.Referrer = '';
            userModel.honor = 0;
            userModel.xixi = request.password;
            userModel.question = '';
            userModel.answer = '';
            userModel.totalGold = 0;
            userModel.vipLevel = 0;
            userModel.adminLevel = 0;
            userModel.ip = '';
            userModel.onlineTime = 0;
            userModel.TotalOnlineTime = 0;
            userModel.LotteryCount = 0;
            userModel.referee = '';
            userModel.Receive = 0;
            userModel.code = 99999;
            userModel.dat_t = 0;
            userModel.dat_to = 0;
            userModel.day_t = 0;
            userModel.day_to = 0;
            userModel.day_z = 0;
            userModel.vip = 0;
            userModel.day = 0;

            const queryRunner = SealMemberDataSource.createQueryRunner();
            // await queryRunner.connect()
            await queryRunner.startTransaction()

            try {
                if (String(tableName) == 'idtable1') {
                    await queryRunner.manager.createQueryBuilder().insert().into(idtable1).values(idtableValue).execute();
                } else if (String(tableName) == 'idtable2') {
                    await queryRunner.manager.createQueryBuilder().insert().into(idtable2).values(idtableValue).execute();
                } else if (String(tableName) == 'idtable3') {
                    await queryRunner.manager.createQueryBuilder().insert().into(idtable3).values(idtableValue).execute();
                } else if (String(tableName) == 'idtable4') {
                    await queryRunner.manager.createQueryBuilder().insert().into(idtable4).values(idtableValue).execute();
                } else if (String(tableName) == 'idtable5') {
                    await queryRunner.manager.createQueryBuilder().insert().into(idtable5).values(idtableValue).execute();
                } else {
                    // DO NOTHING
                }

                await queryRunner.manager.save(userModel);

                await queryRunner.commitTransaction()
            } catch (error) {
                console.error(error);
                await queryRunner.rollbackTransaction()
            } finally {
                await queryRunner.release()
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

            const queryRunner = SealMemberDataSource.createQueryRunner();
            // await queryRunner.connect()
            await queryRunner.startTransaction()

            try {
                const userMsgExEntity = await queryRunner.manager.createQueryBuilder()
                .select('usermsgex')
                .from(usermsgex, 'usermsgex')
                .where('usermsgex.userId = :userId', { userId: currentUser?.username })
                .getOne();

                userMsgExEntity!.xixi = request.newPassword;

                await queryRunner.manager.query(`UPDATE ${tableName} SET passwd = '${hashedNewPass[0].hash_password}' WHERE id = '${currentUser?.username}'`);
                await queryRunner.manager.save(userMsgExEntity);

                await queryRunner.commitTransaction()

            } catch (error) {
                console.error(error);
                await queryRunner.rollbackTransaction()
            } finally {
                await queryRunner.release()
            }

            return res.json({ status: 200 });

        } catch (error) {
            console.error(error);
            res.status(500).send({ status: 500, message: `internal server error.` });
            return next(null)
        }
    }

    public topupCash = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const requestApiKey = req.get('API-KEY') as string;
            if (requestApiKey != EONHUB_API_KEY) {
                console.error('Invalid API-KEY.');
                return res.sendStatus(401);
            }

            const dbUtils = new DBUtils();
            const request = req.body as TopupCashRequestDTO;
            const tableName = await dbUtils.getIdTable(request.email);

            const userEntity = await SealMemberDataSource.manager.query(`SELECT * FROM ${tableName} WHERE email = '${request.email}'`) as idtable1[]
            const userMsgExEntity = await SealMemberDataSource.createQueryBuilder()
                .select('usermsgex')
                .from(usermsgex, 'usermsgex')
                .where('usermsgex.email = :email', { email: request.email })
                .getOne();

            if (!userEntity || userMsgExEntity == null) {
                console.error('Topup cash failed. User is not exist.');
                return res.status(400).json({ status: 400, message: 'Game Account is not found.' });
            }

            userMsgExEntity.gold = userMsgExEntity.gold! + request.cashAmount;
            await SealMemberDataSource.manager.save(userMsgExEntity);
            // await SealMemberDataSource.createQueryBuilder()
            //     .update(usermsgex)
            //     .set({ gold: () => `gold + ${request.cashAmount}` })
            //     .where('email = :email', { email: request.email })
            //     .execute();

            return res.status(200).json({ status: 200, message: 'Success' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

}