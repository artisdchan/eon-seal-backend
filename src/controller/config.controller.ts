import { Request, Response } from "express";
import { SealMemberDataSource } from "../data-source";
import { WebConfig } from "../entity/seal_member/web_config.entity";

export default class ConfigController {

    public getConfigByKey = async (req: Request, res: Response) => {

        const { key } = req.query;
        const config = await SealMemberDataSource.manager.findOneBy(WebConfig, { configKey: String(key) });
        if (!config) {
            return res.status(404).json({ status: 404, message: 'Config not found.' })
        }

        return res.status(200).json({ status: 200, data: config?.configValue })
    }

}