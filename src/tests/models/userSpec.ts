import UserStore, { User } from "../../models/user";
import { Result } from "../../result";
import {
  UserAlreadyExistsError,
  UserFieldsIncorrectError,
  UserNotFoundError,
  UserPasswordIncorrectError,
} from "../../errors";

describe("UserStore", (): void => {
  describe("index method", (): void => {
    it("should return a list of all users", async (): Promise<void> => {
      const result: User[] = await UserStore.index();
      expect(result.length).toBeGreaterThan(1);
      for (const user of result) {
        expect(typeof user.id).toBe("string");
        expect(typeof user.firstName).toBe("string");
        expect(typeof user.lastName).toBe("string");
        expect(typeof user.password).toBe("string");
      }
    });
  });

  describe("show method", (): void => {
    it("should return details for existing user", async (): Promise<void> => {
      const showResult: Result<User> = await UserStore.show("april_serra");
      expect(showResult.ok).toBe(true);
      const user: User = showResult.data as User;
      expect(user.id).toBe("april_serra");
      expect(user.firstName).toBe("April");
      expect(user.lastName).toBe("Serra");
      expect(typeof user.password).toBe("string");
    });

    it("should return error for non-existing user", async (): Promise<void> => {
      const showResult: Result<User> = await UserStore.show(
        "non_existing_user"
      );
      expect(showResult.ok).toBe(false);
      expect(showResult.data).toBe(UserNotFoundError);
    });
  });

  describe("create method", (): void => {
    it("should return created user", async (): Promise<void> => {
      const newUser: User = {
        id: "lucerito_lazer",
        firstName: "Lucerito",
        lastName: "Lazer",
        password: "mindcontinually",
      };
      const createResult: Result<User> = await UserStore.create(newUser);
      expect(createResult.ok).toBe(true);
      const user: User = createResult.data as User;
      expect(user.id).toBe(newUser.id);
      expect(user.firstName).toBe(newUser.firstName);
      expect(user.lastName).toBe(newUser.lastName);
      expect(typeof user.password).toBe("string");
    });

    it("should return error for duplicate user id", async (): Promise<void> => {
      const duplicateUser: User = {
        id: "antasia_marjory",
        firstName: "Antasia",
        lastName: "Marjory",
        password: "canadanervous",
      };
      const createResult: Result<User> = await UserStore.create(duplicateUser);
      expect(createResult.ok).toBe(false);
      expect(createResult.data).toBe(UserAlreadyExistsError);
    });

    it("should return error for invalid user data", async (): Promise<void> => {
      const invalidUser1: object = {
        firstName: "Columbus",
        lastName: "Emma",
        password: "subsequentlycohen",
      };
      const createResult1: Result<User> = await UserStore.create(
        invalidUser1 as User
      );
      expect(createResult1.ok).toBe(false);
      expect(createResult1.data).toBe(UserFieldsIncorrectError);

      const invalidUser2: object = {
        id: "nereida_towana",
        firstName: "Nereida",
        lastName: "Towana",
        password: "",
      };
      const createResult2: Result<User> = await UserStore.create(
        invalidUser2 as User
      );
      expect(createResult2.ok).toBe(false);
      expect(createResult2.data).toBe(UserFieldsIncorrectError);
    });
  });

  describe("authenticate method", (): void => {
    it("should return JWT for correct credentials", async (): Promise<void> => {
      const result: Result<string> = await UserStore.authenticate(
        "april_serra",
        "husbandpope"
      );
      expect(result.ok).toBe(true);
      const jwt: string = result.data as string;
      expect(typeof jwt).toBe("string");
    });

    it("should return error for incorrect credentials", async (): Promise<void> => {
      const authenticateResult1: Result<string> = await UserStore.authenticate(
        "non_existing_user",
        "random_password"
      );
      expect(authenticateResult1.ok).toBe(false);
      expect(authenticateResult1.data).toBe(UserNotFoundError);

      const authenticateResult2: Result<string> = await UserStore.authenticate(
        "antasia_marjory",
        "wrongpassword"
      );
      expect(authenticateResult2.ok).toBe(false);
      expect(authenticateResult2.data).toBe(UserPasswordIncorrectError);
    });
  });
});
