import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClerkAuthProvider } from "@/contexts/ClerkAuthContext";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ClerkDemo } from "@/components/ClerkDemo";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ClerkLogin from "@/pages/ClerkLogin";
import ClerkRegister from "@/pages/ClerkRegister";
import Dashboard from "@/pages/Dashboard";
import Jobs from "@/pages/Jobs";
import JobDetails from "@/pages/JobDetails";
import CreateJob from "@/pages/CreateJob";
import Applications from "@/pages/Applications";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/clerk-login" component={ClerkLogin} />
        <Route path="/clerk-register" component={ClerkRegister} />
        <Route path="/clerk-demo" component={ClerkDemo} />
        
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/jobs" component={Jobs} />
        
        <Route path="/vaga/:id">
          {(params) => <JobDetails params={params} />}
        </Route>
        
        <Route path="/criar-vaga">
          <ProtectedRoute requiredUserType="contratante">
            <CreateJob />
          </ProtectedRoute>
        </Route>
        
        <Route path="/applications">
          <ProtectedRoute requiredUserType="freelancer">
            <Applications />
          </ProtectedRoute>
        </Route>
        
        <Route path="/settings">
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  // Check if we're in Clerk mode based on environment
  const hasValidClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && 
    !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('your_clerk_publishable_key_here') && 
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.startsWith('pk_');

  const AuthProviderComponent = hasValidClerkKey ? ClerkAuthProvider : AuthProvider;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProviderComponent>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProviderComponent>
    </QueryClientProvider>
  );
}

export default App;
