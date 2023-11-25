import { LogItemDataSource } from "../data-source";
import { log_item_transaction } from "../entity/log_item/log.entity";

export default class LogService {

    public insertLogItemTransaction = async (logType: string, logAction: string, status: string, actionBy: string, message: string | undefined) => {
        try {

            if (!LogItemDataSource.isInitialized) {
                await LogItemDataSource.initialize();
            }
    
            let log = await LogItemDataSource.manager.create(log_item_transaction, {
                logType: logType,
                logAction: logAction,
                status: status,
                message: message,
                actionByUserId: actionBy,
                createTime: new Date(),
                updateTime: new Date()
            }) as unknown as log_item_transaction;

            return log;

        } catch (error) {
            console.error(error);
            throw new Error("Fail to insert log.");
        }
    }

    public updateLogItemTransaction = async (status: string, message: string | undefined, log: log_item_transaction) => {
        try {
            if (!LogItemDataSource.isInitialized) {
                await LogItemDataSource.initialize();
            }
    
            log.status = status;
            log.message = message;
            log = await LogItemDataSource.manager.save(log)
            return log;
        } catch (error) {
            console.error(error);
            throw new Error('Fail to update log.');
        }
    }
}