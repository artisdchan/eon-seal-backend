import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'web_config' })
export class WebConfig {
    
    @PrimaryColumn({ name: 'config_key' })
    configKey!: string

    @Column({ name: 'config_value' })
    configValue!: string

    @Column({ name: 'description' })
    description!: string

}

export enum WebConfigConstant {
    RC_ITEM_ID_CONFIG = 'RC_ITEM_CONFIG',
    CASH_PER_RC_CONFIG = 'CASH_PER_RC_CONFIG',
    CRYSTAL_CONVERT_TAX = 'CRYSTAL_CONVERT_TAX'
}