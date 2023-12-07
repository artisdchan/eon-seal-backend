import { Request, Response, NextFunction } from "express"
import handlebars from "handlebars";
import path from "path";
import { GDB0101DataSource, ItemDataSource, SealMemberDataSource } from "../data-source";
import { AuthenUser } from "../dto/authen.dto";
import { CharacterNameResponseDTO, ForgetPasswordRequestDTO, HashPasswordDTO, RegisterRequestDTO, ResetPasswordDTO, TopupCashRequestDTO, UserDetailResponseDTO } from "../dto/user.dto";
import { idtable1, idtable2, idtable3, idtable4, idtable5 } from "../entity/seal_member/idtable.entity";
import { pc } from "../entity/gdb0101/pc.entity";
import { usermsgex } from "../entity/seal_member/usermsgex.entity";
import { transporter } from "../service/email.service";
import EonHubService from '../service/eonhub.service'
import DBUtils from "../utils/db.utils";
import { EONHUB_API_KEY } from "../utils/secret.utils";
import { randomString } from "../utils/string.utils";
import { WebUserDetail } from "../entity/seal_member/web_user_detail.entity";
import StoreService from "../service/store.service";
import { store } from "../entity/gdb0101/store.entity";
import { WebConfig, WebConfigConstant } from "../entity/seal_member/web_config.entity";
var fs = require('fs');

export default class UserController {

    public register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req.body as RegisterRequestDTO;
            const eonhubService = new EonHubService();
            const storeService = new StoreService();

            if (!(await eonhubService.isUserExist(request.email))) {
                res.status(400).json({ message: 'The email not exists in EON-HUB.' })
                return next(null);
            }


            const dbUtils = new DBUtils();
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            const tableName = await dbUtils.getIdTable(request.username);

            const user = await SealMemberDataSource.manager.query(`SELECT * FROM ${tableName} WHERE id = '${request.username}' AND email = '${request.email}'`) as idtable1[]
            const userMsgExEntity = await SealMemberDataSource.manager.findOneBy(usermsgex, { email: request.email })

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
                nick_name: request.username,
                lovekey: '',
                loveauth: '',
                pass: '',
                reg_date: new Date(),
                Status: 1,
            }

            const userModel = new usermsgex();
            userModel.userId = request.username;
            userModel.email = request.email;
            userModel.gold = 0;
            userModel.nickName = request.username;
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

            const webUserDetailEntity = new WebUserDetail();
            webUserDetailEntity.user_id = request.username;
            webUserDetailEntity.userLevel = 1;
            webUserDetailEntity.shardUnCommonPoint = 0;
            webUserDetailEntity.shardCommonPoint = 0;
            webUserDetailEntity.shardRarePoint = 0;
            webUserDetailEntity.shardEpicPoint = 0;
            webUserDetailEntity.shardLegenPoint = 0;
            webUserDetailEntity.crystalPoint = 0;
            webUserDetailEntity.cashSpendPoint = 0;

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
                await queryRunner.manager.save(webUserDetailEntity);
                await GDB0101DataSource.manager.query(storeService.initialStoreQueryString(request.username, request.storePass));

                await queryRunner.commitTransaction()
            } catch (error) {
                console.error(error);
                await queryRunner.rollbackTransaction()
                res.status(500).send({ status: 500, message: `internal server error.` });
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
            const tableName = await dbUtils.getIdTable(currentUser?.gameUserId!);
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }

            const hashedOldPass = await SealMemberDataSource.manager.query(`SELECT OLD_PASSWORD('${request.currentPassword}') AS hash_password`) as HashPasswordDTO[]
            const user = await SealMemberDataSource.manager.query(`SELECT * FROM ${tableName} WHERE id = '${currentUser?.gameUserId}'`) as idtable1[]
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
                    .where('usermsgex.userId = :userId', { userId: currentUser?.gameUserId })
                    .getOne();

                userMsgExEntity!.xixi = request.newPassword;

                await queryRunner.manager.query(`UPDATE ${tableName} SET passwd = '${hashedNewPass[0].hash_password}' WHERE id = '${currentUser?.gameUserId}'`);
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

            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            
            const requestApiKey = req.get('API-KEY') as string;
            if (requestApiKey != EONHUB_API_KEY) {
                console.error('Invalid API-KEY.');
                return res.sendStatus(401);
            }

            const dbUtils = new DBUtils();
            const request = req.body as TopupCashRequestDTO;
            const tableName = await dbUtils.getIdTable(request.email);
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }

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

    private updateNewPassword = async (newPassword: string, userId: string, userMsgExEntity: usermsgex) => {

        const hashedNewPass = await SealMemberDataSource.manager.query(`SELECT OLD_PASSWORD('${newPassword}') AS hash_password`) as HashPasswordDTO[]
        const dbUtils = new DBUtils();
        const tableName = await dbUtils.getIdTable(userId);
        const queryRunner = SealMemberDataSource.createQueryRunner();
        // await queryRunner.connect()
        await queryRunner.startTransaction()

        try {

            userMsgExEntity.xixi = newPassword;

            await queryRunner.manager.query(`UPDATE ${tableName} SET passwd = '${hashedNewPass[0].hash_password}' WHERE id = '${userId}'`);
            await queryRunner.manager.save(userMsgExEntity);

            await queryRunner.commitTransaction()

        } catch (error) {
            console.error(error);
            await queryRunner.rollbackTransaction()
        } finally {
            await queryRunner.release()
        }
    }

    public forgetPassword = async (req: Request, res: Response) => {

        try {

            const request = req.body as ForgetPasswordRequestDTO;
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }

            const userMsgExEntity = await SealMemberDataSource.createQueryBuilder()
                .select('usermsgex')
                .from(usermsgex, 'usermsgex')
                .where('usermsgex.email = :email', { email: request.email })
                .getOne();

            if (userMsgExEntity == null) {
                console.error('User is not found.');
                return res.status(400).json({ status: 400, message: 'Game Account is not found.' });
            }

            const newPassword = randomString(8);

            await this.updateNewPassword(newPassword, userMsgExEntity.userId, userMsgExEntity);

            await this.sendForgetPasswordEmail(request.email, newPassword);

            return res.status(200).json({ status: 200, message: 'New password will be sent to your EON-HUB email.' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    private sendForgetPasswordEmail = async (email: string, newPassword: string) => {

        const __dirname = path.resolve();
        const filePath = path.join(__dirname, '/src/resource/forget-pass-email.html');
        const source = fs.readFileSync(filePath, 'utf-8').toString();
        const template = handlebars.compile(source);
        const replacements = {
            newPassword: newPassword
        };
        const htmlToSend = template(replacements);
        const emailSender = transporter;

        emailSender.verify(function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log("Server is ready to take our messages");
            }
        });

        const mailOptions = {
            to: email,
            subject: '[SEAL-METAVERSE] Forget Password',
            html: htmlToSend
        };
        const info = await emailSender.sendMail(mailOptions);

        console.log("Email sent: %s", info.messageId);
    }

    public getAllCharacterName = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const currentUser = req.user as AuthenUser;

            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }

            const pcEntity = await GDB0101DataSource.manager.findBy(pc, { user_id: currentUser.gameUserId });
            let response: CharacterNameResponseDTO[] = [];

            pcEntity.forEach(eachPc => {
                let isOnline: boolean = true;
                if (eachPc.play_flag == 0) {
                    isOnline = false;
                }
                const resp: CharacterNameResponseDTO = {
                    characterName: eachPc.char_name,
                    isCharacterOnline: isOnline
                }

                response.push(resp);
            });

            return res.status(200).json({ status: 200, data: response });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public getUserDetail = async (req: Request, res: Response) => {
        try {

            const currentUser = req.user as AuthenUser;
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }

            const userDetail = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: currentUser.gameUserId });
            if (userDetail == null) {
                return res.status(400).json({ status: 400, message: 'User is not found.' })
            }

            const userEntity = await SealMemberDataSource.manager.findOneBy(usermsgex, { userId: currentUser.gameUserId });
            if (userEntity == null) {
                return res.status(400).json({ status: 400, message: 'User ID is not exist.' })
            }

            const storeService = new StoreService();
            const storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: currentUser.gameUserId });
            if (storeEntity == null) {
                return res.status(400).json({ status: 400, message: 'Character is not exist.' })
            }

            let rcAmount = 0;
            const rcItemId = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RC_ITEM_ID_CONFIG }).getOne())?.configValue));
            const rcAmountPosition = storeService.findItemAmountPositionInStoreEntity(rcItemId, storeEntity);
            if (rcAmountPosition) {
                rcAmount = Number(storeEntity[rcAmountPosition]) + 1
            }

            // rcAmount = storeService.countDuplicateItem(rcItemId, storeEntity)

            const cegelAmount = storeEntity.segel;

            let blueDragonAmount = 0;
            let redDragonAmount = 0;
            let crystalAmount = 0;

            const blueDragonItemIdConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.BLUE_DRAGON_ITEM_ID_CONFIG }).getOne())?.configValue));
            const redDragonItemIdConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RED_DRAGON_ITEM_ID_CONFIG }).getOne())?.configValue));
            const crystalItemIdConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.CRYSTAL_ITEM_ID_CONFIG }).getOne())?.configValue));
           
            const blueDragonAmountPosition = await storeService.findItemAmountPositionInStoreEntity(blueDragonItemIdConfig, storeEntity);
            if (blueDragonAmountPosition) {
                blueDragonAmount = Number(storeEntity[blueDragonAmountPosition]) + 1
            }
            // blueDragonAmount = storeService.countDuplicateItem(blueDragonItemIdConfig, storeEntity)
            const redDragonAmountPosition = await storeService.findItemAmountPositionInStoreEntity(redDragonItemIdConfig, storeEntity);
            if (redDragonAmountPosition) {
                redDragonAmount = Number(storeEntity[redDragonAmountPosition]) + 1
            }
            // redDragonAmount = storeService.countDuplicateItem(redDragonItemIdConfig, storeEntity)
            const crystalAmountPosition = await storeService.findItemAmountPositionInStoreEntity(crystalItemIdConfig, storeEntity);
            if (crystalAmountPosition) {
                crystalAmount = Number(storeEntity[crystalAmountPosition]) + 1
            }
            // crystalAmount = storeService.countDuplicateItem(crystalItemIdConfig, storeEntity)

            let userStatus = 'ACTIVE'
            // if (currentUser.userStatus != 1) {
            //     userStatus = 'INACTIVE'
            // }

            const response: UserDetailResponseDTO = {
                shardCommonPoint: userDetail.shardCommonPoint,
                shardUnCommonPoint: userDetail.shardUnCommonPoint,
                shardRarePoint: userDetail.shardRarePoint,
                shardEpicPoint: userDetail.shardEpicPoint,
                shardLegendaryPoint: userDetail.shardLegenPoint,
                crystalPoint: userDetail.crystalPoint,
                cashSpendPoint: userDetail.cashSpendPoint,
                rcAmount: rcAmount,
                cegelAmount: cegelAmount,
                cashPoint: Number(userEntity.gold),
                blueDragonAmount: blueDragonAmount,
                redDragonAmount: redDragonAmount,
                userLevel: userDetail.userLevel,
                userStatus: userStatus,
                crystalAmount: crystalAmount
            }

            return res.status(200).json({ status: 200, data: response });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

}