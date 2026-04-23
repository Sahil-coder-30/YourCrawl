/**
 * Redux store — add all feature slices here.
 */
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/state/auth.slice";
import auditReducer from "../features/audit/state/audit.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    audit: auditReducer,
  },
});

export default store;
