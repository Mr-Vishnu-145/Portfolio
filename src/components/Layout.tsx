import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.3, ease: "easeIn" } }
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathname = location?.pathname || "";
  const pathnames = pathname.split("/").filter((x) => x);
  if (pathnames.length === 0) return null;

  return (
    <div className="container mx-auto px-4 text-xs text-muted-foreground flex items-center gap-1.5 pt-28 pb-4">
      <Link to="/" className="hover:text-primary transition-colors">Home</Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        
        // Format names nicely (e.g., erp-management-system -> ERP Management System or similar)
        let name = value ? value.replace(/-/g, " ") : "";
        if (name.toLowerCase() === "erp") {
          name = "ERP";
        } else {
          name = name ? name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "";
        }

        return (
          <span key={to} className="flex items-center gap-1.5">
            <span className="text-muted-foreground/40">/</span>
            {isLast ? (
              <span className="text-foreground font-medium">{name}</span>
            ) : (
              <Link to={to} className="hover:text-primary transition-colors">{name}</Link>
            )}
          </span>
        );
      })}
    </div>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    
    // Reset scroll progress and window scroll on route change
    setScrollProgress(0);
    window.scrollTo(0, 0);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      {/* Dynamic Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary to-accent-foreground z-50 transition-all duration-100 ease-out" 
        style={{ width: `${scrollProgress}%` }}
      />
      
      <Navbar />

      {/* Main Content with Page-routing transitions */}
      <div className="flex-1 flex flex-col">
        <Breadcrumbs />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className="flex-1 flex flex-col pb-16"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Layout;
