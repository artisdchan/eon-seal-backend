export type DashBoardResponseDTO = {
    userId: string
    amount: number
}

export enum TopListType {
    CRYSTAL = 'CRYSTAL',
    RUBY = 'RUBY',
    CEGEL = 'CEGEL',
    DIAMOND = 'DIAMOND',
    RC = 'RC',
    CASH = 'CASH',
    G4 = 'G4',
    G5 = 'G5',
    G6 = 'G6',
    G7 = 'G7',
    G8 = 'G8',
    G10 = 'G10',
    G12 = 'G12',
    G13 = 'G13',
    G14 = 'G14',
    CP = 'CP'
}

export type AllMoney = {
    user_id: string
    amount: number
}

export type CharacterItemDTO = {
    charName: string
    amount: number
    userId: string
}

export type AccountItemAmountDTO = {
    userId: string
    amount: number
}

export type AccountItemAmountDTO2 = {
    userId: string
    amount: string
}

export type ServerInfoResponseDTO = {
    allOnlinePlayer: number
    allCash: number
    allCegel: number
    allCrystal: number
    allRuby: number
    allDiamond: number
    allRc: number
    allCrystalPoint: number
}

export type BotServerInfoResponse = {
    allOnlinePlayer: number
    allCash: number
    allCegel: number
    allCrystal: number
    allRuby: number
    allDiamond: number
    allRc: number
    allCrystalPoint: number
}