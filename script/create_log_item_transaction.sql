CREATE TABLE log_item.log_item_transaction (
	log_id int auto_increment NOT NULL,
	log_type varchar(100) NOT NULL,
	log_action varchar(100) NOT NULL,
	status varchar(100) NOT NULL,
	message varchar(500) NULL,
	create_time datetime NOT NULL,
	action_by_user_id varchar(100) NOT NULL,
	update_time datetime NOT NULL,
	CONSTRAINT log_item_transaction_pk PRIMARY KEY (log_id)
)
ENGINE=InnoDB;

CREATE TABLE `log_item`.`crystal_shop_purchase_history` (
	`id` int NOT NULL AUTO_INCREMENT,
	`action_user_id` varchar(255) NOT NULL, 
	`purchased_item_id` int NOT NULL, 
	`purchased_crystal_price` int NOT NULL,
	`purchased_red_dragon_price` int NOT NULL, 
	`purchased_blue_dragon_price` int NOT NULL, 
	`purchased_cegel_price` int NOT NULL, 
	`purchased_time` datetime NOT NULL, 
	`purchased_crystal_shop_id` int NOT NULL, 
	PRIMARY KEY (`id`)
) 
ENGINE=InnoDB;

CREATE TRIGGER updateCashSpend AFTER INSERT ON log_item.log_item
	FOR EACH ROW
    update seal_member.web_user_detail
	set cash_spend_point = cash_spend_point + new.item_price
	where user_id = new.user_id
;

CREATE TABLE `item`.`market_white_list` (
  `id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `item_name` VARCHAR(255) NOT NULL,
  `item_picture_url` VARCHAR(255) NOT NULL,
  `item_type` VARCHAR(255) NOT NULL,
  `item_bag` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`));
