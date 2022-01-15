import UserStore, { User } from "../../models/user";

describe("UserStore", (): void => {
  const storedUsers: User[] = [];

  describe("index method initially", (): void => {
    it("should return empty result set", async (): Promise<void> => {
      const result: User[] = await UserStore.index();
      expect(result).toEqual([]);
    });
  });

  describe("show method", (): void => {
    it("should initially throw error", async (): Promise<void> => {
      const userId = 1;
      await expectAsync(UserStore.show(userId)).toBeRejectedWithError(
        `User with ID ${userId} doesn't exist`
      );
    });
  });

  describe("create method", (): void => {
    it("should return created user", async (): Promise<void> => {
      const result: User = await UserStore.create({
        firstName: "Antasia",
        lastName: "Marjory",
        password: "scenariofallen",
      });
      expect(result.id).toBeDefined();
      expect(result.firstName).toBe("Antasia");
      expect(result.lastName).toBe("Marjory");
      expect(typeof result.password).toBe("string");
      storedUsers.push(result);
    });
  });

  describe("index method after some data insertion", (): void => {
    it("should return a list of all users", async (): Promise<void> => {
      storedUsers.push(
        await UserStore.create({
          firstName: "April",
          lastName: "Serra",
          password: "husbandpope",
        })
      );
      const result: User[] = await UserStore.index();
      expect(result).toEqual(storedUsers);
    });
  });
});
