import { Request, Response } from "express";
import { GDB0101DataSource } from "../data-source";
import { RankingResponseDTO } from "../dto/ranking.dto";
import { pc } from "../entity/gdb0101/pc.entity";

export default class RankingController {

    public ranking = async (req: Request, res: Response) => {

        if (!GDB0101DataSource.isInitialized) {
            await GDB0101DataSource.initialize();
        }
        
        const {classId} = req.query;

        const pcEntityList = await GDB0101DataSource.manager.getRepository(pc).createQueryBuilder('pc')
        .select('pc.char_name', 'char_name').addSelect('pc.level', 'level').addSelect('pc.fame', 'fame').addSelect('pc.job', 'job').addSelect('pc.money', 'money')
        .where('pc.job = :classId', { classId: classId}).orderBy('level', 'DESC').limit(10).getRawMany() as unknown as RankingResponseDTO[];

        res.status(200).json({status: 200, data: pcEntityList});
    }

}