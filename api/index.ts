// import express from "express";
const express = require("express")
const {Application} = require("express")
import Server from "../src/index";
import * as dotenv from "dotenv";
import "reflect-metadata"

dotenv.config();
const app: typeof Application = express();
const server: Server = new Server(app);
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

app
  .listen(PORT, function () {
    console.log(`Server is running on port ${PORT}.`);
  })
  .on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.log("Error: address already in use");
    } else {
      console.log(err);
    }
  });

  export default app;