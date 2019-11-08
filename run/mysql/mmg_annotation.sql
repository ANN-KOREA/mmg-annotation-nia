USE mmg_annotation;

CREATE TABLE `case_info` (
  `case_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `case_name` varchar(20) DEFAULT NULL,
  `case_path` varchar(150) NOT NULL DEFAULT '',
  `enabled` tinyint(11) unsigned NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL,
  `desc` longtext,
  PRIMARY KEY (`case_id`)
);

CREATE TABLE `user_case_map` (
  `user_id` int(11) unsigned NOT NULL,
  `seq` int(11) unsigned NOT NULL,
  `case_id` int(11) unsigned NOT NULL,
  `task_type` varchar(5) NOT NULL,
  `enabled` tinyint(11) unsigned NOT NULL DEFAULT '1',
  `discard_yn` tinyint(11) unsigned DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`,`seq`)
);

CREATE TABLE `user_info` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `login_name` varchar(40) NOT NULL,
  `passwd` varchar(128) NOT NULL,
  `nickname` varchar(20) NOT NULL,
  `enabled` tinyint(3) unsigned NOT NULL DEFAULT '1',
  `access_token` varchar(200) DEFAULT NULL,
  `expiry` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `modified_at` datetime DEFAULT NULL,
  `ucm_seq` int(10) unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`user_id`)
);

# For test usage
INSERT INTO `user_info` (login_name, passwd, nickname) Values ('test', '5d3928f25b5fb094260210d5e8a1fa90bd4812e25aede3a4fa4e09a3f476bcce', 'test user for tool');
INSERT INTO `case_info` (case_path, created_at) VALUES ('test/1' , NOW());
INSERT INTO `case_info` (case_path, created_at) VALUES ('test/2' , NOW());
INSERT INTO `user_case_map` (user_id, seq, case_id, task_type, created_at) VALUES (1,1,1,'LA',NOW());
INSERT INTO `user_case_map` (user_id, seq, case_id, task_type, created_at) VALUES (1,2,2,'LA',NOW());