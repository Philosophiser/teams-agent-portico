# AI Model Configuration Instructions

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
