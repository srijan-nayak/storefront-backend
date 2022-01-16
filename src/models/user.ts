import pgPool from "../database";
import { QueryResult } from "pg";
import dotenv from "dotenv";
import { hash } from "bcrypt";

dotenv.config();
const env: NodeJS.ProcessEnv = process.env;

type PasswordDigest = string;
type PasswordPlainText = string;

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  password: PasswordDigest | PasswordPlainText;
};

export type StoredUser = {
  id: string;
  first_name: string;
  last_name: string;
  password_digest: PasswordDigest;
};

export const storedUserToUser = (storedUser: StoredUser): User => ({
  id: storedUser.id,
  firstName: storedUser.first_name,
  lastName: storedUser.last_name,
  password: storedUser.password_digest,
});

class UserStore {
  static async index(): Promise<User[]> {
    const result: QueryResult<StoredUser> = await pgPool.query(
      "select * from users"
    );
    return result.rows.map(storedUserToUser);
  }

  static async show(userId: string): Promise<User> {
    const result: QueryResult<StoredUser> = await pgPool.query(
      "select * from users where id = $1",
      [userId]
    );
    if (!result.rows[0]) {
      throw new Error(`User with ID ${userId} doesn't exist`);
    }
    return storedUserToUser(result.rows[0]);
  }

  static async create(user: User): Promise<User> {
    const { id, firstName, lastName, password } = user;
    const passwordDigest: string = await hash(
      password + env["PEPPER"],
      parseInt(env["SALT_ROUNDS"] as string)
    );
    const result: QueryResult<StoredUser> = await pgPool.query(
      `insert into users (id, first_name, last_name, password_digest)
       values ($1, $2, $3, $4)
       returning *`,
      [id, firstName, lastName, passwordDigest]
    );
    return storedUserToUser(result.rows[0]);
  }
}

export default UserStore;
