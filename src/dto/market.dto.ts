import { WhiteListItemBag, WhiteListItemType } from "../entity/item/market_white_list.entity"

export type MarketItemResponseDTO = {
    characterBag: ItemDetail[]
    accountBag: ItemDetail[]
}

export type ItemDetail = {
    itemId: number
    itemName: string
    refineLevel: number
    itemOption: number
    itemEffectCode: number
    itemEffectMessage: string
    itemPictureUrl: string
    itemBag: WhiteListItemBag
    itemType: WhiteListItemType
    itemAmount: number
}

export type BuyBackCpRequest = {
    gameUserId: string
    cpAmount: number
}

export type ValidateItemRequest = {
    email: string,
    itemId: number,
    itemOption: number,
    itemEffectCode: number,
    itemRefine: number,
    itemBag: WhiteListItemBag
}

export type RemoveItemRequest = {
    email: string,
    itemId: number,
    itemOption: number,
    itemEffectCode: number,
    itemRefine: number,
    itemBag: WhiteListItemBag
}
