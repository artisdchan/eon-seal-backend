import { Request, Response } from "express";
import { GDB0101DataSource, ItemDataSource, LogItemDataSource, SealMemberDataSource } from "../data-source";
import { AuthenUser } from "../dto/authen.dto";
import { ResponseItemDTO, FusionItemRequestDTO, OwnedFusionItemResponseDTO, CharacterBagItem, AccountBagItem, ReRollRequestDTO } from "../dto/fusion.dto";
import { CashInventory } from "../entity/gdb0101/cash_inventory.entity";
import { FusionItemConfig, ItemLevel, ItemType } from "../entity/item/fusion_item.entity";
import { pc } from "../entity/gdb0101/pc.entity";
import { SealItem } from "../entity/item/seal_item.entity";
import { usermsgex } from "../entity/seal_member/usermsgex.entity";
import CashInventoryService from "../service/cash_inventory.service";
import LogService from "../service/log.service";
import { WebUserDetail } from "../entity/seal_member/web_user_detail.entity";
import { WebConfig, WebConfigConstant } from "../entity/seal_member/web_config.entity";

export default class FusionController {

    public getItemFusionList = async (req: Request, res: Response) => {
        try {

            const currentUser = req.user as AuthenUser;
            const cashInventoryService = new CashInventoryService();
            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            if (!ItemDataSource.isInitialized) {
                await ItemDataSource.initialize();
            }

            const userEntity = await SealMemberDataSource.manager.findOneBy(usermsgex, { userId: currentUser.gameUserId });
            if (userEntity == null) {
                return res.status(400).json({ status: 400, message: 'User ID is not exist.' })
            }

            // Find Character name
            const pcEntityList = await GDB0101DataSource.manager.findBy(pc, { user_id: currentUser.gameUserId });
            if (pcEntityList == null) {
                return res.status(400).json({ status: 400, message: 'Character is not found.' });
            }

            const characterName: string[] = [];
            pcEntityList.map((each) => characterName.push(each.char_name));

            // Find cash item in cash_inventory by character names
            const cashInventoryEntity = await GDB0101DataSource.manager.createQueryBuilder()
                .select("cashInventory")
                .from(CashInventory, "cashInventory")
                .where("cashInventory.char_name IN (:...charNames)", { charNames: characterName })
                .getMany();

            const sealItemEntity = await ItemDataSource.manager.findBy(SealItem, { userId: currentUser.gameUserId });
            if (cashInventoryEntity == null && sealItemEntity == null) {
                return res.status(400).json({ status: 400, message: 'Inventory is not exist.' })
            }

            const fusionItemConfigEntityList = await ItemDataSource.manager.findBy(FusionItemConfig, { itemType: ItemType.COSTUME });
            if (fusionItemConfigEntityList == null) {
                return res.status(400).json({ status: 400, message: 'Configurations are not found.' });
            }

            const characterBagResponse: CharacterBagItem[] = [];
            const accountBagResponse: AccountBagItem[] = [];

            for (let eachCharacter of cashInventoryEntity) {
                for (let eachConfig of fusionItemConfigEntityList) {
                    if (cashInventoryService.findItemInCashInventoryntity(eachConfig.itemId, eachCharacter) != undefined) {
                        characterBagResponse.push({
                            itemId: eachConfig.itemId,
                            itemLevel: eachConfig.itemLevel,
                            itemName: eachConfig.itemName,
                            itemType: eachConfig.itemType,
                            itemPicture: eachConfig.itemPicture
                        })
                    }
                }
            }

            for (let eachItem of sealItemEntity) {
                for (let eachConfig of fusionItemConfigEntityList) {
                    if (eachItem.itemId == eachConfig.itemId) {
                        accountBagResponse.push({
                            itemId: eachConfig.itemId,
                            itemLevel: eachConfig.itemLevel,
                            itemName: eachConfig.itemName,
                            itemType: eachConfig.itemType,
                            itemPicture: eachConfig.itemPicture
                        })
                    }
                }
            }

            const response: OwnedFusionItemResponseDTO = {
                characterBag: characterBagResponse,
                accountBag: accountBagResponse
            };

            return res.status(200).json({ status: 200, data: response });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }

    }

    public fusionCostume = async (req: Request, res: Response) => {
        try {

            const currentUser = req.user as AuthenUser;
            const request = req.body as FusionItemRequestDTO;
            const cashInventoryService = new CashInventoryService();
            const logService = new LogService();

            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            if (!ItemDataSource.isInitialized) {
                await ItemDataSource.initialize();
            }
            if (!LogItemDataSource.isInitialized) {
                await LogItemDataSource.initialize();
            }

            if (request.itemLevel == ItemLevel.LEGENDARY) {
                return res.status(400).json({ status: 400, message: 'Cannot fusion LEGENDARY costume.' });
            }

            // Find Character name
            const pcEntityList = await GDB0101DataSource.manager.findBy(pc, { user_id: currentUser.gameUserId });
            if (pcEntityList == null) {
                return res.status(400).json({ status: 400, message: 'Character is not found.' });
            }

            const characterName: string[] = [];
            pcEntityList.map((each) => characterName.push(each.char_name));

            // Find cash item in cash_inventory by character names
            const cashInventoryEntity = await GDB0101DataSource.manager.createQueryBuilder()
                .select("cashInventory")
                .from(CashInventory, "cashInventory")
                .where("cashInventory.char_name IN (:...charNames)", { charNames: characterName })
                .getMany();

            // Find cash item in seal_item by user_id
            const sealItemEntity = await ItemDataSource.manager.findBy(SealItem, { userId: currentUser.gameUserId });
            if (cashInventoryEntity == null && sealItemEntity == null) {
                return res.status(400).json({ status: 400, message: 'Inventory is not exist.' })
            }

            const fusionItemConfigEntityList = await ItemDataSource.manager.findBy(FusionItemConfig, { itemLevel: request.itemLevel, itemType: request.itemType });
            const fusionItemConfig = fusionItemConfigEntityList.map((each) => each.itemId);

            let matchedCount: number = 0;

            if (!this.isRequestItemValidWithConfig(request.characterSelectedItemId, fusionItemConfig)) {
                return res.status(400).json({ status: 400, message: 'Invalid input items.' })
            }

            matchedCount += request.characterSelectedItemId.length;

            // Check request is valid with config
            if (matchedCount != 4) {
                if (!this.isRequestItemValidWithConfig(request.accountSelectedItemId, fusionItemConfig)) {
                    return res.status(400).json({ status: 400, message: 'Invalid input items.' })
                }
            }

            matchedCount += request.accountSelectedItemId.length;

            if (matchedCount != 4) {
                return res.status(400).json({ status: 400, message: 'Invalid input items.' })
            }

            // Check request exists in character bag
            let foundCount = 0;
            for (let eachRequest of request.characterSelectedItemId) {
                for (let eachCharacter of cashInventoryEntity) { 
                    // each selected item id must exist in bag
                    if (cashInventoryService.findItemInCashInventoryntity(eachRequest, eachCharacter) != undefined) {
                        foundCount ++;
                    }
                }
            }
            

            // Check request exists in account bag
            for (let eachRequest of request.accountSelectedItemId) {
                for (let eachAccountItem of sealItemEntity) {
                    // each selected item id must exist in bag
                    if (eachRequest == eachAccountItem.itemId) {
                        foundCount++;
                    }
                }
            }

            if (foundCount != 4) {
                return res.status(400).json({ status: 400, message: 'Invalid input items.' })
            }

            let tobeAddCostume: FusionItemConfig;
            const currentItemLevel = Number(request.itemLevel);
            let logMessage: string;
            let logAction: string;

            // Remove request item

            // Remove from character bag
            for (let eachRequest of request.characterSelectedItemId) {
                for (let eachCharacter of cashInventoryEntity) {
                    const toBeRemoveItemPosition = cashInventoryService.findItemInCashInventoryntity(eachRequest, eachCharacter);
                    const toBeRemoveAmountPosition = cashInventoryService.findItemAmountPositionInCashInventoryEntity(eachRequest, eachCharacter);

                    const itemobj = (cashInventoryService.setValueIntoCashInventoryEntity(toBeRemoveItemPosition!, 0));
                    const amountObj = (cashInventoryService.setValueIntoCashInventoryEntity(toBeRemoveAmountPosition!, 0));

                    await GDB0101DataSource.manager.getRepository(CashInventory).save({
                        ...eachCharacter,
                        ...itemobj,
                        ...amountObj
                    })
                }
            }

            // Remove from account bag
            for (let eachRequest of request.accountSelectedItemId) {
                const toBeDeleteObj = await ItemDataSource.manager.findOneBy(SealItem, { userId: currentUser.gameUserId, itemId: eachRequest });
                await ItemDataSource.manager.remove(toBeDeleteObj);
            }

            // success chance is 5%
            if (this.isFusionSuccess(5)) {
                tobeAddCostume = await this.randomCostume(Number(ItemLevel[currentItemLevel + 1]))
                logMessage = `Fusion item success`
                logAction = 'FUSION_SUCCESS'
            } else {
                tobeAddCostume = await this.randomCostume(currentItemLevel);
                const webUserDetailEntity = await SealMemberDataSource.manager.findOneBy(WebUserDetail, {
                    user_id: currentUser.gameUserId
                });
                if (webUserDetailEntity == null) {
                    return res.status(400).json({ status: 400, message: 'User is not found.' })
                }
                if (request.itemLevel === ItemLevel.COMMON) {
                    webUserDetailEntity.shardUnCommonPoint++;
                } else if (request.itemLevel === ItemLevel.UNCOMMON) {
                    webUserDetailEntity.shardRarePoint++;
                } else if (request.itemLevel === ItemLevel.RARE) {
                    webUserDetailEntity.shardEpicPoint++;
                } else if (request.itemLevel === ItemLevel.EPIC) {
                    webUserDetailEntity.shardLegenPoint++;
                }

                await SealMemberDataSource.manager.save(webUserDetailEntity);

                logMessage = `Fusion item fail`
                logAction = 'FUSION_FAIL'
            }

            // Add new item
            await ItemDataSource.manager.save(SealItem, {
                itemId: tobeAddCostume.itemId,
                ItemOp1: 1,
                ItemOp2: 0,
                ItemLimit: 0,
                userId: currentUser.gameUserId,
                OwnerDate: new Date,
                bxaid: 'BUY'
            });

            await logService.insertLogItemTransaction("FUSION_ITEM", logAction, "SUCCESS", currentUser.gameUserId, logMessage);

            const response: ResponseItemDTO = {
                itemId: tobeAddCostume.itemId,
                itemType: tobeAddCostume.itemType,
                itemLevel: tobeAddCostume.itemLevel,
                itemName: tobeAddCostume.itemName,
                itemPicture: tobeAddCostume.itemPicture
            }

            return res.status(200).json({ status: 200, data: response });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }

    }

    private isRequestItemValidWithConfig = (selectedItemIdList: number[], configItemIdList: number[]): boolean => {

        let matchedCount = 0;
        for (let eachConfig of configItemIdList) {
            for (let eachSelectedItem of selectedItemIdList) {
                if (eachConfig == eachSelectedItem) {
                    matchedCount++;
                }
            }
        }

        if (matchedCount == selectedItemIdList.length) {
            return true;
        }
        return false;
    }

    public exchangeCostume = async (req: Request, res: Response) => {
        try {

            const currentUser = req.user as AuthenUser;
            const { exchangeLevel } = req.query;
            const logService = new LogService();

            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            if (!ItemDataSource.isInitialized) {
                await ItemDataSource.initialize();
            }

            const requestLevel = ItemLevel[exchangeLevel as keyof typeof ItemLevel];

            const condShardAmount = 25;
            const webUserDetailEntity = await SealMemberDataSource.manager.findOneBy(WebUserDetail, {
                user_id: currentUser.gameUserId
            });
            if (webUserDetailEntity == null) {
                return res.status(400).json({ status: 400, message: 'User is not found.' })
            }

            let shardAmount = 0;
            if (requestLevel === ItemLevel.COMMON) {
                shardAmount = webUserDetailEntity.shardCommonPoint;
                webUserDetailEntity.shardCommonPoint -= condShardAmount;
            } else if (requestLevel === ItemLevel.UNCOMMON) {
                shardAmount = webUserDetailEntity.shardUnCommonPoint;
                webUserDetailEntity.shardUnCommonPoint -= condShardAmount;
            } else if (requestLevel === ItemLevel.RARE) {
                shardAmount = webUserDetailEntity.shardRarePoint;
                webUserDetailEntity.shardRarePoint -= condShardAmount;
            } else if (requestLevel === ItemLevel.EPIC) {
                shardAmount = webUserDetailEntity.shardEpicPoint;
                webUserDetailEntity.shardEpicPoint -= condShardAmount;
            } else if (requestLevel === ItemLevel.LEGENDARY) {
                shardAmount = webUserDetailEntity.shardLegenPoint;
                webUserDetailEntity.shardLegenPoint -= condShardAmount;
            }

            if (condShardAmount > shardAmount) {
                return res.status(400).json({ status: 400, message: 'Insufficient item.' })
            }

            await SealMemberDataSource.manager.save(webUserDetailEntity);

            // Random 1 from 6 costume from shard level 
            const tobeAddCostume = await this.randomCostume(requestLevel);
            await ItemDataSource.manager.save(SealItem, {
                itemId: tobeAddCostume.itemId,
                ItemOp1: 1,
                ItemOp2: 0,
                ItemLimit: 0,
                userId: currentUser.gameUserId,
                OwnerDate: new Date,
                bxaid: 'BUY'
            });

            await logService.insertLogItemTransaction("FUSION_ITEM", "EXCHANGE_COSTUME", "SUCCESS", currentUser.gameUserId, `Successfully exchange shard to costume. (ItemLevel: ${requestLevel})`);

            const response: ResponseItemDTO = {
                itemId: tobeAddCostume.itemId,
                itemType: tobeAddCostume.itemType,
                itemLevel: tobeAddCostume.itemLevel,
                itemName: tobeAddCostume.itemName,
                itemPicture: tobeAddCostume.itemPicture
            }

            return res.status(200).json({ status: 200, data: response });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public reRoll = async (req: Request, res: Response) => {
        try {

            const currentUser = req.user as AuthenUser;
            const request = req.body as ReRollRequestDTO;
            const logService = new LogService();
            const cashInventoryService = new CashInventoryService();

            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }
            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            if (!ItemDataSource.isInitialized) {
                await ItemDataSource.initialize();
            }
            if (!LogItemDataSource.isInitialized) {
                await LogItemDataSource.initialize();
            }

            if (request.accountSelectedItemId == undefined && request.characterSelectedItemId == undefined) {
                return res.status(400).json({ status: 400, message: 'Invalid request.' });
            }

            if (request.itemLevel <= ItemLevel.RARE) {
                return res.status(400).json({ status: 400, message: 'Selected item must be rank EPIC or above.' })
            }

            // Find Character name
            const pcEntityList = await GDB0101DataSource.manager.findOneBy(pc, { user_id: currentUser.gameUserId, char_name: request.characterName });
            if (pcEntityList == null) {
                return res.status(400).json({ status: 400, message: 'Character is not found.' });
            }

            let cegelTax = 3000;
            if (request.itemLevel == ItemLevel.LEGENDARY) {
                cegelTax = 30000;
            }

            if (pcEntityList.money < cegelTax) {
                return res.status(400).json({ status: 400, message: 'Insufficient cegel.' });
            }

            pcEntityList.money -= cegelTax;

            await GDB0101DataSource.manager.save(pcEntityList);

            if (request.accountSelectedItemId != undefined) {

                await ItemDataSource.manager.remove(await ItemDataSource.manager.findOneBy(SealItem, { itemId: request.accountSelectedItemId, userId: currentUser.gameUserId }));

                const tobeAddCostume = await this.randomCostume(request.itemLevel);
                await ItemDataSource.manager.save(SealItem, {
                    itemId: tobeAddCostume.itemId,
                    ItemOp1: 1,
                    ItemOp2: 0,
                    ItemLimit: 0,
                    userId: currentUser.gameUserId,
                    OwnerDate: new Date,
                    bxaid: 'BUY'
                });

                const response: ResponseItemDTO = {
                    itemId: tobeAddCostume.itemId,
                    itemType: tobeAddCostume.itemType,
                    itemLevel: tobeAddCostume.itemLevel,
                    itemName: tobeAddCostume.itemName,
                    itemPicture: tobeAddCostume.itemPicture
                }
                await logService.insertLogItemTransaction("FUSION_ITEM", "RE_ROLL_ITEM", "SUCCESS", currentUser.gameUserId, 'Re-roll fusion item complete.');

                return res.status(200).json({ status: 200, data: response });

            } else if (request.characterSelectedItemId != undefined) {

                // Find cash item in cash_inventory by character names
                const cashInventoryEntity = await GDB0101DataSource.manager.createQueryBuilder()
                    .select("cashInventory")
                    .from(CashInventory, "cashInventory")
                    .where("cashInventory.char_name = (:charNames)", { charNames: request.characterName })
                    .getOne();

                if (cashInventoryEntity == null) {
                    return res.status(400).json({ status: 400, message: 'Invalid character.' })
                }

                const toBeRemoveItemPosition = cashInventoryService.findItemInCashInventoryntity(request.characterSelectedItemId, cashInventoryEntity);
                if (toBeRemoveItemPosition == undefined) {
                    return res.status(400).json({ status: 400, message: 'Invalid request.' })
                }

                const toBeRemoveAmountPosition = cashInventoryService.findItemAmountPositionInCashInventoryEntity(request.characterSelectedItemId, cashInventoryEntity);

                const itemobj = (cashInventoryService.setValueIntoCashInventoryEntity(toBeRemoveItemPosition!, 0));
                const amountObj = (cashInventoryService.setValueIntoCashInventoryEntity(toBeRemoveAmountPosition!, 0));

                await GDB0101DataSource.manager.getRepository(CashInventory).save({
                    ...cashInventoryEntity,
                    ...itemobj,
                    ...amountObj
                })
                const tobeAddCostume = await this.randomCostume(request.itemLevel);
                await ItemDataSource.manager.save(SealItem, {
                    itemId: tobeAddCostume.itemId,
                    ItemOp1: 1,
                    ItemOp2: 0,
                    ItemLimit: 0,
                    userId: currentUser.gameUserId,
                    OwnerDate: new Date,
                    bxaid: 'BUY'
                });

                const response: ResponseItemDTO = {
                    itemId: tobeAddCostume.itemId,
                    itemType: tobeAddCostume.itemType,
                    itemLevel: tobeAddCostume.itemLevel,
                    itemName: tobeAddCostume.itemName,
                    itemPicture: tobeAddCostume.itemPicture
                }

                await logService.insertLogItemTransaction("FUSION_ITEM", "RE_ROLL_ITEM", "SUCCESS", currentUser.gameUserId, 'Re-roll fusion item complete.');
                
                return res.status(200).json({ status: 200, data: response });

            } else {
                return res.status(400).json({ status: 400, message: 'Invalid request.' })
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    private randomCostume = async (level: ItemLevel): Promise<FusionItemConfig> => {
        const fusionItemEntityList = await ItemDataSource.manager.findBy(FusionItemConfig, {
            itemType: ItemType.COSTUME,
            itemLevel: level
        });

        const ranNum = Math.floor(Math.random() * (fusionItemEntityList.length - 1 + 1) + 1)

        return fusionItemEntityList[ranNum - 1];
    }

    private isFusionSuccess = (rate: number): boolean => {
        return Number(Math.random() * 100) < rate
    }

}