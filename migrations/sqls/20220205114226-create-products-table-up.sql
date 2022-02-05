create table products
(
    id       serial primary key,
    name     varchar(150) not null,
    price    money        not null,
    category varchar(75)  not null
);
