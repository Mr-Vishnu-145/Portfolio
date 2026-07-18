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

// Synchronously apply theme class on load to prevent white flash
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("theme");
  const isDark = saved ? saved === "dark" : true; // Default to dark mode
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

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
      background: "hsl(var(--background))",
      zIndex: 9999,
      gap: "2.5rem",
    }}
  >
    {/* Logo with pulse glow animation */}
    <img
      src={`${import.meta.env.BASE_URL}favicon.ico`}
      alt="Logo"
      style={{
        width: 72,
        height: 72,
        objectFit: "contain",
        animation: "pulseGlow 2.5s ease-in-out infinite",
      }}
    />

    {/* Down Logo Loader */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
      {/* Sleek rotating loader */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "2px solid hsl(var(--primary) / 0.15)",
          borderTopColor: "hsl(var(--primary))",
          animation: "spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite",
        }}
      />
      {/* Glowing modern text */}
      <p
        style={{
          color: "hsl(var(--primary))",
          fontFamily: "Inter, sans-serif",
          fontSize: "0.85rem",
          fontWeight: 500,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          margin: 0,
          opacity: 0.8,
          animation: "shimmer 1.5s ease-in-out infinite alternate",
        }}
      >
        Loading
      </p>
    </div>

    <style>{`
      @keyframes spin { 
        to { transform: rotate(360deg); } 
      }
      @keyframes pulseGlow {
        0%, 100% {
          transform: scale(1);
          filter: drop-shadow(0 0 10px hsl(var(--primary) / 0.25));
        }
        50% {
          transform: scale(1.08);
          filter: drop-shadow(0 0 25px hsl(var(--primary) / 0.65));
        }
      }
      @keyframes shimmer {
        from { opacity: 0.5; }
        to { opacity: 1; text-shadow: 0 0 8px hsl(var(--primary) / 0.4); }
      }
    `}</style>
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
