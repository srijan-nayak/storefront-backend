import pgPool from "../database";
import { QueryResult } from "pg";

type PasswordDigest = string;
type PasswordPlainText = string;

export type User = {
  id?: number;
  firstName: string;
  lastName: string;
  password: PasswordDigest | PasswordPlainText;
};

export type StoredUser = {
  id: number;
  first_name: string;
  last_name: string;
  password_digest: PasswordDigest;
};

const storedUserToUser = (storedUser: StoredUser): User => ({
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

  static async show(userId: number): Promise<User> {
    const result: QueryResult<StoredUser> = await pgPool.query(
      "select * from users where id = $1",
      [userId]
    );
    if (!result.rows[0]) {
      throw new Error(`User with ID ${userId} doesn't exist`);
    }
    return storedUserToUser(result.rows[0]);
  }
}

export default UserStore;
