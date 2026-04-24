/**
 * RAG Service — Proxy to the Python ML RAG engine.
 *
 * Forwards user questions + optional audit context to the FastAPI
 * RAG endpoint and returns structured compliance answers.
 */

const ML_BASE_URL = process.env.ML_BASE_URL || 'http://localhost:8000';

/**
 * Query the RAG compliance agent.
 *
 * @param {string} question - The user's question
 * @param {string|null} auditContext - JSON string of latest audit data
 * @param {Array|null} chatHistory - Previous messages [{role, content}]
 * @returns {Promise<object>} - { answer, sources, follow_up_questions }
 */
export const queryRAG = async (question, auditContext = null, chatHistory = null) => {
    const payload = {
        question,
        audit_context: auditContext,
        chat_history: chatHistory,
    };

    const response = await fetch(`${ML_BASE_URL}/api/v1/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`RAG query failed (${response.status}): ${errorBody}`);
    }

    return response.json();
};

/**
 * Initialize the RAG engine (pre-load knowledge base).
 */
export const initializeRAG = async () => {
    try {
        const response = await fetch(`${ML_BASE_URL}/api/v1/rag/initialize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            console.warn('[rag.service] RAG initialization failed:', response.status);
            return { status: 'error', message: 'RAG initialization failed' };
        }

        const result = await response.json();
        console.log(`[rag.service] RAG engine initialized: ${result.chunks_loaded} chunks loaded`);
        return result;
    } catch (error) {
        console.warn('[rag.service] Could not reach ML service for RAG init:', error.message);
        return { status: 'error', message: error.message };
    }
};
