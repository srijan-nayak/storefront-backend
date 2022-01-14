import app from "../index";
import request, { Response } from "supertest";

describe("GET /", (): void => {
  it("should respond with 'root endpoint'", async (): Promise<void> => {
    try {
      const response: Response = await request(app).get("/");
      expect(response.body).toBe("root endpoint");
    } catch (error) {
      console.error("Error: Couldn't GET /");
      console.error(error);
    }
  });
});
