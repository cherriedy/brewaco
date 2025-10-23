import express from "express";
const app = express();
const port = process.env.PORT ?? "9001";

app.get("/", (req, res) => {
  res.send("Hello World!");
  console.log("Respond sent!");
});

app.listen(port, () => {
  console.log(`Example application is listening on port ${port}`)
});
