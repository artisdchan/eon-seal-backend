import { PackageType } from "../entity/item/package.entity";
import { PackageHistoryStatus } from "../entity/item/purchase_package_history.entity";

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

export type PackagePurchaseHistoryResponseDTO = {
    packageName: string;
    priceTopupCredit: number
    status: PackageHistoryStatus
    purchaseTime: Date
}
