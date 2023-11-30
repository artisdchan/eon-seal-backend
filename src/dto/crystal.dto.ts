import { CrystalItemType } from "../entity/item/crystal_shop.entity"

export type PurchaseCrystalShopRequestDTO = {
    purchasedId: number
    // characterName: string
}

export type CrystalShopResponseDTO = {
    id: number
    itemId: number
    itemName: string
    itemAmount: number
    itemPicture: string
    itemType: string
    isBuyable: boolean
    itemCrystalPrice: number
    itemCegelPrice: number
    globalPurchaseLimit: number
    globalPurchaseCount: number
    accountPurchaseLimit: number
    accountPurchaseCount: number
    itemBag: string
}

export type CrystalShopRequestDTO = {
    page: number
    perPage: number
    itemType: CrystalItemType | undefined
}