import express, { Express, json, Request, Response, urlencoded } from "express";
import userHandler from "./routes/user";
import { dbErrorHandler } from "./middleware";
import cors from "cors";
import productHandler from "./routes/product";

const app: Express = express();
const PORT = 3000;

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

app.get("/", (_req: Request, res: Response): void => {
  res.json("root endpoint");
});

app.use("/product", productHandler);
app.use("/user", userHandler);

app.use(dbErrorHandler);

if (require.main === module) {
  app.listen(PORT, (): void =>
    console.log(`Server is listening on port ${PORT}`)
  );
}

export default app;
