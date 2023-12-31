import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'crystal_shop' })
export class CrystalShop {

    @PrimaryGeneratedColumn('increment')
    id!: number

    @Column({ name: 'shop_type' })
    shopType!: string

    @Column({ name: 'item_name' })
    itemName!: string

    @Column({ name: 'item_id' })
    itemId!: number

    @Column({ name: 'item_amount' })
    itemAmount!: number

    @Column({ name: 'item_effect' })
    itemEffect!: number

    @Column({ name: 'item_refine' })
    itemRefine!: number

    @Column({ name: 'item_type' })
    itemType!: CrystalItemType

    @Column({ name: 'item_picture' })
    itemPicture!: string

    @Column({ name: 'item_bag' })
    itemBag!: CrystalItemBag 

    @Column({ name: 'price_crystal' })
    priceCrystal!: number

    @Column({ name: 'price_cegel' })
    priceCegel!: number

    @Column({ name: 'price_red_dragon' })
    priceRedDragon!: number

    @Column({ name: 'price_blue_dragon' })
    priceBlueDragon!: number

    @Column({ name: 'enable_purchase_over_limit' })
    enablePurchaseOverLimit!: boolean

    @Column({ name: 'over_limit_price_percent' })
    overLimitPricePercent!: number

    @Column({  name: 'global_purchase_limit' })
    globalPurchaseLimit!: number

    @Column({ name: 'account_purchase_limit' })
    accountPurchaseLimit!: number

    // @Column({ name: 'account_purchase_limit_daily' })
    // accountPurchaseLimitDaily!: number

    // @Column({ name: 'account_purchase_limit_weekly' })
    // accountPurchaseLimitWeekly!: number

    // @Column({ name: 'account_purchase_limit_monthly' })
    // accountPurchaseLimitMonthly!: number

    @Column({ name: 'count_global_purchase' })
    countGlobalPurchase!: number

    @Column({ name: 'status' })
    status!: CrystalItemStatus

}

export enum CrystalItemBag {
    CHARACTER_CASH_INVENTORY = 'CHARACTER_CASH_INVENTORY',
    ACCOUNT_CASH_INVENTORY = 'ACCOUNT_CASH_INVENTORY',
    IN_GAME_ITEM_INVENTORY = 'IN_GAME_ITEM_INVENTORY',
    RANDOM_COSTUME_RARE = 'RANDOM_COSTUME_RARE',
    RANDOM_COSTUME_EPIC = 'RANDOM_COSTUME_EPIC'
}

export enum CrystalItemStatus{
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export enum CrystalItemType {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    UNLIMIT = 'UNLIMIT'
}