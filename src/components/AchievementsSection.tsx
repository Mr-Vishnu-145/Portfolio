import { useState, useEffect } from "react";
import { Trophy, Calendar, ExternalLink } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { getPortfolioData, AchievementItem } from "@/lib/portfolioData";
import { Link } from "react-router-dom";

const AchievementsSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [data, setData] = useState<AchievementItem[]>(() => getPortfolioData().achievements);

  useEffect(() => {
    const handleUpdate = () => {
      setData(getPortfolioData().achievements);
    };
    window.addEventListener("portfolioDataUpdate", handleUpdate);
    return () => window.removeEventListener("portfolioDataUpdate", handleUpdate);
  }, []);

  return (
    <section id="achievements" className="py-24 bg-background">
      <div ref={ref} className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-center mb-4">
          Key <span className="text-primary">Achievements</span>
        </h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-12" />

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {data.slice(0, 4).map((ach, i) => (
            <div
              key={ach.id || ach.title + i}
              className="p-6 rounded-xl border border-border bg-card hover:border-primary transition-all duration-300 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <Trophy className="text-accent-foreground" size={20} />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                    {ach.category}
                  </span>
                </div>
                
                <h3 className="font-bold text-foreground text-base mb-1">{ach.title}</h3>
                <p className="text-xs text-primary font-medium mb-3">{ach.organization}</p>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              <div className="flex justify-between items-center mt-5 pt-3 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {ach.date}
                </span>
                {ach.link && (
                  <a
                    href={ach.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-0.5 text-primary hover:underline font-semibold"
                  >
                    Details <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {data.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to="/achievements"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:border-primary hover:text-primary transition-all"
            >
              View All Achievements
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default AchievementsSection;
