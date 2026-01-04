// src/lib/openai.ts
import OpenAI from 'openai';

// Utility wrapper to create OpenAI client with provided apiKey
export const createOpenAIClient = (apiKey: string) => {
  return new OpenAI({ apiKey });
};

// For non-hook usage, use createOpenAIClient
export default createOpenAIClient;
