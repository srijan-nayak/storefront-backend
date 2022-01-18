import express, { Express, Request, Response } from "express";
import userHandler from "./routes/user";
import { dbErrorHandler } from "./middleware";

const app: Express = express();
const PORT = 3000;

app.get("/", (_req: Request, res: Response): void => {
  res.json("root endpoint");
});

app.use("/user", userHandler);

app.use(dbErrorHandler);

if (require.main === module) {
  app.listen(PORT, (): void =>
    console.log(`Server is listening on port ${PORT}`)
  );
}

export default app;
