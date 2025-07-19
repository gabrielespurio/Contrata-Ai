import { createRoot } from "react-dom/client";
import { ClerkProvider } from '@clerk/clerk-react';
import App from "./App";
import "./index.css";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if we have real Clerk credentials
const hasValidClerkKey = PUBLISHABLE_KEY && 
  !PUBLISHABLE_KEY.includes('your_clerk_publishable_key_here') && 
  PUBLISHABLE_KEY.startsWith('pk_');

if (!hasValidClerkKey) {
  console.warn("No valid Clerk key found - showing demo mode");
}

// Conditionally render with or without Clerk based on valid key
if (hasValidClerkKey) {
  createRoot(document.getElementById("root")!).render(
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  );
} else {
  // Use existing auth system if Clerk is not configured
  createRoot(document.getElementById("root")!).render(<App />);
}
