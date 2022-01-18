import UserStore, { User } from "../../models/user";
import { Result } from "../../result";

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
      const duplicateUser: User = (await UserStore.index())[0];
      const createResult: Result<User> = await UserStore.create(duplicateUser);
      expect(createResult.ok).toBe(false);
      const error: Error = createResult.data as Error;
      expect(error.message).toBe(UserStore.errorMessages.UserAlreadyExists);
    });
  });

  describe("show method", (): void => {
    it("should return details for existing user", async (): Promise<void> => {
      const existingUser: User = (await UserStore.index())[0];
      const showResult: Result<User> = await UserStore.show(existingUser.id);
      expect(showResult.ok).toBe(true);
      const user: User = showResult.data as User;
      expect(user).toEqual(existingUser);
    });

    it("should throw error for non-existing user", async (): Promise<void> => {
      const showResult: Result<User> = await UserStore.show(
        "non_existing_user"
      );
      expect(showResult.ok).toBe(false);
      const error: Error = showResult.data as Error;
      expect(error.message).toBe(UserStore.errorMessages.UserNotFound);
    });
  });

  describe("authenticate method", () => {
    it("should return JWT for correct credentials", async (): Promise<void> => {
      const user: User = {
        id: "ayla_meika",
        firstName: "Ayla",
        lastName: "Meika",
        password: "jammetadata",
      };
      await UserStore.create(user);
      const result: Result<string> = await UserStore.authenticate(
        user.id,
        user.password
      );
      expect(result.ok).toBe(true);
      const jwt: string = result.data as string;
      expect(typeof jwt).toBe("string");
    });

    it("should throw error for incorrect credentials", async () => {
      const existingUser: User = (await UserStore.index())[0];
      const authenticateResult1: Result<string> = await UserStore.authenticate(
        "non_existing_user",
        "random_password"
      );
      expect(authenticateResult1.ok).toBe(false);
      const error1: Error = authenticateResult1.data as Error;
      expect(error1.message).toBe(UserStore.errorMessages.UserNotFound);
      const authenticateResult2: Result<string> = await UserStore.authenticate(
        existingUser.id,
        "wrondpassword"
      );
      const error2: Error = authenticateResult2.data as Error;
      expect(error2.message).toBe(UserStore.errorMessages.IncorrectPassword);
    });
  });
});
