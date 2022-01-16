import pgPool from "../database";
import { QueryResult } from "pg";
import dotenv from "dotenv";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";

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
    if (await this.doesUserExist(id)) {
      throw new Error(`User with ID ${id} already exists`);
    }
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

  static async authenticate(
    userId: string,
    password: PasswordPlainText
  ): Promise<string> {
    const user: User = await this.show(userId);
    if (await compare(password + env["PEPPER"], user.password)) {
      return sign(user, env["JWT_SECRET"] as string);
    } else {
      throw new Error(`Incorrect password for user ${userId}`);
    }
  }

  private static async doesUserExist(userId: string): Promise<boolean> {
    const result: QueryResult<User> = await pgPool.query(
      `select *
       from users
       where id = $1`,
      [userId]
    );
    return result.rows.length !== 0;
  }
}

export default UserStore;
