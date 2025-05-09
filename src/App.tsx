import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Topics from "./pages/Topics";
import TopicDetails from "./pages/TopicDetails";
import Tags from "./pages/Tags";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <Index />
              </AuthGuard>
            }
          />
          <Route
            path="/topics"
            element={
              <AuthGuard>
                <Topics />
              </AuthGuard>
            }
          />
          <Route
            path="/topics/:id"
            element={
              <AuthGuard>
                <TopicDetails />
              </AuthGuard>
            }
          />
          <Route
            path="/tags"
            element={
              <AuthGuard>
                <Tags />
              </AuthGuard>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;