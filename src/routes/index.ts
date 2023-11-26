import { Application } from "express";
import authRoutes from "./auth.routes";
import crystalRoutes from "./crystal.routes";
import fusionRoutes from "./fusion.routes";
import storeRoutes from "./store.routes";
import userRoutes from "./user.routes";

export default class Routes {
    constructor(app: Application) {
      app.use("/api/user", userRoutes);
      app.use('/api/auth', authRoutes);
      app.use('/api/store', storeRoutes);
      app.use('/api/fusion', fusionRoutes);
      app.use('/api/crystal-shop', crystalRoutes);
    }
  }