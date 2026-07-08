import { useState, useEffect } from "react";
import { GraduationCap, Code, Briefcase } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { getPortfolioData, AboutData } from "@/lib/portfolioData";

const AboutSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [data, setData] = useState<AboutData>(() => getPortfolioData().about);

  useEffect(() => {
    const handleUpdate = () => {
      setData(getPortfolioData().about);
    };
    window.addEventListener("portfolioDataUpdate", handleUpdate);
    return () => window.removeEventListener("portfolioDataUpdate", handleUpdate);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "education":
        return GraduationCap;
      case "focus":
        return Code;
      case "lookingFor":
      default:
        return Briefcase;
    }
  };

  return (
    <section id="about" className="py-24 bg-card">
      <div ref={ref} className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h2 className={`text-3xl md:text-4xl font-bold font-serif text-center mb-4 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          About <span className="text-primary">Me</span>
        </h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-12" />

        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className={`text-muted-foreground text-lg leading-relaxed ${isVisible ? "animate-fade-up" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
            {data.bio}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {data.highlights.map((item, i) => {
            const IconComponent = getIcon(item.iconType);
            return (
              <div
                key={item.title}
                className={`p-6 rounded-xl border border-border bg-background hover:border-primary transition-all duration-500 hover:-translate-y-2 group ${isVisible ? "animate-fade-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.3 + i * 0.15}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <IconComponent className="text-accent-foreground" size={24} />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm whitespace-pre-line">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
