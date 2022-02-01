import pgPool from "../database";
import { QueryResult } from "pg";
import dotenv from "dotenv";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { Result } from "../result";
import {
  UserAlreadyExistsError,
  UserFieldsIncorrectError,
  UserNotFoundError,
  UserPasswordIncorrectError,
} from "../errors";

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
  static async index(): Promise<User[]> {
    const queryResult: QueryResult<StoredUser> = await pgPool.query(
      "select * from users"
    );
    const convertedUsers: User[] = queryResult.rows.map(
      UserStore.storedUserToUser
    );
    return convertedUsers;
  }

  static async show(userId: string): Promise<Result<User>> {
    const queryResult: QueryResult<StoredUser> = await pgPool.query(
      "select * from users where id = $1",
      [userId]
    );

    const foundUser: StoredUser | undefined = queryResult.rows[0];
    if (!foundUser) {
      return { ok: false, data: UserNotFoundError };
    }

    const convertedUser: User = UserStore.storedUserToUser(foundUser);
    return { ok: true, data: convertedUser };
  }

  static async create(user: User): Promise<Result<User>> {
    const validateUserResult: Result<User> = await UserStore.validateUser(user);
    if (!validateUserResult.ok) return validateUserResult;

    const validUser: User = validateUserResult.data;
    const { id, firstName, lastName, password: plaintextPassword } = validUser;

    const passwordDigest: string = await hash(
      plaintextPassword + env["PEPPER"],
      parseInt(env["SALT_ROUNDS"] as string)
    );
    const queryResult: QueryResult<StoredUser> = await pgPool.query(
      `insert into users (id, first_name, last_name, password_digest)
       values ($1, $2, $3, $4)
       returning *`,
      [id, firstName, lastName, passwordDigest]
    );

    const createdUser: User = UserStore.storedUserToUser(queryResult.rows[0]);
    return { ok: true, data: createdUser };
  }

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

    const foundUser: User = showResult.data;
    const isPasswordCorrect: boolean = await compare(
      password + env["PEPPER"],
      foundUser.password
    );
    if (!isPasswordCorrect) {
      return {
        ok: false,
        data: UserPasswordIncorrectError,
      };
    }

    const jwt: string = sign(foundUser, env["JWT_SECRET"] as string);
    return { ok: true, data: jwt };
  }

  private static async validateUser(
    user: User | unknown
  ): Promise<Result<User>> {
    if (!UserStore.isUser(user))
      return { ok: false, data: UserFieldsIncorrectError };
    const showResult: Result<User> = await UserStore.show(user.id);
    if (showResult.ok) return { ok: false, data: UserAlreadyExistsError };
    return { ok: true, data: user };
  }

  private static isUser(object: unknown): object is User {
    const id: unknown = (object as User).id;
    const firstName: unknown = (object as User).firstName;
    const lastName: unknown = (object as User).lastName;
    const password: unknown = (object as User).password;

    if (typeof id !== "string" || id === "") return false;
    if (typeof firstName !== "string" || firstName === "") return false;
    if (typeof lastName !== "string" || lastName === "") return false;
    return !(typeof password !== "string" || password === "");
  }

  private static storedUserToUser(storedUser: StoredUser): User {
    return {
      id: storedUser.id,
      firstName: storedUser.first_name,
      lastName: storedUser.last_name,
      password: storedUser.password_digest,
    };
  }
}

export default UserStore;
