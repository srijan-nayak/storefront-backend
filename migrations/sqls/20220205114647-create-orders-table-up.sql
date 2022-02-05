create table orders
(
    id        serial primary key,
    user_id   varchar(100) references users (id) on delete cascade on update cascade,
    completed boolean not null
);
