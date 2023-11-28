export type DashBoardResponseDTO = {
    userId: string
    amount: number
}

export enum TopListType {
    CRYSTAL = 'CRYTAL',
    RUBY = 'RUBY',
    CEGEL = 'CEGEL',
    DIAMOND = 'DIAMOND',
    RC = 'RC',
    CASH = 'CASH'
}

export type AllMoney = {
    user_id: string
    amount: number
}

export type CharacterItemDTO = {
    charName: string
    amount: number
}
