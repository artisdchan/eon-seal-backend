import { LogItemDataSource } from "../data-source";
import { log_item_transaction } from "../entity/log.entity";

export default class LogService {

    public insertLogItemTransaction = async (logType: string, logAction: string, status: string, message: string | null, actionBy: string) => {

        if (!LogItemDataSource.isInitialized) {
            await LogItemDataSource.initialize();
        }

        let log = await LogItemDataSource.manager.save({
            logType: logType,
            logAction: logAction,
            status: status,
            message: message,
            actionByUserId: actionBy
        }) as log_item_transaction;
        return log;

    }

    public updateLogItemTransaction = async (status: string, message: string | undefined, log: log_item_transaction) => {

        if (!LogItemDataSource.isInitialized) {
            await LogItemDataSource.initialize();
        }

        log.status = status;
        log.message = message;
        log = await LogItemDataSource.manager.save(log)
        return log;

    }
}