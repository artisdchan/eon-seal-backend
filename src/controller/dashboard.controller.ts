import { GDB0101DataSource, ItemDataSource, SealMemberDataSource } from "../data-source";
import { DashBoardResponseDTO, AllMoney, TopListType, CharacterItemDTO, AccountItemAmountDTO, ServerInfoResponseDTO, BotServerInfoResponse } from "../dto/dashboard.dto";
import { Request, Response } from "express"
import { pc } from "../entity/gdb0101/pc.entity";
import { usermsgex } from "../entity/seal_member/usermsgex.entity";
import { guildstore } from "../entity/gdb0101/guild_store.entity";
import { guildinfo } from "../entity/gdb0101/guild_info.entity";
import { inventory } from "../entity/gdb0101/inventory.entity";
import InventoryService from "../service/inventory.servic";
import { store } from "../entity/gdb0101/store.entity";
import StoreService from "../service/store.service";
import { WebConfig, WebConfigConstant } from "../entity/seal_member/web_config.entity";
import { AuthenUser } from "../dto/authen.dto";
import { MoreThan } from "typeorm";
import { WebUserDetail } from "../entity/seal_member/web_user_detail.entity";

export class DashboardController {

    public dashboard = async (req: Request, res: Response) => {

        if (!GDB0101DataSource.isInitialized) {
            await GDB0101DataSource.initialize();
        }
        if (!SealMemberDataSource.isInitialized) {
            await SealMemberDataSource.initialize();
        }
        if (!ItemDataSource.isInitialized) {
            await ItemDataSource.initialize();
        }

        try {

            const { topListType } = req.query;
            let response: DashBoardResponseDTO[] = [];

            if (topListType == TopListType.CEGEL) {

                const allResult = await GDB0101DataSource.manager.query('select s.user_id, SUM(s.segel + c.amount) as amount from store s inner join(select p.user_id,SUM(p.money + ifnull(0, gs.segel)) as amount from pc p left join guildinfo g on p.char_name = g.mastername left join guildstore gs  on g.name = gs.guildname INNER JOIN store s on p.user_id = s.user_id group by p.user_id order by amount desc) c ON s.user_id = c.user_id group by s.user_id order by amount desc limit 50;') as unknown as AllMoney[];
                for (let i = 0; i < 50; i++) {
                    response.push({ userId: allResult[i].user_id, amount: allResult[i].amount })
                }

            } else if (topListType == TopListType.CP) {

                const allCrystalPoint = await SealMemberDataSource.manager.getRepository(WebUserDetail)
                    .createQueryBuilder('webUser').select('webUser.user_id', 'user_id').addSelect('SUM(webUser.crystal_point)', 'amount')
                    .groupBy('webUser.user_id').orderBy('amount', 'DESC').limit(50).getRawMany();

                for (let each of allCrystalPoint) {
                    response.push({ userId: each.user_id, amount: each.amount })
                }

            } else if (topListType == TopListType.CASH) {

                const cashTopList = await SealMemberDataSource.manager.getRepository(usermsgex)
                    .createQueryBuilder('usermsgex').select('usermsgex.userId', 'userId').addSelect('SUM(usermsgex.gold)', 'amount')
                    .groupBy('usermsgex.userId').orderBy('amount', 'DESC').limit(50).getRawMany();

                for (let each of cashTopList) {
                    response.push({ userId: each.userId, amount: each.amount });
                }

            } else if (topListType == TopListType.CRYSTAL || topListType == TopListType.RUBY || topListType == TopListType.DIAMOND || topListType == TopListType.RC ||
                topListType == TopListType.G4 || topListType == TopListType.G5 || topListType == TopListType.G6 || topListType == TopListType.G7 || topListType == TopListType.G8 ||
                topListType == TopListType.G10 || topListType == TopListType.G12 || topListType == TopListType.G13 || topListType == TopListType.G14) {

                let itemId = 27232;
                if (topListType == TopListType.CRYSTAL) {
                    itemId = Number((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.CRYSTAL_ITEM_ID_CONFIG }).getOne())?.configValue)
                } else if (topListType == TopListType.RUBY) {
                    itemId = Number((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RUBY_ITEM_ID_CONFIG }).getOne())?.configValue);
                } else if (topListType == TopListType.DIAMOND) {
                    itemId = Number((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.DIAMOND_ITEM_ID_CONFIG }).getOne())?.configValue);
                } else if (topListType == TopListType.RC) {
                    itemId = Number((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RC_ITEM_ID_CONFIG }).getOne())?.configValue);
                } else if (topListType == TopListType.G4) {
                    itemId = 5362
                } else if (topListType == TopListType.G5) {
                    itemId = 5363
                } else if (topListType == TopListType.G6) {
                    itemId = 5364
                } else if (topListType == TopListType.G7) {
                    itemId = 5365
                } else if (topListType == TopListType.G8) {
                    itemId = 5366
                } else if (topListType == TopListType.G10) {
                    itemId = 5368
                } else if (topListType == TopListType.G12) {
                    itemId = 5370
                } else if (topListType == TopListType.G13) {
                    itemId = 5371
                } else if (topListType == TopListType.G14) {
                    itemId = 5372
                }

                const countItemFromInventory: AccountItemAmountDTO[] = await this.countItemFromInventory(itemId);
                const countItemFromStore: AccountItemAmountDTO[] = await this.countItemFromStore(itemId);
                let result: AccountItemAmountDTO[] = [];

                let storeMap = new Map<string, number>();
                for (let eachStore of countItemFromStore) {
                    storeMap.set(eachStore.userId, eachStore.amount)
                }

                let invMap = new Map<string, number>();
                for (let eachInv of countItemFromInventory) {
                    invMap.set(eachInv.userId, eachInv.amount)
                }

                let resMap = new Map([...storeMap])
                invMap.forEach((value, key) => {
                    if (resMap.has(key)) {
                        resMap.set(key, resMap.get(key)! + value);
                    } else {
                        resMap.set(key, value);
                    }
                });

                resMap.forEach((value, key) => {
                    result.push({
                        userId: key,
                        amount: value
                    })
                })

                if (result.length > 0) {

                    result.sort((n1, n2) => { return n1.amount < n2.amount ? 1 : -1 });

                    let size = 50;
                    if (size > result.length) {
                        size = result.length
                    }
                    for (let i = 0; i < size; i++) {
                        response.push({ userId: result[i].userId, amount: result[i].amount })
                    }

                }

            } else {
                // DO NOTHING
            }

            return res.status(200).json({ status: 200, data: response });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public serverInfo = async (req: Request, res: Response) => {

        if (!GDB0101DataSource.isInitialized) {
            await GDB0101DataSource.initialize();
        }
        if (!SealMemberDataSource.isInitialized) {
            await SealMemberDataSource.initialize();
        }
        if (!ItemDataSource.isInitialized) {
            await ItemDataSource.initialize();
        }

        try {

            const currentUser = req.user as AuthenUser;
            //  Get all online players.
            const countOnlinePlayer = await GDB0101DataSource.manager.countBy(pc, { play_flag: MoreThan(0) });
            //  Get all CASH
            const queryAllCash = await SealMemberDataSource.manager.getRepository(usermsgex).createQueryBuilder('user')
                .select('SUM(user.gold)', 'amount').getRawOne();
            //  Get all Cegel
            const queryAllCelgel = await GDB0101DataSource.manager.query('select SUM(s.segel + c.amount) as amount from store s inner join(select p.user_id,SUM(p.money + ifnull(0, gs.segel)) as amount from pc p left join guildinfo g on p.char_name = g.mastername left join guildstore gs  on g.name = gs.guildname INNER JOIN store s on p.user_id = s.user_id group by p.user_id order by amount desc) c ON s.user_id = c.user_id  order by amount desc; ') as unknown as AllMoney[];
            // const allCelgelAmount = queryAllCelgel.reduce((sum, each) => sum + each.amount, 0);
            const allCelgelAmount = queryAllCelgel[0].amount
            //  Get all Crystal
            let sumCrystal = 0
            const crystalConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.CRYSTAL_ITEM_ID_CONFIG }).getOne())?.configValue));
            const allCrystalFromInv = await (await this.countItemFromInventory(crystalConfig));
            for (let each of allCrystalFromInv) {
                sumCrystal += each.amount
            }
            const allCrystalFromStore = await (await this.countItemFromStore(crystalConfig));
            for (let each of allCrystalFromStore) {
                sumCrystal += each.amount
            }
            //  Get all Ruby
            const rubyConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RUBY_ITEM_ID_CONFIG }).getOne())?.configValue));
            let sumRuby = 0
            const allRubyFromInv = await (await this.countItemFromInventory(rubyConfig));
            for (let each of allRubyFromInv) {
                sumRuby += each.amount
            }
            const allRubyFromStore = await (await this.countItemFromStore(rubyConfig));
            for (let each of allRubyFromStore) {
                sumRuby += each.amount
            }
            //  Get all Diamond
            const diamondConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.DIAMOND_ITEM_ID_CONFIG }).getOne())?.configValue));
            let sumDiamond = 0
            const allDiamondFromInv = await (await this.countItemFromInventory(diamondConfig));
            for (let each of allDiamondFromInv) {
                sumDiamond += each.amount
            }
            const allDiamondFromStore = await (await this.countItemFromStore(diamondConfig));
            for (let each of allDiamondFromStore) {
                sumDiamond += each.amount
            }
            //  Get all RC
            const rcConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RC_ITEM_ID_CONFIG }).getOne())?.configValue));
            let sumRc = 0
            const allRcFromInv = await (await this.countItemFromInventory(rcConfig));
            for (let each of allRcFromInv) {
                console.log(each.amount)
                sumRc += each.amount
            }
            const allRcFromStore = await (await this.countItemFromStore(rcConfig));
            for (let each of allRcFromStore) {
                console.log(each.amount)
                sumRc += each.amount
            }

            const allCrystalPoint = await SealMemberDataSource.manager.getRepository(WebUserDetail)
                .createQueryBuilder('webUser').select('SUM(webUser.crystal_point)', 'amount').getRawOne()

            const response: ServerInfoResponseDTO = {
                allOnlinePlayer: countOnlinePlayer,
                allCash: Number(queryAllCash.amount),
                allCegel: allCelgelAmount,
                allCrystal: sumCrystal,
                allRuby: sumRuby,
                allDiamond: sumDiamond,
                allRc: sumRc,
                allCrystalPoint: allCrystalPoint.amount
            }

            return res.status(200).json({ status: 200, data: response })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    private countItemFromInventory = async (itemId: number) => {

        const inventoryService = new InventoryService();
        let accountItemFromInv: AccountItemAmountDTO[] = []

        const inventoryEntity = await GDB0101DataSource.manager.find(inventory);
        for (let each of inventoryEntity) {
            const itemPos = inventoryService.getAllDuplicatePosition(itemId, each)
            for (let eachPos of itemPos) {
                const amountPos = inventoryService.findItemAmountPositionFromItemPosition(eachPos, each)

                const user = await GDB0101DataSource.manager.findOneBy(pc, { char_name: each.char_name });
                if (user != null) {
                    accountItemFromInv.push({ userId: user.user_id, amount: Number(each[amountPos]) + 1 });
                }
            }
        }
        // for (let each of inventoryEntity) {
        //     const amountPosition = inventoryService.findItemAmountPositionInInventoryEntity(itemId, each);
        //     if (amountPosition != undefined) {
        //         console.log(each.char_name)
        //         const user = await GDB0101DataSource.manager.findOneBy(pc, { char_name: each.char_name });
        //         if (user != null) {
        //             accountItemFromInv.push({ userId: user.user_id, amount: Number(each[amountPosition]) + 1 });
        //         }
        //     }
        // }

        return accountItemFromInv;

    }

    public serverInfoBot = async (req: Request, res: Response) => {
        try {

            const countOnlinePlayer = await GDB0101DataSource.manager.countBy(pc, { play_flag: MoreThan(0) });
            //  Get all CASH
            const queryAllCash = await SealMemberDataSource.manager.getRepository(usermsgex).createQueryBuilder('user')
                .select('SUM(user.gold)', 'amount').getRawOne();
            //  Get all Cegel
            const queryAllCelgel = await GDB0101DataSource.manager.query('select SUM(s.segel + c.amount) as amount from store s inner join(select p.user_id,SUM(p.money + ifnull(0, gs.segel)) as amount from pc p left join guildinfo g on p.char_name = g.mastername left join guildstore gs  on g.name = gs.guildname INNER JOIN store s on p.user_id = s.user_id group by p.user_id order by amount desc) c ON s.user_id = c.user_id  order by amount desc; ') as unknown as AllMoney[];
            // const allCelgelAmount = queryAllCelgel.reduce((sum, each) => sum + each.amount, 0);
            const allCelgelAmount = queryAllCelgel[0].amount
            //  Get all Crystal
            let sumCrystal = 0
            const crystalConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.CRYSTAL_ITEM_ID_CONFIG }).getOne())?.configValue));
            const allCrystalFromInv = await (await this.countItemFromInventory(crystalConfig));
            for (let each of allCrystalFromInv) {
                sumCrystal += each.amount
            }
            const allCrystalFromStore = await (await this.countItemFromStore(crystalConfig));
            for (let each of allCrystalFromStore) {
                sumCrystal += each.amount
            }
            //  Get all Ruby
            const rubyConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RUBY_ITEM_ID_CONFIG }).getOne())?.configValue));
            let sumRuby = 0
            const allRubyFromInv = await (await this.countItemFromInventory(rubyConfig));
            for (let each of allRubyFromInv) {
                sumRuby += each.amount
            }
            const allRubyFromStore = await (await this.countItemFromStore(rubyConfig));
            for (let each of allRubyFromStore) {
                sumRuby += each.amount
            }
            //  Get all Diamond
            const diamondConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.DIAMOND_ITEM_ID_CONFIG }).getOne())?.configValue));
            let sumDiamond = 0
            const allDiamondFromInv = await (await this.countItemFromInventory(diamondConfig));
            for (let each of allDiamondFromInv) {
                sumDiamond += each.amount
            }
            const allDiamondFromStore = await (await this.countItemFromStore(diamondConfig));
            for (let each of allDiamondFromStore) {
                sumDiamond += each.amount
            }
            //  Get all RC
            const rcConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RC_ITEM_ID_CONFIG }).getOne())?.configValue));
            let sumRc = 0
            const allRcFromInv = await (await this.countItemFromInventory(rcConfig));
            for (let each of allRcFromInv) {
                console.log(each.amount)
                sumRc += each.amount
            }
            const allRcFromStore = await (await this.countItemFromStore(rcConfig));
            for (let each of allRcFromStore) {
                console.log(each.amount)
                sumRc += each.amount
            }

            const allCrystalPoint = await SealMemberDataSource.manager.getRepository(WebUserDetail)
                .createQueryBuilder('webUser').select('SUM(webUser.crystal_point)', 'amount').getRawOne()

            const response: BotServerInfoResponse = {
                allOnlinePlayer: countOnlinePlayer,
                allCash: Number(queryAllCash.amount),
                allCegel: allCelgelAmount,
                allCrystal: sumCrystal,
                allRuby: sumRuby,
                allDiamond: sumDiamond,
                allRc: sumRc,
                allCrystalPoint: allCrystalPoint.amount
            }

            return res.status(200).json({ status: 200, data: response })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public dashboardBot = async (req: Request, res: Response) => {

        if (!GDB0101DataSource.isInitialized) {
            await GDB0101DataSource.initialize();
        }
        if (!SealMemberDataSource.isInitialized) {
            await SealMemberDataSource.initialize();
        }
        if (!ItemDataSource.isInitialized) {
            await ItemDataSource.initialize();
        }

        try {

            const { topListType } = req.query;
            let response: DashBoardResponseDTO[] = [];

            if (topListType == TopListType.CEGEL) {

                const allResult = await GDB0101DataSource.manager.query('select s.user_id, SUM(s.segel + c.amount) as amount from store s inner join(select p.user_id,SUM(p.money + ifnull(0, gs.segel)) as amount from pc p left join guildinfo g on p.char_name = g.mastername left join guildstore gs  on g.name = gs.guildname INNER JOIN store s on p.user_id = s.user_id group by p.user_id order by amount desc) c ON s.user_id = c.user_id group by s.user_id order by amount desc limit 50;') as unknown as AllMoney[];
                for (let i = 0; i < 20; i++) {
                    response.push({ userId: allResult[i].user_id, amount: allResult[i].amount })
                }

            } else if (topListType == TopListType.CP) {

                const allCrystalPoint = await SealMemberDataSource.manager.getRepository(WebUserDetail)
                    .createQueryBuilder('webUser').select('webUser.user_id', 'user_id').addSelect('SUM(webUser.crystal_point)', 'amount')
                    .groupBy('webUser.user_id').orderBy('amount', 'DESC').limit(20).getRawMany();

                for (let each of allCrystalPoint) {
                    response.push({ userId: each.user_id, amount: each.amount })
                }

            } else if (topListType == TopListType.CASH) {

                const cashTopList = await SealMemberDataSource.manager.getRepository(usermsgex)
                    .createQueryBuilder('usermsgex').select('usermsgex.userId', 'userId').addSelect('SUM(usermsgex.gold)', 'amount')
                    .groupBy('usermsgex.userId').orderBy('amount', 'DESC').limit(20).getRawMany();

                for (let each of cashTopList) {
                    response.push({ userId: each.userId, amount: each.amount });
                }

            } else if (topListType == TopListType.CRYSTAL || topListType == TopListType.RUBY || topListType == TopListType.DIAMOND || topListType == TopListType.RC ||
                topListType == TopListType.G4 || topListType == TopListType.G5 || topListType == TopListType.G6 || topListType == TopListType.G7 || topListType == TopListType.G8 ||
                topListType == TopListType.G10 || topListType == TopListType.G12 || topListType == TopListType.G13 || topListType == TopListType.G14) {

                let itemId = 27232;
                if (topListType == TopListType.CRYSTAL) {
                    itemId = Number((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.CRYSTAL_ITEM_ID_CONFIG }).getOne())?.configValue)
                } else if (topListType == TopListType.RUBY) {
                    itemId = Number((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RUBY_ITEM_ID_CONFIG }).getOne())?.configValue);
                } else if (topListType == TopListType.DIAMOND) {
                    itemId = Number((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.DIAMOND_ITEM_ID_CONFIG }).getOne())?.configValue);
                } else if (topListType == TopListType.RC) {
                    itemId = Number((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RC_ITEM_ID_CONFIG }).getOne())?.configValue);
                } else if (topListType == TopListType.G4) {
                    itemId = 5362
                } else if (topListType == TopListType.G5) {
                    itemId = 5363
                } else if (topListType == TopListType.G6) {
                    itemId = 5364
                } else if (topListType == TopListType.G7) {
                    itemId = 5365
                } else if (topListType == TopListType.G8) {
                    itemId = 5366
                } else if (topListType == TopListType.G10) {
                    itemId = 5368
                } else if (topListType == TopListType.G12) {
                    itemId = 5370
                } else if (topListType == TopListType.G13) {
                    itemId = 5371
                } else if (topListType == TopListType.G14) {
                    itemId = 5372
                }

                const countItemFromInventory: AccountItemAmountDTO[] = await this.countItemFromInventory(itemId);
                const countItemFromStore: AccountItemAmountDTO[] = await this.countItemFromStore(itemId);
                let result: AccountItemAmountDTO[] = [];

                let storeMap = new Map<string, number>();
                for (let eachStore of countItemFromStore) {
                    storeMap.set(eachStore.userId, eachStore.amount)
                }

                let invMap = new Map<string, number>();
                for (let eachInv of countItemFromInventory) {
                    invMap.set(eachInv.userId, eachInv.amount)
                }

                let resMap = new Map([...storeMap])
                invMap.forEach((value, key) => {
                    if (resMap.has(key)) {
                        resMap.set(key, resMap.get(key)! + value);
                    } else {
                        resMap.set(key, value);
                    }
                });

                resMap.forEach((value, key) => {
                    result.push({
                        userId: key,
                        amount: value
                    })
                })

                if (result.length > 0) {

                    result.sort((n1, n2) => { return n1.amount < n2.amount ? 1 : -1 });

                    let size = 20;
                    if (size > result.length) {
                        size = result.length
                    }
                    for (let i = 0; i < size; i++) {
                        response.push({ userId: result[i].userId, amount: result[i].amount })
                    }

                }

            } else {
                // DO NOTHING
            }

            return res.status(200).json({ status: 200, data: response });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public findItBug = async (req: Request, res: Response) => {
        try {

            let accountItemFromStore: AccountItemAmountDTO[] = []
            const storeService = new StoreService();
            const storeEntity = await GDB0101DataSource.manager.find(store);
            for (let each of storeEntity) {
                const itemPos = storeService.getBugPos(30000, each)
                for (let eachPos of itemPos) {
                    type ObjectKey = keyof typeof store;

                    // const amountPos = storeService.findItemAmountPositionFromItemPosition(eachPos, each)
                    const tmp = eachPos as ObjectKey
                    accountItemFromStore.push({ userId: each.user_id, amount: Number(itemPos) });
                }
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }


    }

    private countItemFromStore = async (itemId: number) => {

        const storeService = new StoreService();
        let accountItemFromStore: AccountItemAmountDTO[] = []

        const storeEntity = await GDB0101DataSource.manager.find(store);
        for (let each of storeEntity) {
            const itemPos = storeService.getAllDuplicatePosition(itemId, each)
            for (let eachPos of itemPos) {
                const amountPos = storeService.findItemAmountPositionFromItemPosition(eachPos, each)
                accountItemFromStore.push({ userId: each.user_id, amount: Number(each[amountPos]) + 1 });
            }
        }

        return accountItemFromStore;

    }

}
