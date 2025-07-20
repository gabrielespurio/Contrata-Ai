import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SimpleClerkAuthProvider } from "@/contexts/SimpleClerkAuthContext";
import { ClerkErrorBoundary } from "@/components/ClerkErrorBoundary";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ClerkDemo } from "@/components/ClerkDemo";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/Onboarding";
import ProfileSetup from "@/pages/ProfileSetup";
import Home from "@/pages/Home";
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
        <Route path="/login" component={ClerkLogin} />
        <Route path="/register" component={ClerkRegister} />
        <Route path="/clerk-login" component={ClerkLogin} />
        <Route path="/clerk-register" component={ClerkRegister} />
        <Route path="/clerk-demo" component={ClerkDemo} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/profile-setup" component={ProfileSetup} />
        
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
  // Use Clerk authentication only
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkErrorBoundary>
        <SimpleClerkAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </SimpleClerkAuthProvider>
      </ClerkErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
