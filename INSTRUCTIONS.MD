# AI Model Configuration Instructions

## Implementation Roadmap

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| OpenAI API Integration | ✅ Implemented | - | Core functionality working |
| Teams Integration | ✅ Implemented | - | Message handling, citations working |
| Local Markdown Knowledge Base | ✅ Implemented | - | Loads from `src/data/` |
| Improved Search Algorithm | ✅ Implemented | High | Multi-keyword extraction, scoring |
| Prompt Optimization | ✅ Implemented | High | Enhanced instructions.txt |
| SharePoint Integration | 🔲 Planned | Medium | Requires Azure AD setup |
| Semantic Search/Embeddings | 🔲 Planned | Medium | Future enhancement |

---

## Overview

This project connects to the **OpenAI API directly** (not Azure OpenAI). The integration uses the `@microsoft/teams.openai` package with the standard OpenAI endpoint.

## Configuration Steps

### 1. Obtain an OpenAI API Key

1. Create an account at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to **API Keys** in your account settings
3. Generate a new secret key
4. Copy the key (it will only be displayed once)

### 2. Set the Environment Variable

Add your OpenAI API key to the appropriate environment file:

**For local development (playground mode):**

Create or edit `env/.env.playground.user` and add:

```
SECRET_OPENAI_API_KEY=<your-openai-api-key>
```

**For other environments:**

Set the `OPENAI_API_KEY` environment variable in your deployment configuration.

### 3. Model Configuration

The OpenAI model is configured in `src/config.ts`:

```typescript
openAIModelName: "gpt-3.5-turbo"
```

You can change this to other OpenAI models such as:
- `gpt-4`
- `gpt-4-turbo`
- `gpt-4o`

## Important Notes

- This project uses the **standard OpenAI API**, not Azure OpenAI Service
- Ensure your OpenAI account has sufficient credits/quota
- Keep your API key secure and never commit it to version control

---

## Teams Integration

### Connect to Microsoft Teams

1. Navigate to the [Microsoft Teams Admin Center](https://admin.teams.microsoft.com/)
2. Go to **Teams apps** → **Manage apps**
3. Upload your agent app package (`.zip` file containing `manifest.json`)
4. Configure app permissions and policies as needed
5. Enable the app for your organization or specific users/groups

**For development/testing:**

- Use the Teams Toolkit in VS Code to sideload the app directly
- Run `npm run start` to launch the local development server
- The app will be available in Teams under "Apps" → "Built for your org"

---

## SharePoint Knowledge Base Integration

### Connect Agent to SharePoint Folder

To enable your agent to retrieve knowledge from SharePoint documents:

1. **Register the app in Azure AD:**
   - Go to [Azure Portal](https://portal.azure.com/) → **Azure Active Directory** → **App registrations**
   - Create a new registration or use your existing Teams app registration
   - Add the following API permissions:
     - `Sites.Read.All` (for reading SharePoint content)
     - `Files.Read.All` (for accessing files)

2. **Configure SharePoint site access:**
   - Identify the SharePoint site URL and folder path containing your knowledge base
   - Grant the app access to the specific site or document library

3. **Set environment variables:**

   ```
   SHAREPOINT_SITE_URL=https://yourtenant.sharepoint.com/sites/yoursite
   SHAREPOINT_FOLDER_PATH=/Shared Documents/KnowledgeBase
   ```

4. **Initialize the SharePoint connector** in your agent configuration to index and retrieve documents

---

## Agent Prompt Optimization

### Configure Agent Prompt for Better Knowledge Retrieval

To improve the quality of responses when using knowledge base content:

1. **Structure your system prompt** to prioritize retrieved context:

   ```
   You are a helpful assistant with access to company documentation.
   When answering questions:
   1. First, search the knowledge base for relevant information
   2. Base your answers on the retrieved documents when available
   3. Cite sources when referencing specific documents
   4. If no relevant information is found, clearly state this
   ```

2. **Configure retrieval parameters:**
   - Set appropriate chunk sizes for document splitting (recommended: 500-1000 tokens)
   - Adjust the number of retrieved chunks (top-k) based on context window limits
   - Use semantic search with embeddings for better relevance

3. **Add context instructions** to guide response formatting:
   - Specify how to handle conflicting information
   - Define fallback behavior when knowledge base doesn't contain answers
   - Set tone and verbosity preferences

