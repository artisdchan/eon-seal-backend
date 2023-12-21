import { Request, Response } from "express";
import { ItemDataSource, SealMemberDataSource } from "../data-source";
import { AuthenUser } from "../dto/authen.dto";
import { UpReactorRequest } from "../dto/reactor.dto";
import { Reactor } from "../entity/item/reactor.entity";
import { ReactorDetail } from "../entity/item/reactor_detail.entity";
import { WebUserDetail } from "../entity/seal_member/web_user_detail.entity";

export default class ReactorController {

    public getCurrentReactorState = async (req: Request, res: Response) => {
        try {

            const currentUser = req.user as AuthenUser
            
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
                    webUser.crystalPoint -= reactor.priceCp
                    webUser = await SealMemberDataSource.manager.getRepository(WebUserDetail).save(webUser)
                } else if (request.priceType = 'EON') {
                    // request to minus EON Point
                }
            }

            const randomChance = Number(Math.random() * 100)
            if (randomChance  < reactor.successRate) {
                // success
                webUser.reactorLevel += 1
                await SealMemberDataSource.manager.getRepository(WebUserDetail).save(webUser)

                return res.status(200).json({ status: 200, data: null})
            } else {
                // fail
                webUser.reactorLevel = 1
                await SealMemberDataSource.manager.getRepository(WebUserDetail).save(webUser)

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
            if (itemLevelChance >= 0 && itemLevelChance < 25) {
                itemLevel = 1
            } else if (itemLevelChance >= 25 && itemLevelChance < 50) {
                itemLevel = 2
            } else if (itemLevelChance > 50 && itemLevelChance < 75) {
                itemLevel = 3
            } else if (itemLevelChance >= 75 && itemLevelChance < 100) {
                itemLevel = 4
            }

            const itemChance = Number(Math.random() * 100)
            for (let eachItem of reactorDetail) {
                if (itemLevel == eachItem.itemLevel && eachItem.itemChance >= itemChance && eachItem.itemChance < itemChance) {
                    // TODO add item into game account
                }
            }

            webUser.reactorLevel = 1
            await SealMemberDataSource.manager.getRepository(WebUserDetail).save(webUser)

            return res.status(200).json({ status: 200, data: null})
            
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 500, message: 'internal server error' });
        }
    }

}