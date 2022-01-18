import pgPool from "../database";
import { QueryResult } from "pg";
import dotenv from "dotenv";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { Result } from "../result";

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
  static readonly errorMessages = {
    UserNotFound: "A user with the given ID doesn't exist",
    InvalidFields: "User to be inserted has incorrect or empty fields",
    UserAlreadyExists: "A user with the given ID already exists",
    IncorrectPassword: "Incorrect password for the given user ID",
  };

  /**
   * Gets a list of all users in the database.
   *
   * @returns list of all users in database
   */
  static async index(): Promise<User[]> {
    const result: QueryResult<StoredUser> = await pgPool.query(
      "select * from users"
    );
    return result.rows.map(UserStore.storedUserToUser);
  }

  /**
   * Gets all user details for a given user ID. Returns an error if user with
   * given ID doesn't exist.
   *
   * @param userId user ID of user whose details are to be shown
   * @returns result object containing either the user details or an error
   */
  static async show(userId: string): Promise<Result<User>> {
    const result: QueryResult<StoredUser> = await pgPool.query(
      "select * from users where id = $1",
      [userId]
    );
    if (!result.rows[0]) {
      return { ok: false, data: Error(UserStore.errorMessages.UserNotFound) };
    }
    return { ok: true, data: UserStore.storedUserToUser(result.rows[0]) };
  }

  /**
   * Create and insert a new user into the database. Throws an error if a user
   * already exists with the same user ID in the database.
   *
   * @param user new user to be created, password field should contain the plain
   * text password
   * @returns result object containing created user, where password field
   * contains the hashed password digest, or an error
   */
  static async create(user: User): Promise<Result<User>> {
    if (!UserStore.isValidUser(user)) {
      return {
        ok: false,
        data: Error(UserStore.errorMessages.InvalidFields),
      };
    }
    const { id, firstName, lastName, password } = user;
    const showResult: Result<User> = await UserStore.show(id);
    if (showResult.ok) {
      return {
        ok: false,
        data: Error(UserStore.errorMessages.UserAlreadyExists),
      };
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
    return { ok: true, data: UserStore.storedUserToUser(result.rows[0]) };
  }

  /**
   * Takes user id and password of an existing user and returns a JWT if
   * credentials are correct. Throws error for incorrect credentials.
   *
   * @param userId user ID of the user
   * @param password plain text password of the user
   *
   * @returns result object containing JSON web token or an error
   */
  static async authenticate(
    userId: string,
    password: PasswordPlainText
  ): Promise<Result<string>> {
    const showResult: Result<User> = await this.show(userId);
    if (!showResult.ok) {
      return {
        ok: false,
        data: showResult.data,
      };
    }
    const user: User = showResult.data;
    const isPasswordCorrect = await compare(
      password + env["PEPPER"],
      user.password
    );
    if (!isPasswordCorrect) {
      return {
        ok: false,
        data: Error(UserStore.errorMessages.IncorrectPassword),
      };
    }
    return { ok: true, data: sign(user, env["JWT_SECRET"] as string) };
  }

  /**
   * Convert the field names of a StoredUser to that of a User.
   *
   * @param storedUser
   * @returns object with converted field names to match User type
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
   * Check if the given object has the shape of a user and fields are not empty.
   *
   * @param object any object
   * @returns boolean value indicating if the given object is a valid user
   */
  private static isValidUser(object: unknown): boolean {
    return (
      (object as User).id !== undefined &&
      (object as User).id !== "" &&
      (object as User).firstName !== undefined &&
      (object as User).firstName !== "" &&
      (object as User).lastName !== undefined &&
      (object as User).lastName !== "" &&
      (object as User).password !== undefined &&
      (object as User).password !== ""
    );
  }
}

export default UserStore;
