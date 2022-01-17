import UserStore, { User } from "../../models/user";

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
      const result: User = await UserStore.create(newUser);
      expect(result.id).toBe(newUser.id);
      expect(result.firstName).toBe(newUser.firstName);
      expect(result.lastName).toBe(newUser.lastName);
      expect(typeof result.password).toBe("string");
    });

    it("should throw error for duplicate user id", async (): Promise<void> => {
      const duplicateUser: User = (await UserStore.index())[0];
      await expectAsync(UserStore.create(duplicateUser)).toBeRejectedWithError(
        UserStore.errorMessages.UserAlreadyExists
      );
    });
  });

  describe("show method", (): void => {
    it("should return details for existing user", async (): Promise<void> => {
      const existingUser: User = (await UserStore.index())[0];
      const result: User = await UserStore.show(existingUser.id);
      expect(result).toEqual(existingUser);
    });

    it("should throw error for non-existing user", async (): Promise<void> => {
      await expectAsync(
        UserStore.show("non_existing_user")
      ).toBeRejectedWithError(UserStore.errorMessages.UserNotFound);
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
      const result = await UserStore.authenticate(user.id, user.password);
      expect(typeof result).toBe("string");
    });

    it("should throw error for incorrect credentials", async () => {
      const existingUser: User = (await UserStore.index())[0];
      await expectAsync(
        UserStore.authenticate("non_existing_user", "random_password")
      ).toBeRejectedWithError(UserStore.errorMessages.UserNotFound);
      await expectAsync(
        UserStore.authenticate(existingUser.id, "wrondpassword")
      ).toBeRejectedWithError(UserStore.errorMessages.IncorrectPassword);
    });
  });
});
