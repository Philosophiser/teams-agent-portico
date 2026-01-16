# CLAUDE.MD

This file provides guidance for Claude Code when working with this repository.

## Project Overview

This is a Microsoft Teams AI Agent application that implements a RAG (Retrieval Augmented Generation) chatbot. It answers questions using custom data sources loaded from markdown files, with responses generated via OpenAI.

## Tech Stack

- **Runtime**: Node.js 20 or 22
- **Language**: TypeScript
- **Framework**: Microsoft Teams SDK v2 (`@microsoft/teams.apps`, `@microsoft/teams.ai`, `@microsoft/teams.openai`)
- **AI Model**: OpenAI GPT-3.5-turbo (configurable in `src/config.ts`)
- **Authentication**: Azure Managed Identity (`@azure/identity`)

## Project Structure

```
src/
├── index.ts              # Application entry point
├── config.ts             # Environment configuration (OpenAI, SharePoint, retrieval)
├── app/
│   ├── app.ts            # Main application logic and message handling
│   ├── myDataSource.ts   # RAG data source with chunking and keyword search
│   ├── sharePointDataSource.ts  # SharePoint integration (foundation)
│   └── instructions.txt  # AI prompt instructions
└── data/                 # Markdown files used as knowledge base
    └── *.md              # Company knowledge documents

appPackage/               # Teams app manifest and icons
env/                      # Environment files (.env.dev, .env.playground)
infra/                    # Azure Bicep templates for deployment
```

## Common Commands

```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run in Teams Playground
npm run dev:teamsfx:testtool
```

## Configuration

Environment variables (set in `env/.env.*` files or `.localConfigs`):

**Required:**
- `CLIENT_ID` - Azure App Client ID
- `CLIENT_SECRET` - Azure App Secret
- `TENANT_ID` - Azure Tenant ID
- `BOT_TYPE` - Microsoft App Type (e.g., "UserAssignedMsi")
- `OPENAI_API_KEY` - OpenAI API key
- `PORT` - Server port (default: 3978)

**Optional - OpenAI:**
- `OPENAI_MODEL` - Model name (default: "gpt-3.5-turbo")

**Optional - SharePoint Integration:**
- `SHAREPOINT_SITE_URL` - SharePoint site URL (enables SharePoint if set)
- `SHAREPOINT_FOLDER_PATH` - Document folder path (default: "/Shared Documents/KnowledgeBase")

**Optional - Retrieval Tuning:**
- `RETRIEVAL_CHUNK_SIZE` - Max tokens per chunk (default: 800)
- `RETRIEVAL_TOP_K` - Number of results to return (default: 3)
- `RETRIEVAL_MIN_SCORE` - Minimum relevance score (default: 0.1)

## Architecture Notes

1. **Message Flow**: Messages arrive via Teams → `app.on('message')` in `app.ts` → Query data source → Build prompt with context → Send to OpenAI → Parse JSON response → Return with citations

2. **Data Source**: `MyDataSource` class loads all `.md` files from `src/data/` at startup, chunks them for efficient retrieval, and provides relevance-scored keyword search

3. **Search Algorithm**: Extracts keywords from queries, scores document chunks by keyword frequency and coverage, returns top-k results above minimum score threshold

4. **Response Format**: The AI returns JSON with citations that get rendered as Teams message citations

5. **Storage**: Uses `LocalStorage` for conversation history (keyed by conversation+user ID)

6. **Optional Integrations**:
   - **SharePoint**: Foundation for loading documents from SharePoint folders (requires Azure AD setup)

## Development Notes

- The build step copies `instructions.txt` and `data/` to `lib/` directory
- Instructions file defines the AI persona and JSON response format
- Add new knowledge by placing `.md` files in `src/data/`
- Modify AI behavior by editing `src/app/instructions.txt`
