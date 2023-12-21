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
	`topup_credit` int NOT NULL,
	`total_topup` int NOT NULL,
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
	`item_effect` int NOT NULL, 
	`item_refine` int NOT NULL, 
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

CREATE TABLE `item`.`package` (
	`package_id` int NOT NULL AUTO_INCREMENT,
	`package_type` varchar(255) NOT NULL,
	`package_name` varchar(191) NOT NULL,
	`package_description` varchar(191) NOT NULL,
	`purchase_count_cond` int NOT NULL,
	`purchase_limit` int NOT NULL DEFAULT '0',
	`purchase_count` int NOT NULL DEFAULT '0',
	`price_topup_credit` decimal(65,30) NOT NULL,
	`status` varchar(255) NOT NULL,
	`package_picture_url` varchar(191) NOT NULL,
	PRIMARY KEY (`package_id`)
) ENGINE InnoDB;

CREATE TABLE `item`.`package_detail` (
	`package_detail_id` int NOT NULL AUTO_INCREMENT,
	`package_id` int NOT NULL,
	`item_id` int NOT NULL,
	`item_description` varchar(191) NOT NULL,
	`item_amount` int NOT NULL,
	`item_picture_url` varchar(191) NOT NULL,
	`item_bag` varchar(191) NOT NULL,
	`item_effect` int NOT NULL DEFAULT '0',
	`item_refine_or_limit` int NOT NULL DEFAULT '0',
	PRIMARY KEY (`package_detail_id`)
) ENGINE InnoDB;

CREATE TABLE `item`.`purchase_package_history` (
	`purchase_id` int NOT NULL AUTO_INCREMENT,
	`package_id` int NOT NULL,
	`purchased_by_user_id` varchar(191) NOT NULL,
	`purchased_by_email` varchar(191) NOT NULL,
	`status` varchar(191) NOT NULL,
	`message` varchar(255) NULL,
	`purchased_time` datetime(3) NOT NULL DEFAULT current_timestamp(3),
	PRIMARY KEY (`purchase_id`)
) ENGINE InnoDB;

CREATE TABLE `item`.`reactor` (
  `id` INT NOT NULL,
  `reactor_name` VARCHAR(255) NOT NULL,
  `reactor_level` INT NOT NULL,
  `success_rate` INT NOT NULL,
  `price_eon` INT NOT NULL,
  `price_cp` INT NOT NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `item`.`reactor_detail` (
  `reactor_detail_id` INT NOT NULL,
  `reactor_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `item_amount` INT NOT NULL,
  `item_option` INT NOT NULL,
  `item_limit` INT NOT NULL,
  `item_level` INT NOT NULL,
  `item_bag` VARCHAR(255) NOT NULL,
  `item_picture_url` VARCHAR(255) NOT NULL,
  `item_chance` INT NOT NULL,
  PRIMARY KEY (`reactor_detail_id`));
  
CREATE TABLE `item`.`reactor_history` (
  `id` INT NOT NULL,
  `reactor_level` INT NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `message` VARCHAR(255) NOT NULL,
  `action_by_game_user_id` VARCHAR(45) NOT NULL,
  `action_time` DATETIME NOT NULL,
  PRIMARY KEY (`id`));

CREATE TRIGGER `gdb0101`.`store_AFTER_UPDATE` AFTER UPDATE ON `store` FOR EACH ROW
BEGIN
    INSERT INTO `gdb0101`.`test` (`id`, `user`, `time`, `game_user_id`, `before`, `after`) VALUES (uuid(), USER(), now(), NEW.user_id, OLD.segel, NEW.segel);
END
