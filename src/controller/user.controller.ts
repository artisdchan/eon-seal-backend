import { Request, Response, NextFunction } from "express"
import handlebars from "handlebars";
import path from "path";
import { GDB0101DataSource, ItemDataSource, SealMemberDataSource } from "../data-source";
import { AuthenUser } from "../dto/authen.dto";
import { AddTopupCreditRequestDTO, CharacterNameResponseDTO, ForgetPasswordRequestDTO, HashPasswordDTO, RegisterRequestDTO, ResetPasswordDTO, TopupCashRequestDTO, UserDetailResponseDTO, UserInfoResponseDTO } from "../dto/user.dto";
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
import CashInventoryService from "../service/cash_inventory.service";
import { CashInventory } from "../entity/gdb0101/cash_inventory.entity";
import { SealItem } from "../entity/item/seal_item.entity";
import { MarketWhiteList, WhiteListItemBag } from "../entity/item/market_white_list.entity";
import { ItemDetail } from "../dto/market.dto";
import { PurchasePackageHistory } from "../entity/item/purchase_package_history.entity";
import { Package, PackageStatus, PackageType } from "../entity/item/package.entity";
import { PackageDetail, PackageItemBag } from "../entity/item/package_detail.entity";
import LogService from "../service/log.service";
import ItemService from "../service/item.service";
import { ItemLevel } from "../entity/item/fusion_item.entity";
import { WebConfig, WebConfigConstant } from "../entity/seal_member/web_config.entity";
import { AllMoney } from "../dto/dashboard.dto";
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

            const reg = /^[a-zA-Z]/
            if (!reg.test(request.username)) {
                return res.status(400).json({ status: 400, message: 'invalid username' })
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

            // if (request.storePass.toString().length < 4) {
            //     return res.status(400).json({ status: 400, message: 'Invalid store password.' })
            // }

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

                let storePass = request.storePass
                if (storePass < 0) {
                    storePass = 123456
                }
                await queryRunner.manager.save(userModel);
                await queryRunner.manager.save(webUserDetailEntity);
                await GDB0101DataSource.manager.query(storeService.initialStoreQueryString(request.username, storePass));

                await queryRunner.commitTransaction()
            } catch (error) {
                console.error(error);
                await queryRunner.rollbackTransaction()
                return res.status(500).send({ status: 500, message: `internal server error.` });
            } finally {
                await queryRunner.release()
            }

            return res.sendStatus(201);
            // return next();

        } catch (error) {
            console.error(error);
            return res.status(500).send({ status: 500, message: `internal server error.` });
            // return next(null)
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


            await SealMemberDataSource.manager.query(`UPDATE ${tableName} SET point = ${userMsgExEntity.gold} WHERE email = '${request.email}'`)

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

            const userDetail = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: currentUser.gameUserId, status: 'ACTIVE' });
            if (userDetail == null) {
                return res.status(400).json({ status: 400, message: 'User is not found.' })
            }

            const userEntity = await SealMemberDataSource.manager.findOneBy(usermsgex, { userId: currentUser.gameUserId });
            if (userEntity == null) {
                return res.status(400).json({ status: 400, message: 'User ID is not exist.' })
            }

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
                cashPoint: Number(userEntity.gold),
                userLevel: userDetail.userLevel,
                userStatus: userStatus,
                topupCredit: userDetail.topupCredit,
                email: userEntity.email!
            }

            return res.status(200).json({ status: 200, data: response });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public userInfo = async (req: Request, res: Response) => {
        try {

            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }

            const { email } = req.query

            const requestApiKey = req.get('API-KEY') as string;
            if (requestApiKey != EONHUB_API_KEY) {
                console.error('Invalid API-KEY.');
                return res.sendStatus(401);
            }

            const usr = await SealMemberDataSource.manager.findOneBy(usermsgex, { email: String(email) })
            if (usr == null) {
                return res.status(400).json({ status: 400, message: 'Game ID is not found' })
            }

            const pcEntity = await GDB0101DataSource.manager.findBy(pc, { user_id: usr?.userId });
            let charNames: string[] = []
            let highestLevel: number = 0
            for (let each of pcEntity) {
                charNames.push(each.char_name)
                if (each.level > highestLevel) {
                    highestLevel = each.level
                }
            }

            const userWeb = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: String(usr.userId), status: 'ACTIVE' })
            if (userWeb == null) {
                return res.status(400).json({ status: 400, message: 'user not found' })
            }

            const storeEntity = await GDB0101DataSource.manager.findOneBy(store, { user_id: userWeb.user_id })
            if (storeEntity == null) {
                return res.status(400).json({ status: 400, message: 'user not found' })
            }

            const response: UserInfoResponseDTO = {
                gameUserId: usr.userId,
                characterNames: charNames,
                cpAmount: userWeb.crystalPoint,
                cegelAmount: storeEntity.segel,
                topUpCredit: userWeb.topupCredit,
                highestLevel: highestLevel
            }

            return res.status(200).json({ status: 200, data: response })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public addTopupCredit = async (req: Request, res: Response) => {
        try {

            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }

            const request = req.body as AddTopupCreditRequestDTO

            const usermsgexEntity = await SealMemberDataSource.manager.findOneBy(usermsgex, { email: request.email })
            if (usermsgexEntity == null) {
                console.error('add topup credit: user not found')
                return res.status(400).json({ status: 400, message: 'user not found' })
            }

            const webUser = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: usermsgexEntity.userId, status: 'ACTIVE' })
            if (webUser == null) {
                console.error('add topup credit: user not found')
                return res.status(400).json({ status: 400, message: 'user not found' })
            }

            webUser.topupCredit += request.creditAmount
            webUser.totalTopup += request.creditAmount
            await SealMemberDataSource.manager.getRepository(WebUserDetail).save(webUser)

            if (webUser.totalTopup >= 300000) {

                const logService = new LogService()
                const itemService = new ItemService();

                const packageEntity = await ItemDataSource.manager.findBy(Package, { packageType: PackageType.TOTAL_TOPUP_REWARD, status: PackageStatus.INACTIVE })
                if (packageEntity == null) {
                    return res.status(400).json({ status: 400, message: 'invalid package.' })
                }

                for (let eachPack of packageEntity) {

                    // Account purchase limit
                    const historyCount = await ItemDataSource.manager.countBy(PurchasePackageHistory, { packageId: eachPack.packageId, purchasedByUserId: webUser.user_id })
                    if (eachPack.purchaseCountCond != 0) {
                        if (eachPack.purchaseCountCond > historyCount && eachPack.priceTopupCredit <= webUser.totalTopup) {
                            const packageDetailEntity = await ItemDataSource.manager.findBy(PackageDetail, { packageId: eachPack.packageId })

                            for (let eachItem of packageDetailEntity) {
                                let log = await logService.insertLogItemTransaction(`TOPUP_CREDIT_SHOP`, "ADD_ITEM", "PREPARE_PROCESS", webUser.user_id, undefined);

                                let errMsg = "";
                                // add item into store
                                if (eachItem.itemBag == PackageItemBag.IN_GAME_ITEM_INVENTORY) {
                                    errMsg = await itemService.insertBackInventory(webUser.user_id, eachItem.itemId, eachItem.itemAmount, eachItem.itemEffect, eachItem.itemRefineOrLimit);
                                    if (errMsg != "") {
                                        log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_IN_GAME_INVENTORY", errMsg + `, ItemId: ${eachItem.itemId}`, log);
                                    }
                                } else if (eachItem.itemBag == PackageItemBag.ACCOUNT_CASH_INVENTORY) {
                                    errMsg = await itemService.insertAccountCashInventory(webUser.user_id, eachItem.itemId, eachItem.itemAmount, eachItem.itemEffect, eachItem.itemRefineOrLimit);
                                    if (errMsg != "") {
                                        log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_CASH_INVENTORY", errMsg + `, ItemId: ${eachItem.itemId}`, log);
                                    }
                                } else if (eachItem.itemBag == PackageItemBag.CHARACTER_CASH_INVENTORY) {
                                    // errMsg = await this.insertCharacterCashInventory(webUser.user_id, request.characterName, crystalShop.itemId, crystalShop.itemAmount);
                                    // if (errMsg != "") {
                                    //     log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg, log);
                                    //     return res.status(400).json({ status: 400, message: errMsg });
                                    // }
                                } else if (eachItem.itemBag == PackageItemBag.RANDOM_COSTUME_COMMON) {
                                    const randomItem = await itemService.randomCostume(ItemLevel.COMMON);
                                    errMsg = await itemService.insertAccountCashInventory(webUser.user_id, randomItem.itemId, 1, 0, 0);
                                    if (errMsg != "") {
                                        log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg + `, ItemId: ${eachItem.itemId}`, log);
                                    }
                                } else if (eachItem.itemBag == PackageItemBag.RANDOM_COSTUME_UNCOMMON) {
                                    const randomItem = await itemService.randomCostume(ItemLevel.UNCOMMON);
                                    errMsg = await itemService.insertAccountCashInventory(webUser.user_id, randomItem.itemId, 1, 0, 0);
                                    if (errMsg != "") {
                                        log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg + `, ItemId: ${eachItem.itemId}`, log);
                                    }
                                } else if (eachItem.itemBag == PackageItemBag.RANDOM_COSTUME_RARE) {
                                    const randomItem = await itemService.randomCostume(ItemLevel.RARE);
                                    errMsg = await itemService.insertAccountCashInventory(webUser.user_id, randomItem.itemId, 1, 0, 0);
                                    if (errMsg != "") {
                                        log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg + `, ItemId: ${eachItem.itemId}`, log);
                                    }
                                } else if (eachItem.itemBag == PackageItemBag.RANDOM_COSTUME_EPIC) {
                                    const randomItem = await itemService.randomCostume(ItemLevel.EPIC);
                                    errMsg = await itemService.insertAccountCashInventory(webUser.user_id, randomItem.itemId, 1, 0, 0);
                                    if (errMsg != "") {
                                        log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg + `, ItemId: ${eachItem.itemId}`, log);
                                    }
                                } else if (eachItem.itemBag == PackageItemBag.STACK_IN_GAME_ITEM) {
                                    errMsg = await itemService.insertStackItem(webUser.user_id, eachItem.itemId, eachItem.itemAmount, eachItem.itemEffect, eachItem.itemRefineOrLimit);
                                    if (errMsg != "") {
                                        log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg + `, ItemId: ${eachItem.itemId}`, log);
                                    }
                                } else {
                                    // DO NOTHING
                                }

                                log = await logService.updateLogItemTransaction("ADD_ITEM_SUCCESS", `ItemId: ${eachItem.itemId}`, log);

                            }

                            await ItemDataSource.manager.save(PurchasePackageHistory, {
                                packageId: eachPack.packageId,
                                purchasedByUserId: webUser.user_id,
                                purchasedByEmail: usermsgexEntity.email,
                                purchasedTime: new Date
                            })
                        }
                    }

                }
            }

            return res.status(200).json({ status: 200, data: 'success' })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public disconnectCharacter = async (req: Request, res: Response) => {
        try {

            const currentUser = req.user as AuthenUser

            const pcEntity = await GDB0101DataSource.manager.findBy(pc, { user_id: currentUser.gameUserId })
            if (pcEntity == null) {
                return res.status(400).json({ status: 400, message: 'Character not found.' })
            }

            for (let each of pcEntity) {
                each.play_flag = 0
                await GDB0101DataSource.manager.getRepository(pc).save(each)
            }

            return res.status(200).json({ status: 200, data: null })
            
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public getCrytalTax = async (req: Request, res: Response) => {
        try {

            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }

            const cegelTaxConfig = await SealMemberDataSource.manager.findOneBy(WebConfig, { configKey: WebConfigConstant.CRYSTAL_CONVERT_TAX });
            if (cegelTaxConfig == null) {
                return res.status(400).json({ status: 400, message: 'Configuration is not found.' })
            }

            //  Get all Cegel
            const queryAllCelgel = await GDB0101DataSource.manager.query('select SUM(s.segel + c.amount + IFNULL(0, (s.negel * 100000000))) as amount from gdb0101.store s inner join(select p.user_id,SUM(p.money + ifnull(0, gs.segel) + IFNULL(0, (gs.negel * 100000000)) ) as amount from gdb0101.pc p left join gdb0101.guildinfo g on p.char_name = g.mastername left join gdb0101.guildstore gs  on g.name = gs.guildname INNER JOIN gdb0101.store s on p.user_id = s.user_id group by p.user_id order by amount desc) c ON s.user_id = c.user_id  order by amount desc; ') as unknown as AllMoney[];

            const tax = Number(Number(cegelTaxConfig.configValue) + (Number((queryAllCelgel[0].amount / (5000 / 1.5)).toFixed(0))))

            return res.status(200).json({ status: 200, data: tax })
            
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: 500, message: 'Internal server error.' })
        }
    }

}