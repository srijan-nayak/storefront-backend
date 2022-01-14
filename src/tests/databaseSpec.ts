import pgPool from "../database";
import { QueryResult } from "pg";

describe("Postgres pool", (): void => {
  it("should be able to execute simple query", async (): Promise<void> => {
    try {
      const result: QueryResult<{ message: string }> = await pgPool.query(
        "select $1::text as message",
        ["test"]
      );
      expect(result.rows[0]).toEqual({ message: "test" });
    } catch (error) {
      console.error("Error: Couldn't execute query successfully");
      console.error(error);
    }
  });
});
