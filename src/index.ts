import express, { Express, json, Request, Response, urlencoded } from "express";
import cors from "cors";
import { dbErrorHandler } from "./middleware";
import userHandler from "./routes/user";
import productHandler from "./routes/product";
import orderHandler from "./routes/order";

const app: Express = express();
const PORT = 3000;

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

app.get("/", (_req: Request, res: Response): void => {
  res.json("root endpoint");
});

app.use("/user", userHandler);
app.use("/product", productHandler);
app.use("/order", orderHandler);

app.use(dbErrorHandler);

if (require.main === module) {
  app.listen(PORT, (): void =>
    console.log(`Server is listening on port ${PORT}`)
  );
}

export default app;
