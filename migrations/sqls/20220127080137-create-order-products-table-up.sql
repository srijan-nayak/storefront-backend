create table order_products
(
    order_id   integer references orders (id) on delete cascade on update cascade,
    product_id integer references products (id) on delete cascade on update cascade,
    quantity   integer not null,
    primary key (order_id, product_id)
);
