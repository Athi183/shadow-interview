// Responsibility: centralize deploy-time URLs for the Chrome extension.
// For local development, keep the localhost defaults below.
// For production/demo, replace these with your Render and Vercel URLs.

globalThis.ShadowInterview = globalThis.ShadowInterview || {};

globalThis.ShadowInterview.config = {
  apiBaseUrl: "https://shadow-interview-api.onrender.com",
  workspaceUrl: "https://shadow-interview.vercel.app/evaluation",
};
