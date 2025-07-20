import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";
import { ThemeProvider } from "@/components/ThemeProvider";

// Pages
import Home from "@/pages/Home";
import CategoryPage from "@/pages/CategoryPage";
import ToolPage from "@/pages/ToolPage";
import SearchPage from "@/pages/SearchPage";
import NewsPage from "@/pages/NewsPage";
import BlogPage from "@/pages/BlogPage";
import SubmitPage from "@/pages/SubmitPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";
import ToolsPage from "@/pages/ToolsPage";

function Router() {
  useAnalytics();

  return (
    <Switch>
      {/* ✅ Show Home for everyone */}
      <Route path="/" component={Home} />

      {/* ✅ Authenticated-only routes */}
      <Route path="/profile" component={ProfilePage} />
      <Route path="/admin" component={AdminDashboard} />

      {/* ✅ Public routes */}
      <Route path="/tools" component={ToolsPage} />
      <Route path="/tools/:slug" component={ToolPage} /> {/* FIXED */}
      <Route path="/category/:category" component={CategoryPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/news" component={NewsPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPage} />
      <Route path="/submit" component={SubmitPage} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn("Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID");
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
