import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class guildinfo {

    @PrimaryColumn()
    name!: string

    @Column()
    mastername!: string

    @Column()
    notice!: string

    @Column()
    limitedcnt!: number

    @Column()
    regcnt!: number

    @Column()
    totallevel!: number

    @Column()
    crtdate!: Date

    @Column()
    gradevalue!: string

    @Column()
    savepoint!: number

    @Column()
    level!: number

    @Column()
    emblem!: number

    @Column()
    trophy!: number
    
}