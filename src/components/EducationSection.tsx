import { useState, useEffect } from "react";
import { GraduationCap, Calendar, Award } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { getPortfolioData, EducationData } from "@/lib/portfolioData";
import { Link } from "react-router-dom";

const EducationSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [data, setData] = useState<EducationData[]>(() => getPortfolioData().education);

  useEffect(() => {
    const handleUpdate = () => {
      setData(getPortfolioData().education);
    };
    window.addEventListener("portfolioDataUpdate", handleUpdate);
    return () => window.removeEventListener("portfolioDataUpdate", handleUpdate);
  }, []);

  return (
    <section id="education" className="py-24 bg-card">
      <div ref={ref} className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-center mb-4">
          Education <span className="text-primary">History</span>
        </h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-12" />

        <div className="max-w-3xl mx-auto space-y-8">
          {data.slice(0, 2).map((edu, i) => (
            <div
              key={edu.id || edu.college + i}
              className="p-6 rounded-xl border border-border bg-background hover:border-primary transition-all duration-300 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <GraduationCap className="text-accent-foreground" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg leading-snug">{edu.degree}</h3>
                    <p className="text-sm text-primary font-medium mt-0.5">{edu.department}</p>
                    <p className="text-xs text-muted-foreground mt-1">{edu.college}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground font-mono self-start md:items-end">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {edu.duration}
                  </span>
                  <span className="flex items-center gap-1 text-primary font-semibold">
                    <Award size={12} /> CGPA: {edu.cgpa}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to="/education"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:border-primary hover:text-primary transition-all"
            >
              View Full Education Details
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default EducationSection;
