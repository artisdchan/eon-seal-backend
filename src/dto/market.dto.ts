import { WhiteListItemBag, WhiteListItemType } from "../entity/item/market_white_list.entity"

export type UserItemResponseDTO = {
    characterBag: ItemDetail[]
    accountBag: ItemDetail[]
}

export type ItemDetail = {
    itemId: number
    itemName: string
    refineLevel: number
    itemEffectCode: string
    itemEffectMessage: string
    itemPictureUrl: string
    itemBag: WhiteListItemBag
    itemType: WhiteListItemType
    itemAmount: number
}