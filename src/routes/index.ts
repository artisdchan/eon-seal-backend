import { application, Application } from "express";
import authRoutes from "./auth.routes";
import registerRoutes from "./register.routes";

export default class Routes {
    constructor(app: Application) {
      app.use("/api/user", registerRoutes);
      app.use('/api/auth', authRoutes)
    }
  }