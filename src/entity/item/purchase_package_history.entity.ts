import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'purchase_package_history' })
export class PurchasePackageHistory {

    @PrimaryGeneratedColumn('increment', { name: 'purchase_id' })
    purchaseId!: number

    @Column({ name: 'package_id' })
    packageId!: number

    @Column({ name: 'purchased_by_user_id' })
    purchasedByUserId!: string

    @Column({ name: 'purchased_by_email' })
    purchasedByEmail!: string

    @Column({ name: 'status' })
    status!: PackageHistoryStatus

    @Column({ name: 'purchased_time' })
    purchasedTime!: Date
    
}

export enum PackageHistoryStatus {
    NEW = 'NEW',
    FAIL = 'FAIL',
    DONE = 'DONE'
}