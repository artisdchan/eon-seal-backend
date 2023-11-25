export type ConvertRCRequestDTO = {
    rcAmount: number;
    convertType: ConvertRCType
}

export type ConvertCrystalRequestDTO = {
    crystalPoint: number;
}

export enum ConvertRCType {
    RC_TO_CASH = "RC_TO_CASH",
    CASH_TO_RC = "CASH_TO_RC"
  }