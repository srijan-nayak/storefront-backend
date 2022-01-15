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
});
