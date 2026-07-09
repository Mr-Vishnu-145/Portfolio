import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Skills from "./pages/Skills";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Certifications from "./pages/Certifications";
import Experience from "./pages/Experience";
import Education from "./pages/Education";
import Achievements from "./pages/Achievements";
import Resume from "./pages/Resume";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

import React, { useEffect } from "react";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { isTursoActive } from "@/lib/turso";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Sync with Turso Cloud DB on mount
    usePortfolioStore.getState().loadFromDb();

    // Poll the database for changes every 5 seconds for real-time updates (only if active)
    const interval = isTursoActive
      ? setInterval(() => {
          usePortfolioStore.getState().loadFromDb();
        }, 5000)
      : undefined;

    // Fallback storage listener for offline/local development when Turso is disabled
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "portfolio_data" && !isTursoActive) {
        usePortfolioStore.getState().load();
        window.dispatchEvent(new Event("portfolioDataUpdate"));
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/admin" element={<Admin />} />
          
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/skills" element={<Layout><Skills /></Layout>} />
          <Route path="/projects" element={<Layout><Projects /></Layout>} />
          <Route path="/projects/:id" element={<Layout><ProjectDetails /></Layout>} />
          <Route path="/certifications" element={<Layout><Certifications /></Layout>} />
          <Route path="/experience" element={<Layout><Experience /></Layout>} />
          <Route path="/education" element={<Layout><Education /></Layout>} />
          <Route path="/achievements" element={<Layout><Achievements /></Layout>} />
          <Route path="/resume" element={<Layout><Resume /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
