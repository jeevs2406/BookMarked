import { FastifyInstance } from "fastify";

import {
  getReadingPlan,
  deleteReadingPlan,
  calculateReadingPlan,
  saveReadingPlan,
} from "../services/readingPlan";

import type {
  CalculateReadingPlanRequest,
  SaveReadingPlanRequest,
} from "../types/readingPlan";

export async function readingPlanRoutes(app: FastifyInstance) {
  // Get the user's saved reading plan
  app.get("/api/reading-plan", async () => {
    console.log("Not calculating");
    return getReadingPlan();
  });

  // Calculate a reading plan without saving it
  app.post("/api/reading-plan/calculate", async (req) => {
    const body = req.body as CalculateReadingPlanRequest;
    console.log("Calculating...");
    return calculateReadingPlan(body);
  });

  // Save the calculated reading plan
  app.put("/api/reading-plan", async (req) => {
    const body = req.body as SaveReadingPlanRequest;
    console.log("Not calculating");
    return saveReadingPlan(body);
  });

  // Delete the user's saved reading plan
  app.delete("/api/reading-plan", async () => {
    console.log("Not calculating");
    await deleteReadingPlan();

    return { success: true };
  });
}
