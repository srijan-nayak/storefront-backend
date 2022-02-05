import express, { Express, json, Request, Response, urlencoded } from "express";
import cors from "cors";
import { dbErrorHandler } from "./middleware";
import userHandler from "./routes/user";
import productHandler from "./routes/product";
import orderHandler from "./routes/order";
import dotenv from "dotenv";

dotenv.config();
const env = process.env;

const app: Express = express();
const PORT = env["PORT"] || 3000;

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

app.get("/", (_req: Request, res: Response): void => {
  res.json("root endpoint");
});

app.use("/users", userHandler);
app.use("/products", productHandler);
app.use("/orders", orderHandler);

app.use(dbErrorHandler);

if (require.main === module) {
  app.listen(PORT, (): void =>
    console.log(`Server is listening on port ${PORT}`)
  );
}

export default app;
