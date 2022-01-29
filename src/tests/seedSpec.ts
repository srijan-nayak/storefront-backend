import { PoolClient } from "pg";
import pgPool from "../database";
import { User } from "../models/user";
import { hash } from "bcrypt";
import dotenv from "dotenv";
import { Product } from "../models/product";
import { StoredOrder, StoredOrderProduct } from "../models/order";

dotenv.config();
const env = process.env;

const sampleUsers: User[] = [
  {
    id: "antasia_marjory",
    firstName: "Antasia",
    lastName: "Marjory",
    password: "scenariofallen",
  },
  {
    id: "april_serra",
    firstName: "April",
    lastName: "Serra",
    password: "husbandpope",
  },
  {
    id: "taysia_amylynn",
    firstName: "Taysia",
    lastName: "Amylynn",
    password: "gramsblogger",
  },
];

const sampleProducts: Product[] = [
  { id: 101, name: "Fantastic Frozen Hat", price: 8.12, category: "Clothing" },
  { id: 102, name: "Refined Steel Chair", price: 45.34, category: "Furniture" },
  { id: 103, name: "Sleek Frozen Chair", price: 38.34, category: "Furniture" },
  { id: 104, name: "Rustic Steel Hat", price: 20.13, category: "Clothing" },
  { id: 105, name: "Sleek Granite Gloves", price: 60.23, category: "Clothing" },
  { id: 106, name: "Sleek Granite Salad", price: 15.14, category: "Food" },
];

const sampleOrders: StoredOrder[] = [
  { id: 201, user_id: "april_serra", completed: false },
  { id: 202, user_id: "antasia_marjory", completed: false },
  { id: 203, user_id: "april_serra", completed: false },
];

const sampleOrderProducts: StoredOrderProduct[] = [
  { order_id: 201, product_id: 103, quantity: 8 },
  { order_id: 201, product_id: 102, quantity: 4 },
  { order_id: 201, product_id: 106, quantity: 1 },
  { order_id: 202, product_id: 104, quantity: 3 },
  { order_id: 202, product_id: 105, quantity: 2 },
  { order_id: 202, product_id: 103, quantity: 6 },
  { order_id: 202, product_id: 101, quantity: 6 },
  { order_id: 203, product_id: 106, quantity: 2 },
  { order_id: 203, product_id: 105, quantity: 2 },
];

beforeEach(async (): Promise<void> => {
  const client: PoolClient = await pgPool.connect();

  for (const user of sampleUsers) {
    const { id, firstName, lastName, password } = user;
    const passwordDigest: string = await hash(
      password + env["PEPPER"],
      parseInt(env["SALT_ROUNDS"] as string)
    );
    await client.query("insert into users values ($1, $2, $3, $4)", [
      id,
      firstName,
      lastName,
      passwordDigest,
    ]);
  }

  for (const product of sampleProducts) {
    const { id, name, price, category } = product;
    await client.query(
      `insert into products
       values ($1, $2, $3, $4)`,
      [id, name, price, category]
    );
  }

  for (const order of sampleOrders) {
    const { id, user_id, completed } = order;
    await client.query(
      `insert into orders
       values ($1, $2, $3)`,
      [id, user_id, completed]
    );
  }

  for (const orderProduct of sampleOrderProducts) {
    const { order_id, product_id, quantity } = orderProduct;
    await client.query(
      `insert into order_products
       values ($1, $2, $3)`,
      [order_id, product_id, quantity]
    );
  }

  client.release();
});

afterEach(async (): Promise<void> => {
  await pgPool.query("delete from users");
  await pgPool.query("delete from products");
});
