import request, { Response } from "supertest";
import app from "../../index";

describe("GET /user initially", (): void => {
  it("should return empty list", async (): Promise<void> => {
    const response: Response = await request(app).get("/user");
    expect(response.body).toEqual([]);
  });
});
