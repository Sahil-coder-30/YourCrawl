/**
 * RAG Agent — Redux Slice
 *
 * Manages the chat state for the compliance Q&A assistant.
 */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../services/api";

// ── Async Thunks ────────────────────────────────────────────────────

export const sendRagQuery = createAsyncThunk(
  "rag/sendQuery",
  async ({ question, reportId, chatHistory }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/rag/query", {
        question,
        reportId,
        chatHistory,
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || error.message || "Failed to get answer"
      );
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────

const ragSlice = createSlice({
  name: "rag",
  initialState: {
    messages: [], // [{role: 'user'|'assistant', content: '', sources: [], followUps: []}]
    isOpen: false,
    isLoading: false,
    error: null,
    activeReportId: null, // The audit report to use as context
  },
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    openChat: (state) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    setActiveReport: (state, action) => {
      state.activeReportId = action.payload;
    },
    addUserMessage: (state, action) => {
      state.messages.push({
        role: "user",
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendRagQuery.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendRagQuery.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push({
          role: "assistant",
          content: action.payload.answer,
          sources: action.payload.sources || [],
          followUps: action.payload.follow_up_questions || [],
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendRagQuery.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Something went wrong";
        state.messages.push({
          role: "assistant",
          content:
            "I apologize, but I encountered an error processing your question. Please try again.",
          sources: [],
          followUps: ["Can you rephrase your question?"],
          timestamp: new Date().toISOString(),
          isError: true,
        });
      });
  },
});

export const {
  toggleChat,
  openChat,
  closeChat,
  setActiveReport,
  addUserMessage,
  clearMessages,
  clearError,
} = ragSlice.actions;

export default ragSlice.reducer;
