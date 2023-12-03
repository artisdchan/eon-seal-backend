import { Application } from "express";
import authRoutes from "./auth.routes";
import configRoutes from "./config.routes";
import crystalRoutes from "./crystal.routes";
import dashboardRoutes from "./dashboard.routes";
import fusionRoutes from "./fusion.routes";
import rankingRoutes from "./ranking.routes";
import storeRoutes from "./store.routes";
import userRoutes from "./user.routes";

export default class Routes {
    constructor(app: Application) {
      app.use("/api/user", userRoutes);
      app.use('/api/auth', authRoutes);
      app.use('/api/store', storeRoutes);
      app.use('/api/fusion', fusionRoutes);
      app.use('/api/shop', crystalRoutes);
      app.use('/api/dashboard', dashboardRoutes);
      app.use('/api/ranking', rankingRoutes);
      app.use('/api/config', configRoutes);
    }
  }