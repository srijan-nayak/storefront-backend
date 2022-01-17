import UserStore, { User } from "../../models/user";
import pgPool from "../../database";

describe("UserStore", (): void => {
  const storedUsers: User[] = [];
  const sampleUsers: User[] = [
    {
      id: "antasia_marjory",
      firstName: "Antasia",
      lastName: "Marjory",
      password: "scenariofallen",
    },
    {
      id: "april_serra",
      firstName: "April",
      lastName: "Serra",
      password: "husbandpope",
    },
  ];

  describe("index method initially", (): void => {
    it("should return empty result set", async (): Promise<void> => {
      const result: User[] = await UserStore.index();
      expect(result).toEqual([]);
    });
  });

  describe("show method initially", (): void => {
    it("should throw error", async (): Promise<void> => {
      await expectAsync(UserStore.show("some_user")).toBeRejectedWithError(
        UserStore.errorMessages.UserNotFound
      );
    });
  });

  describe("create method", (): void => {
    it("should return created user", async (): Promise<void> => {
      const result: User = await UserStore.create(sampleUsers[0]);
      expect(result.id).toBe(sampleUsers[0].id);
      expect(result.firstName).toBe(sampleUsers[0].firstName);
      expect(result.lastName).toBe(sampleUsers[0].lastName);
      expect(typeof result.password).toBe("string");
      storedUsers.push(result);
    });

    it("should throw error for duplicate user id", async (): Promise<void> => {
      const duplicateUser = sampleUsers[0];
      await expectAsync(UserStore.create(duplicateUser)).toBeRejectedWithError(
        UserStore.errorMessages.UserAlreadyExists
      );
    });
  });

  describe("index method after some data insertion", (): void => {
    it("should return a list of all users", async (): Promise<void> => {
      storedUsers.push(await UserStore.create(sampleUsers[1]));
      const result: User[] = await UserStore.index();
      expect(result).toEqual(storedUsers);
    });
  });

  describe("show method after some data insertion", (): void => {
    it("should return details for existing user", async (): Promise<void> => {
      const user: User = storedUsers.slice(-1)[0];
      const result: User = await UserStore.show(user.id);
      expect(result).toEqual(user);
    });

    it("should throw error for non-existing user", async (): Promise<void> => {
      await expectAsync(
        UserStore.show("non_existing_user")
      ).toBeRejectedWithError(UserStore.errorMessages.UserNotFound);
    });
  });

  describe("authenticate method", () => {
    it("should return JWT for correct credentials", async (): Promise<void> => {
      const result = await UserStore.authenticate(
        sampleUsers[0].id,
        sampleUsers[0].password
      );
      expect(typeof result).toBe("string");
    });

    it("should throw error for incorrect credentials", async () => {
      await expectAsync(
        UserStore.authenticate("non_existing_user", "random_password")
      ).toBeRejectedWithError(UserStore.errorMessages.UserNotFound);
      await expectAsync(
        UserStore.authenticate(sampleUsers[1].id, "wrondpassword")
      ).toBeRejectedWithError(UserStore.errorMessages.IncorrectPassword);
    });
  });

  afterAll(async (): Promise<void> => {
    // clear users table for user handlers testing
    await pgPool.query("delete from users");
  });
});
