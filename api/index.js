import app from "../server/app.js";

// Vercel Serverless Function entry point
export const config = {
  runtime: "nodejs18.x",
};

export default app;
