create table products
(
    id       serial primary key,
    name     varchar(150),
    price    money,
    category varchar(75)
);
