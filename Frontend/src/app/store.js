/**
 * Redux store — add all feature slices here.
 */
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/state/auth.slice";
import auditReducer from "../features/audit/state/audit.slice";
import ragReducer from "../features/rag/state/rag.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    audit: auditReducer,
    rag: ragReducer,
  },
});

export default store;
