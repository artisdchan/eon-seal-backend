import { Request, Response } from "express";
import { GDB0101DataSource, ItemDataSource, LogItemDataSource, SealMemberDataSource } from "../data-source";
import { AuthenUser } from "../dto/authen.dto";
import { PackageDetailResponse, PackagePurchaseHistoryResponseDTO, PackageResponse } from "../dto/package.dto";
import { getOffSet, getPageination, PaginationAndDataResponse } from "../dto/pagination.dto";
import { ItemLevel } from "../entity/item/fusion_item.entity";
import { Package, PackageStatus } from "../entity/item/package.entity";
import { PackageDetail, PackageItemBag } from "../entity/item/package_detail.entity";
import { PackageHistoryStatus, PurchasePackageHistory } from "../entity/item/purchase_package_history.entity";
import { WebUserDetail } from "../entity/seal_member/web_user_detail.entity";
import ItemService from "../service/item.service";
import LogService from "../service/log.service";

export class PackageController {

    public getPackageList = async (req: Request, res: Response) => {
        try {

            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }
            if (!ItemDataSource.isInitialized) {
                await ItemDataSource.initialize();
            }
            if (!LogItemDataSource.isInitialized) {
                await LogItemDataSource.initialize();
            }

            const { packageType, page, perPage, packageName } = req.query;
            const currentUser = req.user as AuthenUser;

            const query = await ItemDataSource.manager.getRepository(Package).createQueryBuilder('package').where('package.status = :status', { status: 'ACTIVE' });
            if (packageType) {
                query.andWhere('package.item_type = :itemType', { packageType });
            }

            if (packageName) {
                query.andWhere('package.item_name LIKE :itemName', { itemName: `%${packageName}%` });
            }

            const offSet = getOffSet(Number(page), Number(perPage));
            const [packageEntity, count] = await query.limit(Number(perPage)).offset(offSet).getManyAndCount();
            let response: PackageResponse[] = []

            for (let eachPackage of packageEntity) {
                let isPurchaseable = true

                // Global purchase limit
                if (eachPackage.purchaseLimit != 0 && eachPackage.purchaseLimit <= eachPackage.purchaseCount) {
                    isPurchaseable = false;
                }

                // Account purchase limit
                const historyCount = await ItemDataSource.manager.countBy(PurchasePackageHistory, { packageId: eachPackage.packageId, purchasedByUserId: currentUser.gameUserId })
                if (eachPackage.purchaseCountCond != 0) {
                    if (eachPackage.purchaseCountCond <= historyCount) {
                        isPurchaseable = false;
                    }
                }

                const packageDetails = await ItemDataSource.manager.findBy(PackageDetail, { packageId: eachPackage.packageId })

                let responsePacakgeDetail: PackageDetailResponse[] = []
                for (let eachDetail of packageDetails) {
                    responsePacakgeDetail.push({
                        itemId: eachDetail.itemId,
                        itemDescription: eachDetail.itemDescription,
                        itemAmount: eachDetail.itemAmount,
                        itemUrl: eachDetail.itemPictureUrl
                    })
                }

                response.push({
                    packageId: eachPackage.packageId,
                    packageType: eachPackage.packageType,
                    packageName: eachPackage.packageName,
                    packageDescription: eachPackage.packageDescription,
                    packagePictureUrl: eachPackage.packagePictureUrl,
                    isPurchaseable: isPurchaseable,
                    accountPurchaseLimit: eachPackage.purchaseCountCond,
                    accountPurchaseCount: historyCount,
                    packageDetails: responsePacakgeDetail,
                    priceTopupCredit: eachPackage.priceTopupCredit
                })
            }

            const resp: PaginationAndDataResponse = {
                status: 200,
                data: response,
                metadata: getPageination(Number(perPage), count, Number(page))
            }

            return res.status(200).json(resp);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public purchasePackage = async (req: Request, res: Response) => {
        try {

            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }
            if (!GDB0101DataSource.isInitialized) {
                await GDB0101DataSource.initialize();
            }
            if (!ItemDataSource.isInitialized) {
                await ItemDataSource.initialize();
            }
            if (!LogItemDataSource.isInitialized) {
                await LogItemDataSource.initialize();
            }

            const { packageId } = req.params;
            const currentUser = req.user as AuthenUser;

            const webUserDetailEntity = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: currentUser.gameUserId })
            if (webUserDetailEntity == null) {
                return res.status(400).json({ status: 400, message: 'user not found.' })
            }

            const packageEntity = await ItemDataSource.manager.findOneBy(Package, { packageId: Number(packageId), status: PackageStatus.ACTIVE })
            if (packageEntity == null) {
                return res.status(400).json({ status: 400, message: 'invalid package.' })
            }

            if (webUserDetailEntity.topupCredit < packageEntity.priceTopupCredit) {
                return res.status(400).json({ status: 400, message: 'Insufficient credit.' })
            }

            // Global purchase limit
            if (packageEntity.purchaseLimit != 0 && packageEntity.purchaseLimit <= packageEntity.purchaseCount) {
                return res.status(400).json({ status: 400, message: 'Global purchase count has reached limit.' })
            }

            // Account purchase limit
            const historyCount = await ItemDataSource.manager.countBy(PurchasePackageHistory, { packageId: packageEntity.packageId, purchasedByUserId: currentUser.gameUserId })
            if (packageEntity.purchaseCountCond != 0) {
                if (packageEntity.purchaseCountCond <= historyCount) {
                    return res.status(400).json({ status: 400, message: 'Account purchase count has reached limit.' })
                }
            }

            let historyEntity = await ItemDataSource.manager.create(PurchasePackageHistory, {
                packageId: packageEntity.packageId,
                purchasedByUserId: currentUser.gameUserId,
                purchasedByEmail: currentUser.email,
                status: PackageHistoryStatus.NEW,
                purchasedTime: new Date
            })

            try {
                const itemService = new ItemService();
                const logService = new LogService();
                const packageDetails = await ItemDataSource.manager.findBy(PackageDetail, { packageId: packageEntity.packageId })

                for (let eachItem of packageDetails) {
                    let log = await logService.insertLogItemTransaction(`TOPUP_CREDIT_SHOP`, "ADD_ITEM", "PREPARE_PROCESS", currentUser.gameUserId, undefined);
    
                    let errMsg = "";
                    // add item into store
                    if (eachItem.itemBag == PackageItemBag.IN_GAME_ITEM_INVENTORY) {
                        errMsg = await itemService.insertBackInventory(currentUser.gameUserId, eachItem.itemId, eachItem.itemAmount, eachItem.itemEffect, eachItem.itemRefineOrLimit);
                        if (errMsg != "") {
                            log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_IN_GAME_INVENTORY", errMsg + `, ItemId: ${eachItem.itemId}`, log);
                        }
                    } else if (eachItem.itemBag == PackageItemBag.ACCOUNT_CASH_INVENTORY) {
                        errMsg = await itemService.insertAccountCashInventory(currentUser.gameUserId, eachItem.itemId, eachItem.itemAmount, eachItem.itemEffect, eachItem.itemRefineOrLimit);
                        if (errMsg != "") {
                            log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_CASH_INVENTORY", errMsg + `, ItemId: ${eachItem.itemId}`, log);
                        }
                    } else if (eachItem.itemBag == PackageItemBag.CHARACTER_CASH_INVENTORY) {
                        // errMsg = await this.insertCharacterCashInventory(currentUser.gameUserId, request.characterName, crystalShop.itemId, crystalShop.itemAmount);
                        // if (errMsg != "") {
                        //     log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg, log);
                        //     return res.status(400).json({ status: 400, message: errMsg });
                        // }
                    } else if (eachItem.itemBag == PackageItemBag.RANDOM_COSTUME_COMMON) {
                        const randomItem = await itemService.randomCostume(ItemLevel.COMMON);
                        errMsg = await itemService.insertAccountCashInventory(currentUser.gameUserId, randomItem.itemId, 1, 0, 0);
                        if (errMsg != "") {
                            log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg + `, ItemId: ${eachItem.itemId}`, log);
                        }
                    } else if (eachItem.itemBag == PackageItemBag.RANDOM_COSTUME_UNCOMMON) {
                        const randomItem = await itemService.randomCostume(ItemLevel.UNCOMMON);
                        errMsg = await itemService.insertAccountCashInventory(currentUser.gameUserId, randomItem.itemId, 1, 0, 0);
                        if (errMsg != "") {
                            log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg + `, ItemId: ${eachItem.itemId}`, log);
                        }
                    } else if (eachItem.itemBag == PackageItemBag.RANDOM_COSTUME_RARE) {
                        const randomItem = await itemService.randomCostume(ItemLevel.RARE);
                        errMsg = await itemService.insertAccountCashInventory(currentUser.gameUserId, randomItem.itemId, 1, 0, 0);
                        if (errMsg != "") {
                            log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg + `, ItemId: ${eachItem.itemId}`, log);
                        }
                    } else if (eachItem.itemBag == PackageItemBag.RANDOM_COSTUME_EPIC) {
                        const randomItem = await itemService.randomCostume(ItemLevel.EPIC);
                        errMsg = await itemService.insertAccountCashInventory(currentUser.gameUserId, randomItem.itemId, 1, 0, 0);
                        if (errMsg != "") {
                            log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg + `, ItemId: ${eachItem.itemId}`, log);
                        }
                    } else {
                        // DO NOTHING
                    }
                    
                    log = await logService.updateLogItemTransaction("ADD_ITEM_SUCCESS", `ItemId: ${eachItem.itemId}`, log);

                }

                historyEntity.status = PackageHistoryStatus.DONE
                webUserDetailEntity.topupCredit -= packageEntity.priceTopupCredit
                await ItemDataSource.manager.save(historyEntity)
                await SealMemberDataSource.manager.save(webUserDetailEntity)

                return res.status(200).json({ status: 200, data: { puchaseId: historyEntity.purchaseId } })

            } catch (error) {
                console.error(error);
                historyEntity.status = PackageHistoryStatus.FAIL
                // historyEntity.message = 'internal server error'
                await ItemDataSource.manager.save(historyEntity)
                return res.status(500).json({ status: 500, message: 'internal server error' });
            }


        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public getPurchaseHistory = async (req: Request, res: Response) => {
        try {
            
            const currentUser = req.user as AuthenUser; 
            let response: PackagePurchaseHistoryResponseDTO[] = []

            const historyList = await ItemDataSource.getRepository(PurchasePackageHistory).createQueryBuilder()
                .select()
                .where('purchased_by_user_id = :userId', { userId: currentUser.gameUserId })
                .orderBy('purchased_time', 'DESC').getMany();
            
            for (let eachHistory of historyList) {
                const packageEntity = await ItemDataSource.manager.findOneBy(Package, { packageId: eachHistory.packageId })
                response.push({
                    packageName: packageEntity!.packageName,
                    priceTopupCredit: packageEntity!.priceTopupCredit,
                    status: eachHistory.status,
                    purchaseTime: eachHistory.purchasedTime
                })
            }

            return res.status(200).json({ status: 200, data: response })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

}