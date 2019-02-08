-- EXAMPLES
-- CREATE TABLE IF NOT EXISTS users (
-- 	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
-- 	name varchar(30) NOT NULL,
-- 	age INTEGER(3) NOT NULL
-- );

-- INSERT INTO users(name, age)
-- VALUES 
-- 	("Den", 12),
-- 	("Sasha", 22),
-- 	("Oleg", 42),
-- 	("Vasya", 42);


-- COMMANDS
-- .open [db name]
-- .tables
-- .schema [name of table]

-- .mode column
-- .headers on

-- USER
CREATE TABLE IF NOT EXISTS `users` (
	users_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	users_name TEXT(30),
	users_password TEXT(30);
);
INSERT INTO users(users_name, users_password)
VALUES (?, ?)

SELECT users_name,
	   users_password
FROM users;

-- CURRENT USER
CREATE TABLE IF NOT EXISTS `current_user` (
	current_user_name TEXT(30) NOT NULL PRIMARY KEY
);

-- CLIENT
CREATE TABLE IF NOT EXISTS `clients` (
	clients_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	clients_name TEXT(40),
	clients_phone TEXT(20) NOT NULL,
	client_repair_date TEXT(10),
	client_repair_cost TEXT(10),
	clients_note TEXT,
	clients_vincode TEXT(17) NOT NULL,
	client_vehicle_number TEXT(10) NOT NULL,
	client_vehicle INTEGER NOT NULL,
	client_vehicle_year TEXT(4) NOT NULL,
	client_vehicle_color TEXT(7),
	client_current_user TEXT(30) NOT NULL,
	clients_technical_problem INTEGER NOT NULL,
	FOREIGN KEY (client_vehicle_number) REFERENCES model(model_id),
	FOREIGN KEY (clients_technical_problem) REFERENCES breakdown(breakdown_id)
);

-- coping one row from client to clients_deleted;
INSERT INTO clients_deleted SELECT * FROM clients WHERE clients.clients_id = 1;

-- all from clients
select clients.clients_id,
	   clients.clients_name,
	   clients.client_repair_date,
	   clients.client_repair_cost,
	   clients.clients_note,
	   clients.clients_vincode,
	   clients.client_vehicle_number,
	   marque.marque_name,
	   model.model_name,
	   category.category_name,
	   repair_object.repair_object_name
from clients,
	 model, marque,
	 breakdown, category, repair_object
where clients.client_vehicle = model.model_id and
	  model.model_marque_id = marque.marque_id and
	  clients.clients_technical_problem = breakdown.breakdown_id and
	  breakdown.breakdown_category_id = category.category_id and
	  breakdown.breakdown_repair_object_id = repair_object.repair_object_id;


-- for search.html
select clients.clients_name,
	   clients.client_repair_date,
	   clients.client_repair_cost,
	   clients.clients_note,
	   clients.clients_vincode,
	   clients.client_vehicle_number,
	   marque.marque_name,
	   model.model_name,
	   category.category_name,
	   repair_object.repair_object_name
from clients,
	 model, marque,
	 breakdown, category, repair_object
where clients.client_vehicle = model.model_id and
	  model.model_marque_id = marque.marque_id and
	  clients.clients_technical_problem = breakdown.breakdown_id and
	  breakdown.breakdown_category_id = category.category_id and
	  breakdown.breakdown_repair_object_id = repair_object.repair_object_id;


--deleting
DELETE FROM clients
WHERE clients.clients_id = '4';








-- TEST

CREATE TABLE IF NOT EXISTS `client` (
	client_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	client_name TEXT(30) NOT NULL,
	client_breakdown_id INTEGER NOT NULL,
	FOREIGN KEY (client_breakdown_id) REFERENCES breakdown(breakdown_id) 
);

-- TABLES VEHICLE 3.0
create table if not exists `model` (
	model_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	model_marque_id INTEGER NOT NULL,
	model_name TEXT(30) NOT NULL,
	FOREIGN KEY (model_marque_id) REFERENCES marque(marque_id)
);

create table if not exists `marque` (
	marque_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	marque_name TEXT(30) NOT NULL
);

select marque.marque_name,
	   model.model_name
from model, marque
where model.model_marque_id = marque.marque_id;

select	model.model_id,
		marque.marque_name,
		model.model_name
from model, marque
where model.model_marque_id = marque.marque_id and
	  marque.marque_id = 123
order by model.model_name asc;
-- TABLES REPAIR
CREATE TABLE IF NOT EXISTS `breakdown` (
	breakdown_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	breakdown_category_id INTEGER NOT NULL,
	breakdown_repair_object_id INTEGER NOT NULL,
	FOREIGN KEY (breakdown_repair_object_id) REFERENCES repair_object(repair_object_id),
	FOREIGN KEY (breakdown_category_id) REFERENCES category(category_id)
);
INSERT INTO breakdown(breakdown_category_id, breakdown_repair_object_id)
VALUES
	(1,1),
	(1,2),
	(1,3),
	(1,4),
	(1,5),
	(1,6),
	(2,7),
	(2,8),
	(2,9),
	(3,10),
	(3,11),
	(4,12),
	(4,13),
	(4,14);

CREATE TABLE IF NOT EXISTS `category` (
	category_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	category_name TEXT(40) NOT NULL
);
INSERT INTO category(category_name)
VALUES
	('Двигатель и Система выхлопа'),
	('Тормозная система'),
	('Подвеска и Рулевое'),
	('Охлаждение и Отопление');


CREATE TABLE IF NOT EXISTS `repair_object` (
	repair_object_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	repair_object_name TEXT(40) NOT NULL
);
INSERT INTO repair_object(repair_object_name)
VALUES
	('Детали двигателя'),
	('Ремни, цепи и натяжители'),
	('Система выпуска'),
	('Фильтры'),
	('Топливная система и управление двигателем'),
	('Турбины'), 
	('Тормозные элементы'),
	('Гидравлика тормозной системы'),
	('Электронные компоненты'),
	('Подвеска'),
	('Рулевое управление'),
	('Охлаждение'),
	('Система кондиционирования'),
	('Система отопления');

--узнать breakdown.breakdown_id основываясь на  breakdown.breakdown_repair_object_id и  breakdown.breakdown_category_id
select breakdown.breakdown_id,
	   breakdown.breakdown_category_id,
	   category.category_name,
	   breakdown.breakdown_repair_object_id,
	   repair_object.repair_object_name
from breakdown, category, repair_object
where breakdown.breakdown_category_id = category.category_id and
	  breakdown.breakdown_repair_object_id = repair_object.repair_object_id;


-- so as to extract only one exapmle of row https://zametkinapolyah.ru/zametki-o-mysql/chast-12-10-isklyuchit-povtoryayushhiesya-stroki-iz-vyborki-dannyx-select-distinct-v-sqlite.html
select distinct category.category_name
from breakdown, category
where breakdown.breakdown_category_id = category.category_id
order by category.category_name asc;

--next step of the previous select
select category.category_name,
	   repair_object.repair_object_name
from repair_object, breakdown, category
where breakdown.breakdown_category_id = category.category_id and
	  breakdown.breakdown_repair_object_id = repair_object.repair_object_id and
      category.category_name = [variable]
order by repair_object.repair_object_name asc;


select category.category_name,
	   repair_object.repair_object_name
from breakdown, category, repair_object
where (breakdown.breakdown_category_id = category.category_id) AND
	  (breakdown.breakdown_repair_object_id = repair_object.repair_object_id);



CREATE TABLE IF NOT EXISTS `users` (
	users_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	users_name TEXT(30) NOT NULL,
	users_password TEXT(30) NOT NULL
);





-- EXPERIMENTS
-- CREATE TABLE IF NOT EXISTS `test` (
-- 	date DATE(`%Y%m%d`);
-- );

-- SELECT strftime(`%Y%m%d`, `now`);

CREATE TABLE artists(
  artists_id INTEGER PRIMARY KEY AUTOINCREMENT, 
  name TEXT
);
 
CREATE TABLE tracks(
  tracks_id INTEGER PRIMARY KEY AUTOINCREMENT, 
  title TEXT, 
  id_artist INTEGER,
  FOREIGN KEY(id_artist) REFERENCES artists(artists_id)
);

CREATE TABLE rates(
  rates_id INTEGER PRIMARY KEY AUTOINCREMENT, 
  mark TEXT, 
  id_traks INTEGER,
  FOREIGN KEY(id_traks) REFERENCES tracks(tracks_id)
);

INSERT INTO artists (name) VALUES ('Nightwish');
INSERT INTO artists (name) VALUES ('Scooter');
INSERT INTO rates (mark, id_traks) VALUES ('cool', 1);

SELECT tracks.tracks_id,
	   tracks.title,
	   artists.name
FROM tracks
LEFT JOIN artists ON tracks.id_artist = artists.artists_id;

-- SELECT t1.col, t3.col 
-- FROM table1 join table2 ON table1.primarykey = table2.foreignkey
-- join table3 ON table2.primarykey = table3.foreignkey 


-- SELECT tracks.tracks_id,
-- 	   tracks.title,
-- 	   artists.name 
-- FROM artists
-- INNER JOIN (SElECT )tracks ON artists.artists_id = tracks.id_artist
-- JOIN rates ON tracks.tracks_id = rates.id_traks;

-- rates(a) -> tracks(b) -> artists(c)


!! important query !!
SELECT rates.mark,
	   artists.name,
	   tracks.title 
FROM rates, artists, tracks
WHERE (artists.artists_id = tracks.id_artist) AND
	  (tracks.tracks_id = rates.id_traks);
!! important query !!
