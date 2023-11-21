import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class pc {

    @PrimaryColumn()
    char_name!: string

    @Column()
    user_id!: string

    @Column()
    char_order!: number

    @Column()
    map_num!: number

    @Column()
    x!: number

    @Column()
    y!: number

    @Column()
    level!: number

    @Column()
    job!: number

    @Column()
    sex!: number

    @Column()
    exp!: number

    @Column()
    money!: number

    @Column()
    fame!: number

    @Column()
    play_flag!: number
}