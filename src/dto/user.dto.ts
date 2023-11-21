export interface RegisterRequestDTO {
    username: string
    password: string
    email: string
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