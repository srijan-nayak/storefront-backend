import pgPool from "../database";
import { QueryResult } from "pg";

type passwordDigest = string;
type passwordPlainText = string;

export type User = {
  id?: number;
  firstName: string;
  lastName: string;
  password: passwordDigest | passwordPlainText;
};

class UserStore {
  static async index(): Promise<User[]> {
    const result: QueryResult<User> = await pgPool.query("select * from users");
    return result.rows;
  }

  static async show(userId: number): Promise<User> {
    const result: QueryResult<User> = await pgPool.query(
      "select * from users where id = $1",
      [userId]
    );
    if (!result.rows[0]) {
      throw new Error(`User with ID ${userId} doesn't exist`);
    }
    return result.rows[0];
  }
}

export default UserStore;
