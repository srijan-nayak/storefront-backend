import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();
const env: NodeJS.ProcessEnv = process.env;

const pgPool: Pool = new Pool({
  user: env["PG_USER"],
  password: env["PG_PASSWORD"],
  database: env["NODE_ENV"] === "test" ? env["PG_TEST_DB"] : env["PG_DB"],
  host: env["PG_HOST"] || "localhost",
  port: env["PG_PORT"] !== undefined ? parseInt(env["PG_PORT"]) : 5432,
});

export default pgPool;
