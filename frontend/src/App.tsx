import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/layout/Layout";
import { Loader2 } from "lucide-react";

/* ── Lazy-loaded Pages (Webiny-inspired code splitting) ── */
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateStore = lazy(() => import("./pages/CreateStore"));
const AIBuilder = lazy(() => import("./pages/AIBuilderOptimized")); // ✅ Optimized version
const StoreControlPanel = lazy(() => import("./pages/StoreControlPanel"));
const EditStore = lazy(() => import("./pages/EditStore"));
const NotFound = lazy(() => import("./pages/NotFound"));

/* ── Loading Spinner ── */
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center animate-pulse-glow">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
        <p className="text-sm text-text-muted animate-pulse">جاري التحميل...</p>
      </div>
    </div>
  );
}

/* ── Route Guards ── */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* صفحات عامة */}
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

          {/* صفحات محمية */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stores/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateStore />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stores/ai-builder"
            element={
              <ProtectedRoute>
                <Layout>
                  <AIBuilder />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stores/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <StoreControlPanel />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stores/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditStore />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
