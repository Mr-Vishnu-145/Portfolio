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
import EditProject from "./pages/EditProject";
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

// Full-screen loading spinner shown while waiting for the first DB fetch
const DbLoader = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "hsl(222 47% 7%)",
      zIndex: 9999,
      gap: "1.25rem",
    }}
  >
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        border: "4px solid rgba(34,197,94,0.2)",
        borderTopColor: "#22c55e",
        animation: "spin 0.75s linear infinite",
      }}
    />
    <p style={{ color: "#4ade80", fontFamily: "Inter, sans-serif", fontSize: "0.95rem", margin: 0 }}>
      Loading portfolio…
    </p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const App = () => {
  const isDbLoaded = usePortfolioStore((state) => state.isDbLoaded);

  useEffect(() => {
    // Fetch from Turso DB immediately on mount — this sets isDbLoaded once resolved
    usePortfolioStore.getState().loadFromDb();

    // Poll every 5 seconds so edits in Admin appear live everywhere (only when Turso is active)
    const interval = isTursoActive
      ? setInterval(() => {
          usePortfolioStore.getState().loadFromDb();
        }, 5000)
      : undefined;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Block rendering until the DB has responded at least once
  if (!isDbLoaded) return <DbLoader />;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/edit-project/:id" element={<EditProject />} />

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
