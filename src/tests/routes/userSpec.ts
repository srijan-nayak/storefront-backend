import request, { Response } from "supertest";
import app from "../../index";
import { User } from "../../models/user";

describe("GET /user", (): void => {
  it("should return a list of all users", async (): Promise<void> => {
    const response: Response = await request(app).get("/user");
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
