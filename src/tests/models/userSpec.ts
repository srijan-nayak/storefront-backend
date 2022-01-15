import UserStore, { User } from "../../models/user";

describe("UserStore", (): void => {
  describe("index method", (): void => {
    it("should initially return empty result set", async (): Promise<void> => {
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
    });
  });
});
