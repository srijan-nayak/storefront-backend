import pgPool from "../database";

describe("Postgres pool", () => {
  it("should be able to execute simple query", async () => {
    const result = await pgPool.query("select $1::text as message", ["test"]);
    expect(result.rows[0]).toEqual({ message: "test" });
  });
});
