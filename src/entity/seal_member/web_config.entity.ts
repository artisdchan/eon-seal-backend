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
    RC_ITEM_ID_CONFIG = 'RC_ITEM_ID_CONFIG',
    CASH_PER_RC_CONFIG = 'CASH_PER_RC_CONFIG',
    CRYSTAL_CONVERT_TAX = 'CRYSTAL_CONVERT_TAX',
    CRYSTAL_ITEM_ID_CONFIG = 'CRYSTAL_ITEM_ID_CONFIG',
    RUBY_ITEM_ID_CONFIG = 'RUBY_ITEM_ID_CONFIG',
    DIAMOND_ITEM_ID_CONFIG = 'DIAMOND_ITEM_ID_CONFIG',
    RED_DRAGON_ITEM_ID_CONFIG = 'RED_DRAGON_ITEM_ID_CONFIG',
    BLUE_DRAGON_ITEM_ID_CONFIG = 'BLUE_DRAGON_ITEM_ID_CONFIG',
    REACTOR_EON_PRICE = 'REACTOR_EON_PRICE',
    REACTOR_CP_PRICE = 'REACTOR_CP_PRICE'
}