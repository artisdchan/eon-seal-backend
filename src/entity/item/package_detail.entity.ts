import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'package_detail' })
export class PackageDetail {

    @PrimaryGeneratedColumn("increment", { name: 'package_detail_id'})
    packageDetailId!: number;

    @Column({ name: 'package_id' })
    packageId!: number;

    @Column({ name: 'item_id' })
    itemId!: number;

    @Column({ name: 'item_description' })
    itemDescription!: string;

    @Column({ name: 'item_amount' })
    itemAmount!: number;

    @Column({ name: 'item_effect' })
    itemEffect!: number;

    @Column({ name: 'item_refine_or_limit' })
    itemRefineOrLimit!: number;

    @Column({ name: 'item_picture_url' })
    itemPictureUrl!: string;

    @Column({ name: 'item_bag' })
    itemBag!: PackageItemBag;
    
}

export enum PackageItemBag {
    CHARACTER_CASH_INVENTORY = 'CHARACTER_CASH_INVENTORY',
    ACCOUNT_CASH_INVENTORY = 'ACCOUNT_CASH_INVENTORY',
    IN_GAME_ITEM_INVENTORY = 'IN_GAME_ITEM_INVENTORY',
    RANDOM_COSTUME_COMMON = 'RANDOM_COSTUME_COMMON',
    RANDOM_COSTUME_UNCOMMON = 'RANDOM_COSTUME_UNCOMMON',
    RANDOM_COSTUME_RARE = 'RANDOM_COSTUME_RARE',
    RANDOM_COSTUME_EPIC = 'RANDOM_COSTUME_EPIC',
    STACK_IN_GAME_ITEM = 'STACK_IN_GAME_ITEM'
}
