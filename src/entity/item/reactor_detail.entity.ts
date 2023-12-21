import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'reactor_detail' })
export class ReactorDetail {

    @PrimaryGeneratedColumn('increment', { name: 'reactor_detail_id' })
    reactorDetailId!: number

    @Column({ name: 'reactor_id' })
    reactorId!: number

    @Column({ name: 'item_id' })
    itemId!: number

    @Column({ name: 'item_name' })
    itemName!: string

    @Column({ name: 'item_amount' })
    itemAmount!: number

    @Column({ name: 'item_option' })
    itemOption!: number

    @Column({ name: 'item_limit' })
    itemLimit!: number

    @Column({ name: 'item_level' })
    itemLevel!: number

    @Column({ name: 'item_bag' })
    itemBag!: string

    @Column({ name: 'item_picture_url' })
    itemPictureUrl!: string

    @Column({ name: 'item_chance' })
    itemChance!: number

}