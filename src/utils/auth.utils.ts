import { Request, Response, NextFunction } from 'express'

export const checkLimitUserLevel = (userLevel: number) => (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;
    if (!user) {
        return res.sendStatus(403);
        // next(false);
    }

    if (userLevel > user?.userLevel) {
        return res.sendStatus(403);
        // next(false);
    }
    next();
}
