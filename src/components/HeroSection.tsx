import { ArrowDown, Github, Linkedin, Mail, Download } from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";
import { useState, useEffect } from "react";
import { getPortfolioData, HeroData } from "@/lib/portfolioData";
import { Link } from "react-router-dom";

const useTypingEffect = (text: string, speed = 80, delay = 600) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayed, done };
};

const HeroSection = () => {
  const [data, setData] = useState<HeroData>(() => getPortfolioData().hero);

  useEffect(() => {
    const handleUpdate = () => {
      setData(getPortfolioData().hero);
    };
    window.addEventListener("portfolioDataUpdate", handleUpdate);
    return () => window.removeEventListener("portfolioDataUpdate", handleUpdate);
  }, []);

  const { displayed: name, done: nameDone } = useTypingEffect(data.name.trim(), 100, 800);
  const { displayed: lastName, done: lastDone } = useTypingEffect(data.lastName.trim(), 100, 1500);

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
      // Fallback
      const fallbackLink = document.createElement("a");
      fallbackLink.href = `${import.meta.env.BASE_URL}resume.pdf`;
      fallbackLink.setAttribute("download", "Vishnu_Resume.pdf");
      fallbackLink.click();
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <AnimatedBackground />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <p className="text-primary font-mono text-sm md:text-base mb-4 animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
          Hello, I'm
        </p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-serif text-foreground mb-4 min-h-[1.2em]">
          {name}
          {nameDone && "\u00A0"}
          <span className="text-primary">{lastName}</span>
          {!lastDone && (
            <span className="inline-block w-[3px] h-[0.8em] bg-primary ml-1 animate-pulse align-middle" />
          )}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0.6s" }}>
          {data.description}
        </p>

        {/* Social links */}
        <div className="flex items-center justify-center gap-4 mb-10 animate-fade-up opacity-0" style={{ animationDelay: "0.8s" }}>
          {data.github && (
            <a
              href={data.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full border border-border bg-card/50 text-foreground hover:text-primary hover:border-primary transition-all duration-300 hover:scale-110"
            >
              <Github size={20} />
            </a>
          )}
          {data.linkedin && (
            <a
              href={data.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full border border-border bg-card/50 text-foreground hover:text-primary hover:border-primary transition-all duration-300 hover:scale-110"
            >
              <Linkedin size={20} />
            </a>
          )}
          {data.email && (
            <a
              href={`mailto:${data.email}`}
              className="p-3 rounded-full border border-border bg-card/50 text-foreground hover:text-primary hover:border-primary transition-all duration-300 hover:scale-110"
            >
              <Mail size={20} />
            </a>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up opacity-0" style={{ animationDelay: "1s" }}>
          <Link to="/projects" className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all duration-1000 animate-glow-pulse">
            View Projects
          </Link>
          <a
            href={`${import.meta.env.BASE_URL}resume.pdf`}
            download="Vishnu_Resume.pdf"
            onClick={handleDownloadResume}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border border-border text-foreground font-semibold hover:border-primary hover:text-primary transition-all duration-300 cursor-pointer"
          >
            <Download size={18} />
            Download Resume
          </a>
          <Link to="/contact" className="px-8 py-3 rounded-lg border border-border text-foreground font-semibold hover:border-primary hover:text-primary transition-all duration-300">
            Get In Touch
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <Link to="/about" className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float text-muted-foreground hover:text-primary transition-colors">
        <ArrowDown size={24} />
      </Link>
    </section>
  );
};

export default HeroSection;
