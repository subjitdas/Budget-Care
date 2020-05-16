Create table users
(
	username varchar(100) Primary key,
	password varchar(100) not null,
	first_name varchar(100) not null,
	last_name varchar(100) not null,
	created_at timestamp default CURRENT_TIMESTAMP,
	monthly_budget decimal(10,2) not null default 0
);

Create table spendings
(
	users_name varchar(100) not null,
	event varchar(100) not null,
	payment_method varchar(100) not null,
	amount_spent decimal(10,2) not null default 0,
	created_at timestamp default CURRENT_TIMESTAMP,
	foreign key(users_name) references users(username) on delete cascade
);