import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'reactor_history' })
export class ReactorHistory {

    @PrimaryGeneratedColumn('increment')
    id!: number

    @Column({ name: 'reactor_level' })
    reactorLevel!: number

    @Column({ name: 'action' })
    action!: string

    @Column({ name: 'action_by_game_user_id' })
    actionByGameUserId!: string

    @CreateDateColumn({ name: 'action_time' })
    actionTime!: Date

}