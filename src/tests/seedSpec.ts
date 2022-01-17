import { PoolClient } from "pg";
import pgPool from "../database";
import { User } from "../models/user";
import { hash } from "bcrypt";
import dotenv from "dotenv";

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

beforeEach(async (): Promise<void> => {
  const client: PoolClient = await pgPool.connect();
  for (const user of sampleUsers) {
    const { id, firstName, lastName, password } = user;
    const passwordDigest: string = await hash(
      password + env["PEPPER"],
      parseInt(env["SALT_ROUNDS"] as string)
    );
    await client.query(`insert into users values ($1, $2, $3, $4)`, [
      id,
      firstName,
      lastName,
      passwordDigest,
    ]);
  }
  client.release();
});

afterEach(async (): Promise<void> => {
  await pgPool.query("delete from users");
});
