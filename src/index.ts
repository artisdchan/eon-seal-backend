import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import passport from "passport";
import Routes from "./routes";
import session from "express-session";
import "./service/passport.service";
import "reflect-metadata"
import { SealMemberDataSource } from "./data-source";
import cookieParser from "cookie-parser";

export default class Server {

  constructor(app: Application) {
    this.config(app);
    new Routes(app);
    SealMemberDataSource.initialize()
    .then(() => {
        console.log("seal_member Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })
  }

  private config(app: Application): void {

    const corsOptions: CorsOptions = {
      origin: "*",
    };

    // app.set("view engine", "ejs");
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    // Adding required middlewares
    app.use(
      session({
        secret: "askduhakdnkbiygvhbad7a6s*&^*S^D8asdbk",
        resave: false,
        saveUninitialized: false,
      })
    );

    // app.use(passport.authenticate("session"));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static('public'));

  }
}
