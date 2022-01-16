# API Requirements

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be
able to browse an index of all products, see the specifics of a single product, and add products to an order that they
can view in a cart page. You have been tasked with building the API that will support this application, and your
coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as
well as data shapes the frontend and backend have agreed meet the requirements of the application.

## API Endpoints

### Products

- Index: `/products` [GET]
- Show: `/products/:product-id` [GET]
- Create: `/products` [POST] [token required]
- Top 5 most popular products: `/products?most-popular=true` [GET]
- Products by category (args: product category): `/products?category=<category>` [GET]

### Users

- Index: `/users` [GET] [token required]
- Show: `/users/:user-id` [GET] [token required]
- Create: `/users` [POST]

### Orders

- Current Orders by user (args: user id): `/users/:user-id/orders` [GET] [token required]
- Completed Orders by user (args: user id): `/users/:user-id/orders?completed=true` [token required]

## Data Shapes

### Product

- id
- name
- price
- category

### User

- id
- firstName
- lastName
- password (password digest in [GET] requests)

### Orders

- id
- id of each product in the order
- quantity of each product in the order
- user_id
- status of order (active or complete)

## Tables

### products

| column             | type      |
|--------------------|-----------|
| id (`primary key`) | `integer` |
| name               | `varchar` |
| price              | `money`   |
| category           | `varchar` |

### users

| column             | type      |
|--------------------|-----------|
| id (`primary key`) | `varchar` |
| first_name         | `varchar` |   
| last_name          | `varchar` |
| password_digest    | `varchar` |

### orders

| column                   | type      |
|--------------------------|-----------|
| id  (`primary key`)      | `integer` |
| user_id  (`foreign key`) | `varchar` |
| completed                | `boolean` |

### order-products

| column                                        | type      |
|-----------------------------------------------|-----------|
| order_id (`compund key part` `foreign key`)   | `integer` |
| product_id (`compund key part` `foregin key`) | `integer` |
| quantity                                      | `integer` |
