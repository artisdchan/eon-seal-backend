import { Request, Response } from "express";
import { ItemDataSource, SealMemberDataSource } from "../data-source";
import { AuthenUser } from "../dto/authen.dto";
import { ReactorDetailResponse, ReactorListResponse, UpReactorRequest } from "../dto/reactor.dto";
import { ItemLevel } from "../entity/item/fusion_item.entity";
import { Reactor } from "../entity/item/reactor.entity";
import { ReactorDetail } from "../entity/item/reactor_detail.entity";
import { ReactorHistory } from "../entity/item/reactor_history.entity";
import { usermsgex } from "../entity/seal_member/usermsgex.entity";
import { WebUserDetail } from "../entity/seal_member/web_user_detail.entity";
import EonHubService from "../service/eonhub.service";
import ItemService from "../service/item.service";

export default class ReactorController {

    public getCurrentReactorState = async (req: Request, res: Response) => {
        try {

            const currentUser = req.user as AuthenUser

            let webUser = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: currentUser.gameUserId })
            if (webUser == null) {
                return res.status(400).json({ status: 400, message: 'Invalid user.' })
            }

            return res.status(200).json({ status: 200, data: webUser.reactorLevel })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public upReactorLevel = async (req: Request, res: Response) => {
        try {

            const currentUser = req.user as AuthenUser
            const request = req.body as UpReactorRequest

            let webUser = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: currentUser.gameUserId })
            if (webUser == null) {
                return res.status(400).json({ status: 400, message: 'Invalid user.' })
            }
            const currentReactorLevel = webUser.reactorLevel

            const reactor = await ItemDataSource.manager.findOneBy(Reactor, { reactorLevel: currentReactorLevel })
            if (reactor == null) {
                return res.status(400).json({ status: 400, message: 'Invalid reactor level.' })
            }

            if (currentReactorLevel == 1) {
                if (request.priceType = 'CP') {

                    if (webUser.crystalPoint < reactor.priceCp) {
                        return res.status(400).json({ status: 400, message: 'Insufficient CP.' })
                    }
                    webUser.crystalPoint -= reactor.priceCp
                    webUser = await SealMemberDataSource.manager.getRepository(WebUserDetail).save(webUser)

                } else if (request.priceType = 'EON') {

                    const eonHubService = new EonHubService()
                    const eonHubResponse = await eonHubService.minusEonPoint(currentUser.email, reactor.priceEon)
                    if (eonHubResponse.status != 200) {
                        return res.status(eonHubResponse.status).json(eonHubResponse)
                    }

                }
            }

            const randomChance = Number(Math.random() * 100)
            if (randomChance < reactor.successRate) {
                // success
                webUser.reactorLevel += 1
                webUser.useReactorCount += 1
                await SealMemberDataSource.manager.getRepository(WebUserDetail).save(webUser)

                await ItemDataSource.manager.save(ReactorHistory, {
                    reactorLevel: currentReactorLevel,
                    action: `Successfully upgrade reactor from lv. ${currentReactorLevel}, to lv.${currentReactorLevel + 1}`,
                    actionByGameUserId: currentUser.gameUserId
                })

                return res.status(200).json({ status: 200, data: null })
            } else {
                // fail
                webUser.reactorLevel = 1
                webUser.useReactorCount += 1
                await SealMemberDataSource.manager.getRepository(WebUserDetail).save(webUser)

                await ItemDataSource.manager.save(ReactorHistory, {
                    reactorLevel: currentReactorLevel,
                    action: `Fail to upgrade reactor at lv.${currentReactorLevel}`,
                    actionByGameUserId: currentUser.gameUserId
                })

                return res.status(400).json({ status: 400, message: 'FAIL!' })
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public claimItem = async (req: Request, res: Response) => {
        try {

            const currentUser = req.user as AuthenUser

            let webUser = await SealMemberDataSource.manager.findOneBy(WebUserDetail, { user_id: currentUser.gameUserId })
            if (webUser == null) {
                return res.status(400).json({ status: 400, message: 'Invalid user.' })
            }
            const currentReactorLevel = webUser.reactorLevel

            const reactor = await ItemDataSource.manager.findOneBy(Reactor, { reactorLevel: currentReactorLevel })
            if (reactor == null) {
                return res.status(400).json({ status: 400, message: 'Invalid reactor level.' })
            }

            const reactorDetail = await ItemDataSource.manager.findBy(ReactorDetail, { reactorId: reactor.id })
            if (reactorDetail == null) {
                return res.status(400).json({ status: 400, message: 'Invalid reactor level' })
            }

            const itemLevelChance = Number(Math.random() * 100)
            let itemLevel = 1
            if (itemLevelChance >= 0 && itemLevelChance < 50) {
                itemLevel = 1
            } else if (itemLevelChance >= 50 && itemLevelChance < 75) {
                itemLevel = 2
            } else if (itemLevelChance > 75 && itemLevelChance < 95) {
                itemLevel = 3
            } else if (itemLevelChance >= 95 && itemLevelChance < 100) {
                itemLevel = 4
            }

            const itemChance = Number(Math.random() * 100)
            for (let eachItem of reactorDetail) {
                if (itemLevel == eachItem.itemLevel && eachItem.itemChance >= itemChance && eachItem.itemChance < itemChance) {
                    // TODO add item into game account
                    let errMsg = ''
                    const itemService = new ItemService()
                    if (eachItem.itemBag == 'IN_GAME_ITEM_INVENTORY') {
                        for (let i = 0; i < eachItem.itemAmount; i++) {
                            errMsg = await itemService.insertBackInventory(currentUser.gameUserId, eachItem.itemId, 1, eachItem.itemOption, eachItem.itemLimit);
                        }
                    } else if (eachItem.itemBag == 'ACCOUNT_CASH_INVENTORY') {
                        for (let i = 0; i < eachItem.itemAmount; i++) {
                            errMsg = await itemService.insertAccountCashInventory(currentUser.gameUserId, eachItem.itemId, eachItem.itemAmount, eachItem.itemOption, eachItem.itemLimit);
                        }
                    } else if (eachItem.itemBag == 'CHARACTER_CASH_INVENTORY') {
                        // errMsg = await this.insertCharacterCashInventory(currentUser.gameUserId, request.characterName, crystalShop.itemId, crystalShop.itemAmount);
                        // if (errMsg != "") {
                        //     log = await logService.updateLogItemTransaction("FAIL_TO_UPDATE_INVENTORY", errMsg, log);
                        //     return res.status(400).json({ status: 400, message: errMsg });
                        // }
                    } else if (eachItem.itemBag == 'RANDOM_COSTUME_COMMON') {
                        const randomItem = await itemService.randomCostume(ItemLevel.COMMON);
                        errMsg = await itemService.insertAccountCashInventory(currentUser.gameUserId, randomItem.itemId, 1, 0, 0);
                    } else if (eachItem.itemBag == 'RANDOM_COSTUME_UNCOMMON') {
                        const randomItem = await itemService.randomCostume(ItemLevel.UNCOMMON);
                        errMsg = await itemService.insertAccountCashInventory(currentUser.gameUserId, randomItem.itemId, 1, 0, 0);
                    } else if (eachItem.itemBag == 'RANDOM_COSTUME_RARE') {
                        const randomItem = await itemService.randomCostume(ItemLevel.RARE);
                        errMsg = await itemService.insertAccountCashInventory(currentUser.gameUserId, randomItem.itemId, 1, 0, 0);
                    } else if (eachItem.itemBag == 'RANDOM_COSTUME_EPIC') {
                        const randomItem = await itemService.randomCostume(ItemLevel.EPIC);
                        errMsg = await itemService.insertAccountCashInventory(currentUser.gameUserId, randomItem.itemId, 1, 0, 0);
                    } else if (eachItem.itemBag == 'STACK_IN_GAME_ITEM') {
                        errMsg = await itemService.insertStackItem(currentUser.gameUserId, eachItem.itemId, eachItem.itemAmount, eachItem.itemOption, eachItem.itemLimit);
                    } else if (eachItem.itemBag == 'EON_POINT') {
                        const eonHubService = new EonHubService()
                        const eonHubResponse = await eonHubService.minusEonPoint(currentUser.email, reactor.priceEon)
                        if (eonHubResponse.status != 200) {
                            return res.status(eonHubResponse.status).json(eonHubResponse)
                        }
                    } else {
                        // DO NOTHING
                    }
                    await ItemDataSource.manager.save(ReactorHistory, {
                        reactorLevel: currentReactorLevel,
                        action: `Claim item from reactor lv.${currentReactorLevel}, ItemId: ${eachItem.itemId}, ItemBag: ${eachItem.itemBag}, Message:${errMsg}`,
                        actionByGameUserId: currentUser.gameUserId
                    })
                }
            }

            webUser.reactorLevel = 1
            await SealMemberDataSource.manager.getRepository(WebUserDetail).save(webUser)

            return res.status(200).json({ status: 200, data: null })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

    public getReactor = async (req: Request, res: Response) => {
        try {

            const currentUser = req.user as AuthenUser

            const reactor = await ItemDataSource.manager.find(Reactor)
            if (reactor == null) {
                return res.status(400).json({ status: 400, message: 'Reactor not found.' })
            }

            let reactorResponseList: ReactorListResponse[] = []
            for (let eachReactor of reactor) {
                let reactorDetailResponseList: ReactorDetailResponse[] = []
                const reactorDetail = await ItemDataSource.manager.findBy(ReactorDetail, { reactorId: eachReactor.id })

                for (let eachDetail of reactorDetail) {
                    reactorDetailResponseList.push({
                        itemName: eachDetail.itemName,
                        itemBag: eachDetail.itemBag,
                        itemPictureUrl: eachDetail.itemPictureUrl
                    })
                }

                reactorResponseList.push({
                    reactorName: eachReactor.reactorName,
                    reactorLevel: eachReactor.reactorLevel,
                    priceEon: eachReactor.priceEon,
                    priceCp: eachReactor.priceCp,
                    reactorDetails: reactorDetailResponseList
                })
            }

            return res.status(200).json({ status: 200, data: reactorResponseList })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

}