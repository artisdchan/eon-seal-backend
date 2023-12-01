import { GDB0101DataSource, ItemDataSource, SealMemberDataSource } from "../data-source";
import { DashBoardResponseDTO, AllMoney, TopListType, CharacterItemDTO, AccountItemAmountDTO, ServerInfoResponseDTO } from "../dto/dashboard.dto";
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

                const allResult = await GDB0101DataSource.manager.query('select p.user_id, SUM(p.money + ifnull(0, gs.segel)) as amount from pc p left join guildinfo g on p.char_name = g.mastername left join guildstore gs  on g.name = gs.guildname group by p.user_id order by amount desc') as unknown as AllMoney[];
                for (let i = 0; i < 10; i++) {
                    response.push({ userId: allResult[i].user_id, amount: allResult[i].amount })
                }

            } else if (topListType == TopListType.CASH) {

                const cashTopList = await SealMemberDataSource.manager.getRepository(usermsgex)
                    .createQueryBuilder('usermsgex').select('usermsgex.userId', 'userId').addSelect('SUM(usermsgex.gold)', 'amount')
                    .groupBy('usermsgex.userId').orderBy('amount', 'DESC').limit(10).getRawMany();

                for (let each of cashTopList) {
                    response.push({ userId: each.userId, amount: each.amount });
                }

            } else if (topListType == TopListType.CRYSTAL || topListType == TopListType.RUBY || topListType == TopListType.DIAMOND || topListType == TopListType.RC) {

                let itemId = 27232;
                if (topListType == TopListType.CRYSTAL) {
                    itemId = Number((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.CRYSTAL_ITEM_ID_CONFIG }).getOne())?.configValue)
                } else if (topListType == TopListType.RUBY) {
                    itemId = Number((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RUBY_ITEM_ID_CONFIG }).getOne())?.configValue);
                } else if (topListType == TopListType.DIAMOND) {
                    itemId = Number((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.DIAMOND_ITEM_ID_CONFIG }).getOne())?.configValue);
                } else if (topListType == TopListType.RC) {
                    itemId = Number((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RC_ITEM_ID_CONFIG }).getOne())?.configValue);
                }
                const countItemFromInventory = await this.countItemFromInventory(itemId);
                const countItemFromStore = await this.countItemFromStore(itemId);
                let result: AccountItemAmountDTO[] = [];

                if (countItemFromInventory.length != 0) {

                    for (let eachInv of countItemFromInventory) {

                        let found = false;
                        for (let eachStore of countItemFromStore) {
                            if (eachInv.userId == eachStore.userId) {
                                found = true;
                                result.push({ userId: eachInv.userId, amount: eachInv.amount + eachStore.amount });
                            }
                        }

                        if (!found) {
                            result.push({ userId: eachInv.userId, amount: eachInv.amount });
                        }

                    }

                } else {

                    for (let eachStore of countItemFromStore) {
                        result.push({ userId: eachStore.userId, amount: eachStore.amount });
                    }

                }

                if (result.length > 0) {

                    result.sort((n1, n2) => { return n1.amount < n2.amount ? 1 : -1 });

                    let size = 10;
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
            const queryAllCelgel = await GDB0101DataSource.manager.query('select SUM(p.money + ifnull(0, gs.segel)) as amount from pc p left join guildinfo g on p.char_name = g.mastername left join guildstore gs  on g.name = gs.guildname ') as unknown as AllMoney[];
            // const allCelgelAmount = queryAllCelgel.reduce((sum, each) => sum + each.amount, 0);
            const allCelgelAmount = queryAllCelgel[0].amount
            //  Get all Crystal
            const crystalConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.CRYSTAL_ITEM_ID_CONFIG }).getOne())?.configValue));
            const allCrystalFromInv = await (await this.countItemFromInventory(crystalConfig)).reduce((sum, each) => sum + each.amount, 0);
            const allCrystalFromStore = await (await this.countItemFromStore(crystalConfig)).reduce((sum, each) => sum + each.amount, 0);
            //  Get all Ruby
            const rubyConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RUBY_ITEM_ID_CONFIG }).getOne())?.configValue));
            const allRubyFromInv = await (await this.countItemFromInventory(rubyConfig)).reduce((sum, each) => sum + each.amount, 0);
            const allRubyFromStore = await (await this.countItemFromStore(rubyConfig)).reduce((sum, each) => sum + each.amount, 0);
            //  Get all Diamond
            const diamondConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.DIAMOND_ITEM_ID_CONFIG }).getOne())?.configValue));
            const allDiamondFromInv = await (await this.countItemFromInventory(diamondConfig)).reduce((sum, each) => sum + each.amount, 0);
            const allDiamondFromStore = await (await this.countItemFromStore(diamondConfig)).reduce((sum, each) => sum + each.amount, 0);
            //  Get all RC
            const rcConfig = Number(((await SealMemberDataSource.manager.getRepository(WebConfig).createQueryBuilder('config').select('config.configValue').where('config.config_key = :key', { key: WebConfigConstant.RC_ITEM_ID_CONFIG }).getOne())?.configValue));
            const allRcFromInv = await (await this.countItemFromInventory(rcConfig)).reduce((sum, each) => sum + each.amount, 0);
            const allRcFromStore = await (await this.countItemFromStore(rcConfig)).reduce((sum, each) => sum + each.amount, 0);

            const response: ServerInfoResponseDTO = {
                allOnlinePlayer: countOnlinePlayer,
                allCash: Number(queryAllCash.amount),
                allCegel: allCelgelAmount,
                allCrystal: allCrystalFromInv + allCrystalFromStore,
                allRuby: allRubyFromInv + allRubyFromStore,
                allDiamond: allDiamondFromInv + allDiamondFromStore,
                allRc: allRcFromInv + allRcFromStore
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
            const amountPosition = inventoryService.findItemAmountPositionInInventoryEntity(itemId, each);
            if (amountPosition != undefined) {
                console.log(each.char_name)
                const user = await GDB0101DataSource.manager.findOneBy(pc, { char_name: each.char_name });
                if (user != null) {
                    accountItemFromInv.push({ userId: user.user_id, amount: Number(each[amountPosition]) + 1 });
                }
            }
        }

        return accountItemFromInv;

    }

    private countItemFromStore = async (itemId: number) => {

        const storeService = new StoreService();
        let accountItemFromStore: AccountItemAmountDTO[] = []

        const storeEntity = await GDB0101DataSource.manager.find(store);
        for (let each of storeEntity) {
            const amountPosition = storeService.findItemAmountPositionInStoreEntity(itemId, each);
            if (amountPosition != undefined) {
                accountItemFromStore.push({ userId: each.user_id, amount: Number(each[amountPosition]) + 1 });
            }
        }

        return accountItemFromStore;

    }

}
