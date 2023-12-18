import { Application } from "express";
import authRoutes from "./auth.routes";
import configRoutes from "./config.routes";
import crystalRoutes from "./crystal.routes";
import dashboardRoutes from "./dashboard.routes";
import fusionRoutes from "./fusion.routes";
import itemRoutes from "./item.routes";
import marketRoutes from "./market.routes";
import packageRoutes from "./package.routes";
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
      app.use('/api/item', itemRoutes)
      app.use('/api/credit', packageRoutes)
      app.use('/api/market', marketRoutes)
    }
  }