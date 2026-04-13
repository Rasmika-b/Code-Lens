import { Router } from "express";
import { streamReview } from "../services/gemini.js";

export const reviewRouter = Router();

/**
 * POST /api/review
 * Accepts multipart form data:
 *   - code: string (pasted code)
 *   - file: uploaded file (image or code file)
 *   - filename: original filename hint
 *
 * Streams the Gemini response as SSE events, then sends a final "done" event
 * with the fully parsed JSON result.
 */
reviewRouter.post("/", async (req, res) => {
  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendEvent = (type, data) => {
    res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { code, filename } = req.body;
    const file = req.file;

    if (!code && !file) {
      sendEvent("error", { message: "Please paste code or upload a file/screenshot." });
      return res.end();
    }

    sendEvent("status", { message: "Sending to Gemini 1.5 Flash..." });

    const result = await streamReview(
      { code, file, filename: filename || file?.originalname },
      (chunk) => sendEvent("chunk", { text: chunk })
    );

    sendEvent("done", { result });
  } catch (err) {
    console.error("Review error:", err);
    sendEvent("error", {
      message: err.message || "Review failed — check your GEMINI_API_KEY",
    });
  } finally {
    res.end();
  }
});
