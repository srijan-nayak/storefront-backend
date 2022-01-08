import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (_req, res) => {
  res.json("root endpoint");
});

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
