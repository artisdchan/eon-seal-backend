import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'package' })
export class Package {

    @PrimaryGeneratedColumn('increment', { name: 'package_id' })
    packageId!: number;

    @Column({ name: 'package_type' })
    packageType!: PackageType;

    @Column({ name: 'package_name' })
    packageName!: string;

    @Column({ name: 'package_picture_url' })
    packagePictureUrl!: string

    @Column({ name: 'package_description' })
    packageDescription!: string;

    @Column({ name: 'purchase_limit' })
    purchaseLimit!: number;

    @Column({ name: 'purchase_count' })
    purchaseCount!: number;

    @Column({ name: 'purchase_count_cond' })
    purchaseCountCond!: number;

    @Column({ name: 'price_topup_credit' })
    priceTopupCredit!: number;

    @Column({ name: 'status' })
    status!: PackageStatus;

    @Column({ name : 'package_reset' })
    packageReset!: string

}

export enum PackageType {
    PROMOTION = 'PROMOTION',
    TOTAL_TOPUP_REWARD = 'TOTAL_TOPUP_REWARD'
}

export enum PackageStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}