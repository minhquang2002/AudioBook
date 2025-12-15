import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AllBooks from "./pages/AllBooks";
import BookDetail from "./pages/BookDetail";
import BookInCategory from "./pages/BookInCategory";
import TTS from "./pages/TTS";
import ITS from "./pages/ITS";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import MyAudio from "./pages/MyAudio";
import ListenHistory from "./pages/ListenHistory";
import Listen from "./pages/Listen";
import SearchResults from "./pages/SearchResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/books" element={<AllBooks />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/category/:id" element={<BookInCategory />} />
            <Route path="/listen/:id" element={<Listen />} />
            <Route path="/tts" element={<TTS />} />
            <Route path="/its" element={<ITS />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-audio" element={<MyAudio />} />
            <Route path="/history" element={<ListenHistory />} />
            <Route path="/search" element={<SearchResults />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
