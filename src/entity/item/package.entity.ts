import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'package' })
export class Package {

    @PrimaryGeneratedColumn('increment')
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

}

export enum PackageType {
    PROMOTION = 'PROMOTION'
}

export enum PackageStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}