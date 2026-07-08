import { useState, useEffect } from "react";
import { Mail, Phone, Github, Linkedin } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { getPortfolioData, HeroData } from "@/lib/portfolioData";

const ContactSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [data, setData] = useState<HeroData>(() => getPortfolioData().hero);

  useEffect(() => {
    const handleUpdate = () => {
      setData(getPortfolioData().hero);
    };
    window.addEventListener("portfolioDataUpdate", handleUpdate);
    return () => window.removeEventListener("portfolioDataUpdate", handleUpdate);
  }, []);

  const contactItems = [
    { 
      icon: Mail, 
      label: "Email", 
      value: data.email || "Not Provided", 
      href: `mailto:${data.email}`, 
      show: !!data.email 
    },
    { 
      icon: Phone, 
      label: "Phone", 
      value: data.phone || "Not Provided", 
      href: `tel:${data.phone ? data.phone.replace(/[^+\d]/g, "") : ""}`, 
      show: !!data.phone 
    },
    { 
      icon: Github, 
      label: "GitHub", 
      value: data.github ? data.github.replace(/https?:\/\/(www\.)?github\.com\//, "").replace(/\/$/, "") : "Not Provided", 
      href: data.github, 
      show: !!data.github 
    },
    { 
      icon: Linkedin, 
      label: "LinkedIn", 
      value: data.linkedin ? data.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, "").replace(/\/$/, "") : "Not Provided", 
      href: data.linkedin, 
      show: !!data.linkedin 
    },
  ].filter(item => item.show);

  return (
    <section id="contact" className="py-24 bg-card">
      <div ref={ref} className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h2 className={`text-3xl md:text-4xl font-bold font-serif text-center mb-4 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          Get In <span className="text-primary">Touch</span>
        </h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-12" />

        <div className="max-w-2xl mx-auto grid sm:grid-cols-2 gap-6">
          {contactItems.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`flex items-center gap-4 p-5 rounded-xl border border-border bg-background hover:border-primary transition-all duration-500 hover:-translate-y-1 group ${isVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <item.icon size={20} className="text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.value}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
