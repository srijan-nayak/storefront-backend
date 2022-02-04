import request, { Response } from "supertest";
import app from "../../index";
import { User } from "../../models/user";
import {
  AuthorizationError,
  httpStatus,
  UserAlreadyExistsError,
  UserFieldsIncorrectError,
  UserNotFoundError,
  UserPasswordIncorrectError,
} from "../../errors";
import { sign } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const env = process.env;

export const validToken: string = sign("auth", env["JWT_SECRET"] as string);

describe("User handler endpoint", (): void => {
  describe("GET /users", (): void => {
    it("should return error without valid token", async (): Promise<void> => {
      const response: Response = await request(app).get("/users");
      expect(response.status).toBe(httpStatus(AuthorizationError));
      expect(response.body).toBe(AuthorizationError.toString());
    });

    it("should return a list of all users", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/users")
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(200);
      const users: User[] = response.body;
      expect(users.length).toBeGreaterThan(1);
      for (const user of users) {
        expect(typeof user.id).toBe("string");
        expect(typeof user.firstName).toBe("string");
        expect(typeof user.lastName).toBe("string");
        expect(typeof user.password).toBe("string");
      }
    });
  });

  describe("GET /users/:userId", (): void => {
    it("should return error without valid token", async (): Promise<void> => {
      const response: Response = await request(app).get(
        "/users/antasia_marjory"
      );
      expect(response.status).toBe(httpStatus(AuthorizationError));
      expect(response.body).toBe(AuthorizationError.toString());
    });

    it("should return details for existing user", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/users/antasia_marjory")
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(200);
      const user: User = response.body;
      expect(user.id).toBe("antasia_marjory");
      expect(user.firstName).toBe("Antasia");
      expect(user.lastName).toBe("Marjory");
      expect(typeof user.password).toBe("string");
    });

    it("should return error for non-existing user", async (): Promise<void> => {
      const response: Response = await request(app)
        .get("/users/some_user")
        .auth(validToken, { type: "bearer" });
      expect(response.status).toBe(httpStatus(UserNotFoundError));
      expect(response.body).toBe(UserNotFoundError.toString());
    });
  });

  describe("POST /users", (): void => {
    it("should return created user", async (): Promise<void> => {
      const newUser: User = {
        id: "lucerito_lazer",
        firstName: "Lucerito",
        lastName: "Lazer",
        password: "mindcontinually",
      };
      const response: Response = await request(app)
        .post("/users")
        .send(newUser);
      expect(response.status).toBe(200);
      const user: User = response.body;
      expect(user.id).toBe(newUser.id);
      expect(user.firstName).toBe(newUser.firstName);
      expect(user.lastName).toBe(newUser.lastName);
      expect(typeof user.password).toBe("string");
    });

    it("should return error for duplicate user id", async (): Promise<void> => {
      const duplicateUser: User = {
        id: "april_serra",
        firstName: "April",
        lastName: "Serra",
        password: "husbandpope",
      };
      const response: Response = await request(app)
        .post("/users")
        .send(duplicateUser);
      expect(response.status).toBe(httpStatus(UserAlreadyExistsError));
      expect(response.body).toBe(UserAlreadyExistsError.toString());
    });

    it("should return error for invalid user data", async (): Promise<void> => {
      const invalidUser1: object = {
        firstName: "Columbus",
        lastName: "Emma",
        password: "subsequentlycohen",
      };
      const response1: Response = await request(app)
        .post("/users")
        .send(invalidUser1);
      expect(response1.status).toBe(httpStatus(UserFieldsIncorrectError));
      expect(response1.body).toBe(UserFieldsIncorrectError.toString());

      const invalidUser2: object = {
        id: "nereida_towana",
        firstName: "Nereida",
        lastName: "Towana",
        password: "",
      };
      const response2: Response = await request(app)
        .post("/users")
        .send(invalidUser2);
      expect(response2.status).toBe(httpStatus(UserFieldsIncorrectError));
      expect(response2.body).toBe(UserFieldsIncorrectError.toString());
    });
  });

  describe("POST /users/authenticate", (): void => {
    it("should return JWT for correct credentials", async (): Promise<void> => {
      const response: Response = await request(app)
        .post("/users/authenticate")
        .send({ id: "antasia_marjory", password: "scenariofallen" });
      expect(response.status).toBe(200);
      const jwt: string = response.body;
      expect(typeof jwt).toBe("string");
    });

    it("should return error for incorrect credentials", async (): Promise<void> => {
      const response1: Response = await request(app)
        .post("/users/authenticate")
        .send({ id: "non_existing_user", password: "randompassword" });
      expect(response1.status).toBe(httpStatus(UserNotFoundError));
      expect(response1.body).toBe(UserNotFoundError.toString());

      const response2: Response = await request(app)
        .post("/users/authenticate")
        .send({ id: "april_serra", password: "wrondpassword" });
      expect(response2.status).toBe(httpStatus(UserPasswordIncorrectError));
      expect(response2.body).toBe(UserPasswordIncorrectError.toString());
    });
  });
});
