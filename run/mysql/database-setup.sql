# Creating databases and granting rights
CREATE DATABASE mmg_annotation;
GRANT ALL PRIVILEGES ON mmg_annotation.* TO 'mmg-annotation-db'@'%' IDENTIFIED BY 'mmgannotationdb';