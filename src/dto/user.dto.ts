export interface RegisterRequestDTO {
    username: string
    password: string
    email: string
    storePass: number
}

export interface ResetPasswordDTO {
    currentPassword: string
    newPassword: string
}

export interface HashPasswordDTO {
    "hash_password": string
}

export interface TopupCashRequestDTO {
    email: string
    cashAmount: number;
}

export type CharacterNameResponseDTO = {
    characterName: string;
    isCharacterOnline: boolean;
}

export type ForgetPasswordRequestDTO = {
    email: string;
}

export type UserDetailResponseDTO = {
    shardCommonPoint: number
    shardUnCommonPoint: number
    shardRarePoint: number
    shardEpicPoint: number
    shardLegendaryPoint: number
    crystalPoint: number
    cashSpendPoint: number
    cashPoint: number
    userLevel: number
    userStatus: string
}

export type UserInfoResponseDTO = {
    gameUserId: string
    characterNames: string[]
}

export type AddTopupCreditRequestDTO = {
    email: string
    creditAmount: number
}
