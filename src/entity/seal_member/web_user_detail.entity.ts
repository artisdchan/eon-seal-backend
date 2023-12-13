import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'web_user_detail' })
export class WebUserDetail {

    @PrimaryColumn()
    user_id!: string;

    @Column({ name: 'shard_common_point' })
    shardCommonPoint!: number;

    @Column({ name: 'shard_uncommon_point' })
    shardUnCommonPoint!: number;

    @Column({ name: 'shard_rare_point' })
    shardRarePoint!: number;

    @Column({ name: 'shard_epic_point' })
    shardEpicPoint!: number;

    @Column({ name: 'shard_legendary_point' })
    shardLegenPoint!: number;

    @Column({ name: 'crystal_point' })
    crystalPoint!: number;

    @Column({ name: 'cash_spend_point' })
    cashSpendPoint!: number;

    @Column({ name: 'user_level' })
    userLevel!: number;

    @Column({ name: 'topup_credit' })
    topupCredit!: number

}
