import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'fusion_item_config' })
export class FusionItemConfig {

    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ name: 'item_id' })
    itemId!: number;
    
    @Column({ name: 'item_type' })
    itemType!: ItemType;

    @Column({ name: 'item_level' })
    itemLevel!: ItemLevel;

    @Column({ name: 'item_name' })
    itemName!: string;

    @Column({ name: 'item_picture' })
    itemPicture!: string;

}
export enum ItemType {
    COSTUME = "COSTUME",
}
export enum ItemLevel {
    COMMON = 1,
    UNCOMMON,
    RARE,
    EPIC,
    LEGENDARY
}