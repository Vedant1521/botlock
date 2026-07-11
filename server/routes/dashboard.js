/**
 * dashboard.js
 *
 * Serves the static dashboard.html page to publishers logging in to monitor analytics.
 */

import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dashboardHtmlPath = path.join(__dirname, "../../client/dashboard.html");

router.get("/", (_req, res) => {
  res.sendFile(dashboardHtmlPath);
});

export default router;
