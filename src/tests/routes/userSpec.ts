import request, { Response } from "supertest";
import app from "../../index";
import UserStore, { User } from "../../models/user";
import { AuthorizationError } from "../../middleware";
import { Result } from "../../result";

export const getValidToken = async (): Promise<string> => {
  const authorizedUser: User = {
    id: "authorized_user",
    firstName: "Authorized",
    lastName: "User",
    password: "domesticsig",
  };
  await UserStore.create(authorizedUser);
  const authenticateResult: Result<string> = await UserStore.authenticate(
    authorizedUser.id,
    authorizedUser.password
  );
  if (!authenticateResult.ok) {
    throw Error("Couldn't generate valid token");
  }
  return authenticateResult.data;
};

describe("GET /user", (): void => {
  it("should return error without valid token", async (): Promise<void> => {
    const response: Response = await request(app).get("/user");
    expect(response.status).toBe(401);
    expect(response.body).toBe(AuthorizationError.toString());
  });

  it("should return a list of all users", async (): Promise<void> => {
    const validToken: string = await getValidToken();
    const response: Response = await request(app)
      .get("/user")
      .auth(validToken, { type: "bearer" });
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
  it("should return error without valid token", async (): Promise<void> => {
    const existingUser: User = (await UserStore.index())[0];
    const response: Response = await request(app).get(
      `/user/${existingUser.id}`
    );
    expect(response.status).toBe(401);
    expect(response.body).toBe(AuthorizationError.toString());
  });

  it("should return details for existing user", async (): Promise<void> => {
    const validToken: string = await getValidToken();
    const existingUser: User = (await UserStore.index())[0];
    const response: Response = await request(app)
      .get(`/user/${existingUser.id}`)
      .auth(validToken, { type: "bearer" });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(existingUser);
  });

  it("should return error for non-existing user", async (): Promise<void> => {
    const validToken: string = await getValidToken();
    const response: Response = await request(app)
      .get("/user/some_user")
      .auth(validToken, { type: "bearer" });
    expect(response.status).toBe(404);
    expect(response.body).toBe(
      `Error: ${UserStore.errorMessages.UserNotFound}`
    );
  });
});

describe("POST /user", (): void => {
  it("should return created user", async (): Promise<void> => {
    const newUser: User = {
      id: "lucerito_lazer",
      firstName: "Lucerito",
      lastName: "Lazer",
      password: "mindcontinually",
    };
    const response: Response = await request(app).post("/user").send(newUser);
    expect(response.status).toBe(200);
    const user: User = response.body;
    expect(user.id).toBe(newUser.id);
    expect(user.firstName).toBe(newUser.firstName);
    expect(user.lastName).toBe(newUser.lastName);
    expect(typeof user.password).toBe("string");
  });

  it("should return error for duplicate user id", async (): Promise<void> => {
    const duplicateUser: User = (await UserStore.index())[0];
    const response: Response = await request(app)
      .post("/user")
      .send(duplicateUser);
    expect(response.status).toBe(409);
    expect(response.body).toBe(
      `Error: ${UserStore.errorMessages.UserAlreadyExists}`
    );
  });

  it("should return error for invalid user data", async (): Promise<void> => {
    const invalidUser1: User = {
      firstName: "Columbus",
      lastName: "Emma",
      password: "subsequentlycohen",
    } as User;
    const response1: Response = await request(app)
      .post("/user")
      .send(invalidUser1);
    expect(response1.status).toBe(422);
    expect(response1.body).toBe(
      `Error: ${UserStore.errorMessages.InvalidFields}`
    );

    const invalidUser2: User = {
      id: "nereida_towana",
      firstName: "Nereida",
      lastName: "Towana",
      password: "",
    };
    const response2: Response = await request(app)
      .post("/user")
      .send(invalidUser2);
    expect(response2.status).toBe(422);
    expect(response2.body).toBe(
      `Error: ${UserStore.errorMessages.InvalidFields}`
    );
  });
});

describe("POST /user/authenticate", (): void => {
  it("should return JWT for correct credentials", async (): Promise<void> => {
    const user: User = {
      id: "ayla_meika",
      firstName: "Ayla",
      lastName: "Meika",
      password: "jammetadata",
    };
    await UserStore.create(user);
    const response: Response = await request(app)
      .post("/user/authenticate")
      .send({ id: user.id, password: user.password });
    expect(response.status).toBe(200);
    const jwt: string = response.body;
    expect(typeof jwt).toBe("string");
  });

  it("should return error for incorrect credentials", async () => {
    const response1: Response = await request(app)
      .post("/user/authenticate")
      .send({ id: "non_existing_user", password: "randompassword" });
    expect(response1.status).toBe(404);
    expect(response1.body).toBe(
      `Error: ${UserStore.errorMessages.UserNotFound}`
    );

    const existingUser: User = (await UserStore.index())[0];
    const response2: Response = await request(app)
      .post("/user/authenticate")
      .send({ id: existingUser.id, password: "wrondpassword" });
    expect(response2.status).toBe(401);
    expect(response2.body).toBe(
      `Error: ${UserStore.errorMessages.IncorrectPassword}`
    );
  });
});
