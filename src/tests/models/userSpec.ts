import UserStore, { User } from "../../models/user";

describe("UserStore", (): void => {
  describe("index method", (): void => {
    it("should initially return empty result set", async (): Promise<void> => {
      const result: User[] = await UserStore.index();
      expect(result).toEqual([]);
    });
  });
});
