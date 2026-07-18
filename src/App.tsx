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
      background: "radial-gradient(circle at center, #0B1528 0%, #030712 100%)",
      zIndex: 9999,
      gap: "2.5rem",
    }}
  >
    {/* Logo Container with glassmorphism, glow and pulse animation */}
    <div
      style={{
        position: "relative",
        width: 84,
        height: 84,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "20px",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 20px rgba(34, 197, 94, 0.1)",
        backdropFilter: "blur(8px)",
        animation: "pulseGlow 2.5s ease-in-out infinite",
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}favicon.ico`}
        alt="Logo"
        style={{
          width: 52,
          height: 52,
          objectFit: "contain",
        }}
      />
    </div>

    {/* Down Logo Loader */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
      {/* Sleek rotating loader */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "2px solid rgba(34,197,94,0.1)",
          borderTopColor: "#22c55e",
          animation: "spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite",
        }}
      />
      {/* Glowing modern text */}
      <p
        style={{
          color: "#22c55e",
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
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 20px rgba(34, 197, 94, 0.1);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 30px rgba(34, 197, 94, 0.25);
        }
      }
      @keyframes shimmer {
        from { opacity: 0.5; }
        to { opacity: 1; text-shadow: 0 0 8px rgba(34, 197, 94, 0.5); }
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
