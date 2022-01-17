import request, { Response } from "supertest";
import app from "../../index";
import UserStore, { User } from "../../models/user";

describe("GET /user", (): void => {
  it("should return a list of all users", async (): Promise<void> => {
    const response: Response = await request(app).get("/user");
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

describe("GET /user/:id", (): void => {
  it("should return details for existing user", async (): Promise<void> => {
    const existingUser: User = (await UserStore.index())[0];
    const response: Response = await request(app).get(
      `/user/${existingUser.id}`
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual(existingUser);
  });

  it("should return error for non-existing user", async (): Promise<void> => {
    const response: Response = await request(app).get("/user/some_user");
    expect(response.status).toBe(404);
    expect(response.body).toBe(
      `Error: ${UserStore.errorMessages.UserNotFound}`
    );
  });
});
