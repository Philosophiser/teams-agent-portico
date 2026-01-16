const config = {
  // Azure Bot Configuration
  MicrosoftAppId: process.env.CLIENT_ID,
  MicrosoftAppType: process.env.BOT_TYPE,
  MicrosoftAppTenantId: process.env.TENANT_ID,
  MicrosoftAppPassword: process.env.CLIENT_SECRET,

  // OpenAI Configuration
  openAIKey: process.env.OPENAI_API_KEY,
  openAIModelName: process.env.OPENAI_MODEL || "gpt-3.5-turbo",

  // SharePoint Configuration (optional)
  sharePoint: {
    siteUrl: process.env.SHAREPOINT_SITE_URL,
    folderPath: process.env.SHAREPOINT_FOLDER_PATH || "/Shared Documents/KnowledgeBase",
    enabled: !!process.env.SHAREPOINT_SITE_URL,
  },

  // Retrieval Configuration
  retrieval: {
    maxChunkSize: parseInt(process.env.RETRIEVAL_CHUNK_SIZE || "800", 10),
    topK: parseInt(process.env.RETRIEVAL_TOP_K || "3", 10),
    minScore: parseFloat(process.env.RETRIEVAL_MIN_SCORE || "0.1"),
  },
};

export default config;
