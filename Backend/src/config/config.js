import dotenv from 'dotenv';

dotenv.config();

if(!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required in environment variables');
}

if(!process.env.COHERE_API_KEY) {
    throw new Error('COHERE_API_KEY is required in environment variables');
}


export const config = {
    port: process.env.PORT || 3000,
    geminiApiKey: process.env.GEMINI_API_KEY,
    cohereApiKey: process.env.COHERE_API_KEY,
}