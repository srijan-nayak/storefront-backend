import { PoolClient } from "pg";
import pgPool from "../database";
import { User } from "../models/user";
import { hash } from "bcrypt";
import dotenv from "dotenv";
import { Product } from "../models/product";

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
];

const sampleProducts: Product[] = [
  { id: 101, name: "Fantastic Frozen Hat", price: 8.12, category: "Clothing" },
  { id: 102, name: "Refined Steel Chair", price: 45.34, category: "Furniture" },
  { id: 103, name: "Sleek Frozen Chair", price: 38.34, category: "Furniture" },
  { id: 104, name: "Rustic Steel Hat", price: 20.13, category: "Clothing" },
  { id: 105, name: "Sleek Granite Gloves", price: 60.23, category: "Clothing" },
  { id: 106, name: "Sleek Granite Salad", price: 15.14, category: "Food" },
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

  client.release();
});

afterEach(async (): Promise<void> => {
  await pgPool.query("delete from users");
  await pgPool.query("delete from products");
});
