create table users
(
    id serial primary key,
    first_name varchar(100),
    last_name varchar(100),
    password_digest varchar
);
