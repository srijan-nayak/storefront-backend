import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (_req, res) => {
  res.json("root endpoint");
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
}

export default app;
