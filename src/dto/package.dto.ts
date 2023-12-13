import { PackageType } from "../entity/item/package.entity";

export type PackageResponse = {
    packageId: number;
    packageType: PackageType;
    packageName: string;
    packageDescription: string;
    packagePictureUrl: string;
    isPurchaseable: boolean;
    priceTopupCredit: number;
    accountPurchaseLimit: number;
    accountPurchaseCount: number;
    packageDetails: PackageDetailResponse[];
}

export type PackageDetailResponse = {
    itemId: number;
    itemDescription: string;
    itemAmount: number;
    itemUrl: string;
}
