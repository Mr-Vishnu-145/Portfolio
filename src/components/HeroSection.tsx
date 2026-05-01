import { ArrowDown, Github, Linkedin, Mail, Download } from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";
import { useState, useEffect } from "react";

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
  const { displayed: name, done: nameDone } = useTypingEffect("Vishnu ", 100, 800);
  const { displayed: lastName, done: lastDone } = useTypingEffect("V", 100, 1500);

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
          <span className="text-primary">{lastName}</span>
          {!lastDone && (
            <span className="inline-block w-[3px] h-[0.8em] bg-primary ml-1 animate-pulse align-middle" />
          )}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0.6s" }}>
          Java / Full-Stack Developer — Building clean, scalable web applications with React.js, Spring Boot & more.
        </p>

        {/* Social links */}
        <div className="flex items-center justify-center gap-4 mb-10 animate-fade-up opacity-0" style={{ animationDelay: "0.8s" }}>
          <a
            href="https://github.com/Mr-Vishnu-145/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full border border-border bg-card/50 text-foreground hover:text-primary hover:border-primary transition-all duration-300 hover:scale-110"
          >
            <Github size={20} />
          </a>
          <a
            href="https://www.linkedin.com/in/vishnu145/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-full border border-border bg-card/50 text-foreground hover:text-primary hover:border-primary transition-all duration-300 hover:scale-110"
          >
            <Linkedin size={20} />
          </a>
          <a
            href="mailto:Vishnuvenkat014@gmail.com"
            className="p-3 rounded-full border border-border bg-card/50 text-foreground hover:text-primary hover:border-primary transition-all duration-300 hover:scale-110"
          >
            <Mail size={20} />
          </a>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up opacity-0" style={{ animationDelay: "1s" }}>
          <a href="#projects" className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all duration-1000 animate-glow-pulse">
            View Projects
          </a>
          <a
            href="/resume.pdf"
            download="Vishnu_Resume.pdf"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border border-border text-foreground font-semibold hover:border-primary hover:text-primary transition-all duration-300 cursor-pointer"
          >
            <Download size={18} />
            Download Resume
          </a>
          <a href="#contact" className="px-8 py-3 rounded-lg border border-border text-foreground font-semibold hover:border-primary hover:text-primary transition-all duration-300">
            Get In Touch
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#about" className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float text-muted-foreground hover:text-primary transition-colors">
        <ArrowDown size={24} />
      </a>
    </section>
  );
};

export default HeroSection;
