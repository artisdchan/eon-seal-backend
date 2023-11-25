import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class log_item_transaction {

    @PrimaryGeneratedColumn('increment')
    log_id!: number;

    @Column({ name: 'log_type' })
    logType!: string;

    @Column({ name: 'log_action' })
    logAction!: string;

    @Column({ name: 'status' })
    status!: string;

    @Column({ name: 'message' })
    message?: string;

    @CreateDateColumn({ name: 'create_time' })
    createTime!: Date;

    @UpdateDateColumn({ name: 'update_time' })
    updateTime!: Date;

    @Column({ name: 'action_by_user_id' })
    actionByUserId!: string;

}