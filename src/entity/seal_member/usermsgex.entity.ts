import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class usermsgex {

    @PrimaryColumn()
    userId!: string

    @Column()
    email?: string

    @Column()
    gold?: number

    @Column()
    nickName!: string

    @Column()
    oneTimeChangePwd!: string

    @Column()
    isGiftsReferrerGold?: string

    @Column()
    Referrer?: string

    @Column()
    honor?: number

    @Column()
    xixi?: string

    @Column()
    giftForReferrerTime?: Date

    @Column()
    question!: string

    @Column()
    answer!: string

    @Column()
    totalGold!: number

    @Column()
    vipLevel!: number

    @Column()
    adminLevel!: number

    @Column()
    ip?: string

    @Column()
    onlineTime!: number

    @Column()
    TotalOnlineTime!: number

    @Column()
    LotteryCount?: number

    @Column()
    referee?: string

    @Column()
    Receive!: number

    @Column()
    code!: number

    @Column()
    codeTime!: number

    @Column()
    dat_t!: number

    @Column()
    dat_to!: number

    @Column()
    day_t!: number

    @Column()
    day_to!: number

    @Column()
    day_z!: number

    @Column()
    vip!: number

    @Column()
    day!: number
}