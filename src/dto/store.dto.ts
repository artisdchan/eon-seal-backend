export type ConvertRCRequestDTO = {
    amount: number;
    convertType: ConvertRCType
}

export type ConvertCrystalRequestDTO = {
    crystalPoint: number;
}

export enum ConvertRCType {
    RC_TO_CASH = "RC_TO_CASH",
    CASH_TO_RC = "CASH_TO_RC",
    CRYSTAL_TO_CP = "CRYSTAL_TO_CP"
  }