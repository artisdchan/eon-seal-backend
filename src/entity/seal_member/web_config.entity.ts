import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
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
    CASH_PER_RC_CONFIG = 'CASH_PER_RC_CONFIG'
}