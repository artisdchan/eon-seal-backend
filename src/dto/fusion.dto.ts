import { ItemLevel, ItemType } from "../entity/item/fusion_item.entity"

export type OwnedFusionItemResponseDTO = {
    characterBag: CharacterBagItem[]
    accountBag: AccountBagItem[]
}

export type CharacterBagItem = {
    itemId: number,
    itemType: ItemType,
    itemLevel: ItemLevel,
    itemName: string,
    itemPicture: string 
}

export type AccountBagItem = {
    itemId: number,
    itemType: ItemType,
    itemLevel: ItemLevel,
    itemName: string,
    itemPicture: string 
}

export type FusionItemRequestDTO = {
    characterSelectedItemId: number[]
    accountSelectedItemId: number[]
    itemLevel: ItemLevel
    itemType: ItemType
}

export type ExchangeCostumeResponseDTO = {
    itemId: number,
    itemType: ItemType,
    itemLevel: ItemLevel,
    itemName: string,
    itemPicture: string 
}