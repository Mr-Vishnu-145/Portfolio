import { useState, useEffect, useRef } from "react";
import { Menu, X, Sun, Moon, Download, ChevronDown } from "lucide-react";
import { NavLink, Link } from "react-router-dom";

const primaryLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Skills", href: "/skills" },
  { label: "Projects", href: "/projects" },
  { label: "Certifications", href: "/certifications" },
  { label: "Contact", href: "/contact" },
];

const secondaryLinks = [
  { label: "Experience", href: "/experience" },
  { label: "Education", href: "/education" },
  { label: "Achievements", href: "/achievements" },
  { label: "Resume", href: "/resume" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return true; // default to dark mode
    }
    return true;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadResume = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}resume.pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Vishnu_Resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download resume:", error);
      const fallbackLink = document.createElement("a");
      fallbackLink.href = `${import.meta.env.BASE_URL}resume.pdf`;
      fallbackLink.setAttribute("download", "Vishnu_Resume.pdf");
      fallbackLink.click();
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-card/90 backdrop-blur-md shadow-lg border-b border-border py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={`${import.meta.env.BASE_URL}favicon.ico`}
            alt="Logo"
            className="w-10 h-10 rounded-lg object-contain"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden lg:flex items-center gap-7">
          {primaryLinks.map((link) => (
            <li key={link.href}>
              <NavLink
                to={link.href}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-all duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 ${
                    isActive
                      ? "text-primary after:w-full"
                      : "text-muted-foreground hover:text-primary after:w-0 hover:after:w-full"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}

          {/* More Dropdown */}
          <li className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1 text-sm font-semibold transition-all duration-300 ${
                dropdownOpen || secondaryLinks.some(l => window.location.pathname.endsWith(l.href))
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              More
              <ChevronDown size={14} className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-44 rounded-xl border border-border bg-card shadow-lg p-2 animate-fade-in z-50">
                {secondaryLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    onClick={() => setDropdownOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-lg text-xs font-semibold hover:bg-accent hover:text-primary transition-all ${
                        isActive ? "text-primary bg-accent/50" : "text-muted-foreground"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
          </li>
        </ul>

        {/* CTA & Theme Button */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="p-2.5 rounded-xl border border-border text-foreground hover:text-primary hover:border-primary transition-all duration-300 bg-background/50"
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
          <Link
            to="/resume"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-foreground font-semibold text-xs hover:border-primary hover:text-primary transition-all bg-background/50"
          >
            <Download size={14} />
            Resume
          </Link>
          
          <Link
            to="/contact"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-95 transition-opacity shadow-sm"
          >
            Hire Me
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-xl border border-border text-foreground hover:text-primary transition-all bg-background/50"
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            className="p-2 text-foreground rounded-xl border border-border bg-background/50 hover:text-primary transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-card/95 backdrop-blur-md border-t border-border mt-3 animate-fade-in">
          <ul className="flex flex-col items-center gap-4 py-6 text-sm">
            {/* Primary & Secondary unified */}
            {[...primaryLinks, ...secondaryLinks].map((link) => (
              <li key={link.href} className="w-full text-center">
                <NavLink
                  to={link.href}
                  className={({ isActive }) =>
                    `block py-2 font-semibold transition-all ${
                      isActive ? "text-primary text-base" : "text-muted-foreground hover:text-primary"
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            
            <li className="pt-4 border-t border-border w-1/2 flex justify-center gap-3">
              <a
                href={`${import.meta.env.BASE_URL}resume.pdf`}
                download="Vishnu_Resume.pdf"
                onClick={(e) => {
                  setMobileOpen(false);
                  handleDownloadResume(e);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-foreground font-semibold text-xs bg-background"
              >
                <Download size={13} /> PDF
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-xs"
                onClick={() => setMobileOpen(false)}
              >
                Hire Me
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
