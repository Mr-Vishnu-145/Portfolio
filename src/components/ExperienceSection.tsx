import { useState, useEffect } from "react";
import { Briefcase, Calendar, MapPin } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { getPortfolioData, ExperienceData } from "@/lib/portfolioData";
import { Link } from "react-router-dom";

const ExperienceSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [data, setData] = useState<ExperienceData[]>(() => getPortfolioData().experience);

  useEffect(() => {
    const handleUpdate = () => {
      setData(getPortfolioData().experience);
    };
    window.addEventListener("portfolioDataUpdate", handleUpdate);
    return () => window.removeEventListener("portfolioDataUpdate", handleUpdate);
  }, []);

  return (
    <section id="experience" className="py-24 bg-background">
      <div ref={ref} className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-center mb-4">
          Work <span className="text-primary">Experience</span>
        </h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-12" />

        <div className="max-w-3xl mx-auto space-y-8">
          {data.slice(0, 3).map((exp, i) => (
            <div
              key={exp.id || exp.companyName + i}
              className="p-6 rounded-xl border border-border bg-card hover:border-primary transition-all duration-300 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <Briefcase className="text-accent-foreground" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg leading-snug">{exp.role}</h3>
                    <h4 className="text-sm font-semibold text-primary mt-0.5">{exp.companyName}</h4>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 text-xs text-muted-foreground font-mono self-start md:items-end">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {exp.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {exp.location}
                  </span>
                </div>
              </div>
              
              {exp.responsibilities && exp.responsibilities.length > 0 && (
                <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                  {exp.responsibilities[0]}
                </p>
              )}
            </div>
          ))}
        </div>

        {data.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to="/experience"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:border-primary hover:text-primary transition-all"
            >
              View Full Experience Timeline
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExperienceSection;
