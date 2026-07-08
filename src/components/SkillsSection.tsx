import { useState, useEffect } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { getPortfolioData, SkillCategory } from "@/lib/portfolioData";

const SkillsSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [categories, setCategories] = useState<SkillCategory[]>(() => getPortfolioData().skills);

  useEffect(() => {
    const handleUpdate = () => {
      setCategories(getPortfolioData().skills);
    };
    window.addEventListener("portfolioDataUpdate", handleUpdate);
    return () => window.removeEventListener("portfolioDataUpdate", handleUpdate);
  }, []);

  return (
    <section id="skills" className="py-24">
      <div ref={ref} className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h2 className={`text-3xl md:text-4xl font-bold font-serif text-center mb-4 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          Technical <span className="text-primary">Skills</span>
        </h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-12" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {categories.map((cat, i) => (
            <div
              key={cat.title}
              className={`p-6 rounded-xl border border-border bg-card hover:border-primary transition-all duration-500 hover:shadow-lg ${isVisible ? "animate-scale-in" : "opacity-0"}`}
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <h3 className="font-semibold text-foreground mb-4 text-lg">{cat.title}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-accent text-accent-foreground border border-border hover:border-primary hover:scale-105 transition-all duration-300 cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
