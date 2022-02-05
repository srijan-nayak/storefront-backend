create table users
(
    id              varchar(100) primary key,
    first_name      varchar(100) not null,
    last_name       varchar(100) not null,
    password_digest varchar      not null
);
