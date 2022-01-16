import UserStore, {
  StoredUser,
  storedUserToUser,
  User,
} from "../../models/user";

describe("storedUserToUser", () => {
  it("should convert a StoredUser to a User", () => {
    const storedUser: StoredUser = {
      id: "bryn_latifah",
      first_name: "Bryn",
      last_name: "Latifah",
      password_digest:
        "$2b$10$kN9am5Im5ZpsjYJ4Lud2OuTwp.VE8VTSvfOoD986L5jm6XzQ6PrEu",
    };
    const user: User = storedUserToUser(storedUser);
    expect(user.id).toBe(storedUser.id);
    expect(user.firstName).toBe(storedUser.first_name);
    expect(user.lastName).toBe(storedUser.last_name);
    expect(user.password).toBe(storedUser.password_digest);
  });
});

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

  describe("show method", (): void => {
    it("should initially throw error", async (): Promise<void> => {
      const userId = "some_user";
      await expectAsync(UserStore.show(userId)).toBeRejectedWithError(
        `User with ID ${userId} doesn't exist`
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
      const userId = "non_existing_user";
      await expectAsync(UserStore.show(userId)).toBeRejectedWithError(
        `User with ID ${userId} doesn't exist`
      );
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
      const incorrectUserId = "non_existing_user";
      await expectAsync(
        UserStore.authenticate(incorrectUserId, "random_password")
      ).toBeRejectedWithError(`User with ID ${incorrectUserId} doesn't exist`);
      await expectAsync(
        UserStore.authenticate(sampleUsers[1].id, "wrondpassword")
      ).toBeRejectedWithError(
        `Incorrect password for user ${sampleUsers[1].id}`
      );
    });
  });
});
