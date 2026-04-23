/**
 * ProtectedRoute — redirects to /login if not authenticated.
 * Runs getMeThunk on mount to rehydrate session from httpOnly cookie.
 */
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMeThunk, selectIsAuthenticated, selectAuthLoading } from "../../features/auth/state/auth.slice";
import AvaranaLogo from "../../components/common/AvaranaLogo/AvaranaLogo";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading("getMe"));
  const [hasTried, setHasTried] = React.useState(false);

  useEffect(() => {
    // If not authenticated, attempt to fetch user on mount
    if (!isAuthenticated) {
      dispatch(getMeThunk()).finally(() => {
        setHasTried(true);
      });
    } else {
      setHasTried(true);
    }
  }, [dispatch, isAuthenticated]);

  if (loading || !hasTried) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050310",
        }}
      >
        <AvaranaLogo size={64} showName={true} showSub={true} inline={false} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
