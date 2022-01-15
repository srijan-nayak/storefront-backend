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
}

export default UserStore;
