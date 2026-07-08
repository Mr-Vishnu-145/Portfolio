import React, { useState, useEffect } from "react";
import { getPortfolioData, AchievementItem } from "@/lib/portfolioData";
import { Award, Zap, Code, Users, ExternalLink, Calendar, Star, Milestone } from "lucide-react";
import { motion } from "framer-motion";

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "award":
      return Award;
    case "hackathon":
      return Zap;
    case "contest":
      return Code;
    case "contribution":
      return Star;
    case "leadership":
    case "volunteer":
    default:
      return Users;
  }
};

const Achievements = () => {
  const [achievements, setAchievements] = useState<AchievementItem[]>(() => getPortfolioData().achievements);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    setAchievements(getPortfolioData().achievements);
    const handleUpdate = () => {
      setAchievements(getPortfolioData().achievements);
    };
    window.addEventListener("portfolioDataUpdate", handleUpdate);
    return () => window.removeEventListener("portfolioDataUpdate", handleUpdate);
  }, []);

  const categories = ["All", "Hackathon", "Contest", "Contribution", "Leadership"];

  const filteredAchievements = achievements.filter(ach => {
    return selectedCategory === "All" || ach.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-3">
          Honors & <span className="text-primary">Achievements</span>
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent-foreground mx-auto rounded-full" />
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Explore my contest rewards, technical competition achievements, coding rankings, and volunteer leadership.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex justify-center flex-wrap gap-2 mb-10 bg-card border border-border p-3 rounded-xl max-w-md mx-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
              selectedCategory === cat
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-background border-border text-muted-foreground hover:text-primary hover:border-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-6"
      >
        {filteredAchievements.map((ach, idx) => {
          const IconComponent = getCategoryIcon(ach.category);
          return (
            <motion.div
              key={ach.id || ach.title + idx}
              variants={itemVariants}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Icon + Date */}
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <IconComponent size={20} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <Calendar size={12} /> {ach.date}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-primary block">
                    {ach.category}
                  </span>
                  <h3 className="text-base font-bold text-foreground font-serif leading-snug mt-1 group-hover:text-primary transition-colors">
                    {ach.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">
                    {ach.organization}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-3">
                    {ach.description}
                  </p>
                </div>
              </div>

              {ach.link && (
                <div className="pt-4 mt-4 border-t border-border/40">
                  <a
                    href={ach.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-primary font-bold hover:underline"
                  >
                    View proof of ranking <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </motion.div>
          );
        })}

        {filteredAchievements.length === 0 && (
          <div className="col-span-full text-center py-16 bg-card border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground text-sm">No items logged under this category.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Achievements;
