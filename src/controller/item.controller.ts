import { Request, Response } from "express";
import { SealMemberDataSource } from "../data-source";
import { AddItemRequestDTO } from "../dto/item.dto";
import { ItemLevel } from "../entity/item/fusion_item.entity";
import { usermsgex } from "../entity/seal_member/usermsgex.entity";
import ItemService from "../service/item.service";
import StoreService from "../service/store.service";
import { EONHUB_API_KEY } from "../utils/secret.utils";

export default class ItemController {

    public addItem = async (req: Request, res: Response) => {
        try {

            if (!SealMemberDataSource.isInitialized) {
                await SealMemberDataSource.initialize();
            }

            const requestApiKey = req.get('API-KEY') as string;
            if (requestApiKey != EONHUB_API_KEY) {
                console.error('Invalid API-KEY.');
                return res.sendStatus(401);
            }

            const request = req.body as AddItemRequestDTO;
            const type = req.params.type
            const itemService = new ItemService();

            const userMsgExEntity = await SealMemberDataSource.createQueryBuilder()
                .select('usermsgex')
                .from(usermsgex, 'usermsgex')
                .where('usermsgex.email = :email', { email: request.email })
                .getOne();
            if (userMsgExEntity == null) {
                return res.sendStatus(400)
            }

            let errMsg = ""
            
            if (type == "cash") {
                errMsg = await itemService.insertAccountCashInventory(userMsgExEntity.userId, request.itemId, request.itemAmount, request.itemEffectCode, request.itemRefine)
            } else if (type == "bank") {
                errMsg = await itemService.insertBackInventory(userMsgExEntity.userId, request.itemId, request.itemAmount, request.itemEffectCode, request.itemRefine)
            } else if (type == "stack") {
                errMsg = await itemService.insertStackItem(userMsgExEntity.userId, request.itemId, request.itemAmount, request.itemEffectCode, request.itemRefine)
            } else if (type == 'costume') {
                // For costume type, itemId is level of costume to be randomed.
                let itemLevel: ItemLevel = request.itemId
                const costume = await itemService.randomCostume(itemLevel)
                errMsg = await itemService.insertAccountCashInventory(userMsgExEntity.userId, costume.itemId, 1, 0, 0)
            }

            if (errMsg != "") {
                return res.status(400).send({ status: 400, message: errMsg })
            }

            return res.status(200).send({ status: 200, data: null })

        } catch (error) {
            console.error(error);
            res.status(500).send({ status: 500, message: `internal server error.` });
        }
    }
}