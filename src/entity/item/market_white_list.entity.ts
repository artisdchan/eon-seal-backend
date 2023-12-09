import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'market_white_list' })
export class MarketWhiteList {

    @PrimaryGeneratedColumn('increment')
    id!: number

    @Column({ name: 'item_id' })
    itemId!: number

    @Column({ name: 'item_name' })
    itemName!: string

    @Column({ name: 'item_picture_url' })
    itemPictureUrl!: string

    @Column({ name: 'item_type' })
    itemType!: WhiteListItemType

    @Column({ name: 'item_bag' })
    itemBag!: WhiteListItemBag

}

export enum WhiteListItemType {
    COSTUME = "COSTUME"
}

export enum WhiteListItemBag {
    CHARACTER_CASH_INVENTORY = 'CHARACTER_CASH_INVENTORY',
    ACCOUNT_CASH_INVENTORY = 'ACCOUNT_CASH_INVENTORY',
    IN_GAME_ITEM_INVENTORY = 'IN_GAME_ITEM_INVENTORY',
}