import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'crystal_shop_purchase_history' })
export class CrystalShopPurchaseHistory {
    
    @PrimaryGeneratedColumn('increment')
    id!: number

    @Column({ name: 'action_user_id' })
    actionUserId!: string

    @Column({ name: 'purchased_item_id' })
    purchasedItemId!: number

    @Column({ name: 'purchased_crystal_price' })
    purchasedCrystalPrice!: number

    @Column({ name: 'purchased_time' })
    purchasedTime!: Date

    @Column({ name: 'purchased_crystal_shop_id' })
    purchasedCrystalShopId!: number

}