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

type StoredUser = {
  id: string;
  first_name: string;
  last_name: string;
  password_digest: PasswordDigest;
};

class UserStore {
  /**
   * Gets a list of all users in the database.
   *
   * @returns list of all users in database
   */
  static async index(): Promise<User[]> {
    try {
      const result: QueryResult<StoredUser> = await pgPool.query(
        "select * from users"
      );
      return result.rows.map(UserStore.storedUserToUser);
    } catch (error) {
      throw new Error("Couldn't get list of users from database");
    }
  }

  /**
   * Gets all user details for a given user ID. Throws an error if user with
   * given ID doesn't exist.
   *
   * @param userId user ID of user whose details are to be shown
   * @returns user details
   */
  static async show(userId: string): Promise<User> {
    const result: QueryResult<StoredUser> = await pgPool.query(
      "select * from users where id = $1",
      [userId]
    );
    if (!result.rows[0]) {
      throw new Error(`User with ID ${userId} doesn't exist`);
    }
    return UserStore.storedUserToUser(result.rows[0]);
  }

  /**
   * Create and insert a new user into the database. Throws an error if a user
   * already exists with the same user ID in the database.
   *
   * @param user new user to be created, password field should contain the plain
   * text password
   * @returns created user, password field contains the hashed password digest
   */
  static async create(user: User): Promise<User> {
    const { id, firstName, lastName, password } = user;
    if (await UserStore.doesUserExist(id)) {
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
    return UserStore.storedUserToUser(result.rows[0]);
  }

  /**
   * Takes user id and password of an existing user and returns a JWT if
   * credentials are correct. Throws error for incorrect credentials.
   *
   * @param userId user ID of the user
   * @param password plain text password of the user
   *
   * @returns JSON web token
   */
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

  /**
   * Convert the field names of a StoredUser to that of a User.
   *
   * @param storedUser
   * @returns object with converted field names to math User type
   */
  private static storedUserToUser(storedUser: StoredUser): User {
    return {
      id: storedUser.id,
      firstName: storedUser.first_name,
      lastName: storedUser.last_name,
      password: storedUser.password_digest,
    };
  }

  /**
   * Checks if user with the given user ID exists in the database.
   *
   * @param userId user ID to check for
   * @private
   * @returns true if user exists, false otherwise
   */
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
