import { Router } from "express";
import { githubTools, formatReviewAsMarkdown } from "../mcp/github.js";

export const githubRouter = Router();

githubRouter.post("/pr-comment", async (req, res) => {
  try {
    const { owner, repo, pull_number, review, filename } = req.body;

    if (!owner || !repo || !pull_number || !review) {
      return res.status(400).json({ error: "Missing required fields: owner, repo, pull_number, review" });
    }

    if (!process.env.GITHUB_TOKEN) {
      return res.status(503).json({ error: "GITHUB_TOKEN not configured on server" });
    }

    const body = formatReviewAsMarkdown(review, { filename });
    const result = await githubTools.create_pr_review_comment({ owner, repo, pull_number, body });
    res.json(result);
  } catch (err) {
    console.error("GitHub PR comment error:", err);
    res.status(500).json({ error: err.message });
  }
});

githubRouter.get("/prs", async (req, res) => {
  try {
    const { owner, repo } = req.query;
    if (!owner || !repo) return res.status(400).json({ error: "owner and repo required" });
    const prs = await githubTools.list_pull_requests({ owner, repo });
    res.json(prs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

githubRouter.get("/validate", async (req, res) => {
  try {
    const { owner, repo } = req.query;
    if (!owner || !repo) return res.status(400).json({ error: "owner and repo required" });
    const result = await githubTools.validate_repo({ owner, repo });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});