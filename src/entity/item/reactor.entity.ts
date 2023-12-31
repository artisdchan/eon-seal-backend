import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'reactor' })
export class Reactor {

    @PrimaryGeneratedColumn('increment')
    id!: number

    @Column({ name: 'reactor_name' })
    reactorName!: string

    @Column({ name: 'reactor_level' })
    reactorLevel!: number

    @Column({ name: 'success_rate_to' })
    successRateTo!: number

    @Column({ name: 'success_rate_from' })
    successRateFrom!: number

    @Column({ name: 'price_eon' })
    priceEon!: number

    @Column({ name: 'price_cp' })
    priceCp!: number
    
}