import { Request, Response, NextFunction } from "express"
import { SealMemberDataSource } from "../data-source";
import { RegisterRequestDTO } from "../dto/register.dto";
import { idtable1 } from "../entity/idtable.entity";

export default class RegisterController {

    public register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req.body as RegisterRequestDTO;

            const aaa = {
                id: request.username,
                passwd: () => `OLD_PASSWORD('${request.password}')`,
                email: request.email,
                point: 0,
                userLevel: 0,
                char_name: '',
                gameserver_burnho: 0,
                enter_ip: '',
                record_lock: 0,
                lock_time: 0,
                delete_flag: 0,
                pay_flag: 0,
                update_date: new Date(),
                nick_name: '',
                lovekey: '',
                loveauth: '',
                pass: '',
                reg_date: new Date()
            }
            await SealMemberDataSource.createQueryBuilder().insert().into(idtable1).values(aaa).execute();

            res.status(201);
            return next();

        } catch (error) {
            console.error(error);
            res.send({ status: 500, message: `internal server error.` });
            return next(null)
        }
    }

}