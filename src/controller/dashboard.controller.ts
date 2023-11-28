import { GDB0101DataSource, ItemDataSource, SealMemberDataSource } from "../data-source";
import { DashBoardResponseDTO, AllMoney, TopListType, CharacterItemDTO } from "../dto/dashboard.dto";
import { Request, Response } from "express"
import { pc } from "../entity/gdb0101/pc.entity";
import { usermsgex } from "../entity/seal_member/usermsgex.entity";
import { guildstore } from "../entity/gdb0101/guild_store.entity";
import { guildinfo } from "../entity/gdb0101/guild_info.entity";
import { inventory } from "../entity/gdb0101/inventory.entity";
import InventoryService from "../service/inventory.servic";

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

            const {topListType} = req.query;
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

            } else if (topListType == TopListType.CRYSTAL) {

                const inventoryService = new InventoryService();
                const itemId = 27232;
                let itemAmount = 0;
                let charItemList: CharacterItemDTO[] = [];

                const inventoryEntity = await GDB0101DataSource.manager.find(inventory);
                for (let each of inventoryEntity) {
                    const amountPosition = inventoryService.findItemAmountPositionInInventoryEntity(itemId, each);
                    if (amountPosition != undefined) {
                        charItemList.push({ charName: each.char_name, amount: Number(each[amountPosition]) + 1 });
                    }
                }

                charItemList.sort((n1, n2) => { return n1.amount < n2.amount ? 1 : -1 })

            } else if (topListType == TopListType.RUBY) {

            } else if (topListType == TopListType.DIAMOND) {

            } else if (topListType == TopListType.RC) {

            } else {
                // DO NOTHING
            }

            return res.status(200).json({ status: 200, data: response });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

}
