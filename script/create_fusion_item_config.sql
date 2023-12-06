CREATE TABLE item.fusion_item_config (
	id int auto_increment NOT NULL,
	item_id int NOT NULL,
	item_type varchar(100) NOT NULL,
	item_level int NOT NULL,
	item_name varchar(255) NOT NULL,
	item_picture varchar(1000) NOT NULL,
	CONSTRAINT fusion_item_config_pk PRIMARY KEY (id)
);
CREATE TABLE `seal_member`.`web_user_detail` (
	`user_id` varchar(100) NOT NULL ,
	`shard_common_point` int NOT NULL,
	`shard_uncommon_point` int NOT NULL,
	`shard_rare_point` int NOT NULL,
	`shard_epic_point` int NOT NULL,
	`shard_legendary_point` int NOT NULL,
	`crystal_point` int NOT NULL,
	`cash_spend_point` int NOT NULL,
	`user_level` int NOT NULL,
	PRIMARY KEY (`user_id`)) ENGINE=InnoDB;
	
CREATE TABLE seal_member.web_config (
	config_key varchar(255) NOT NULL,
	config_value varchar(255) NOT NULL,
	description varchar(255) NOT NULL,
	CONSTRAINT web_config_pk PRIMARY KEY (config_key)
)
ENGINE=InnoDB;

CREATE TABLE `item`.`crystal_shop` (
	`id` int NOT NULL AUTO_INCREMENT, 
	`shop_type` varchar(255) NOT NULL, 
	`item_name` varchar(255) NOT NULL, 
	`item_id` int NOT NULL, 
	`item_amount` int NOT NULL, 
	`item_type` varchar(255) NOT NULL, 
	`item_picture` text NOT NULL,
	`item_bag` varchar(255) NOT NULL,  
	`price_crystal` int NOT NULL,
	`price_cegel` int NOT NULL,  
	`price_red_dragon` int NOT NULL,  
	`price_blue_dragon` int NOT NULL,  
	`enable_purchase_over_limit` tinyint NOT NULL, 
	`over_limit_price_percent` int NOT NULL, 
	`global_purchase_limit` int NOT NULL, 
	`account_purchase_limit` int NOT NULL, 
	`count_global_purchase` int NOT NULL, 
	`status` varchar(255) NOT NULL, 
	PRIMARY KEY (`id`)
) ENGINE=InnoDB;