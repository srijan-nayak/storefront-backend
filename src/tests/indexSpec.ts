import app from "../index";
import request from "supertest";

describe("GET /", () => {
  it("should respond with 'root endpoint'", async () => {
    try {
      const response = await request(app).get("/");
      expect(response.body).toBe("root endpoint");
    } catch (error) {
      console.error("Error: Couldn't GET /");
      console.error(error);
    }
  });
});
