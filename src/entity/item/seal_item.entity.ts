import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "seal_item" })
export class SealItem {
    
    @PrimaryGeneratedColumn('increment')
    UniqueNum!: number;

    @Column({ name: "ItemType"})
    itemId!: number;

    @Column()
    ItemOp1!: number;

    @Column()
    ItemOp2!: number;

    @Column()
    ItemLimit!: number;

    @Column({ name: "OwnerID" })
    userId!: string;

    @Column()
    OwnerDate!: Date;

    @Column()
    bxaid!: string;
    
}