import { useState, useCallback } from "react";

export function useGitHub() {
  const [prs, setPrs] = useState([]);
  const [loadingPrs, setLoadingPrs] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchPrs = useCallback(async (owner, repo) => {
    setLoadingPrs(true);
    setError(null);
    setPrs([]);
    try {
      const res = await fetch(`/api/github/prs?owner=${owner}&repo=${repo}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch PRs");
      setPrs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPrs(false);
    }
  }, []);

  const postComment = useCallback(async ({ owner, repo, pull_number, review, filename }) => {
    setPosting(true);
    setPostResult(null);
    setError(null);
    try {
      const res = await fetch("/api/github/pr-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, pull_number, review, filename }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");
      setPostResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setPosting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPrs([]);
    setPostResult(null);
    setError(null);
  }, []);

  return { prs, loadingPrs, posting, postResult, error, fetchPrs, postComment, reset };
}
