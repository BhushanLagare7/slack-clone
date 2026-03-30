const CONVEX_SITE_URL = process.env.CONVEX_SITE_URL;

if (!CONVEX_SITE_URL) {
  throw new Error("CONVEX_SITE_URL environment variable is required");
}

const authConfig = {
  providers: [
    {
      domain: CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
