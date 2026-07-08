import React, { useState, useEffect } from "react";
import { getPortfolioData, ExperienceData } from "@/lib/portfolioData";
import { Briefcase, Calendar, MapPin, Award, CheckCircle, Tag, Cpu, Link } from "lucide-react";
import { motion } from "framer-motion";

const Experience = () => {
  const [experienceList, setExperienceList] = useState<ExperienceData[]>(() => getPortfolioData().experience);

  useEffect(() => {
    setExperienceList(getPortfolioData().experience);
    const handleUpdate = () => {
      setExperienceList(getPortfolioData().experience);
    };
    window.addEventListener("portfolioDataUpdate", handleUpdate);
    return () => window.removeEventListener("portfolioDataUpdate", handleUpdate);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-3">
          Professional <span className="text-primary">Experience</span>
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent-foreground mx-auto rounded-full" />
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Take a look at my industry roles, internship assignments, team tasks, and development contributions.
        </p>
      </div>

      {/* Experience Timeline */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative border-l border-border pl-6 md:pl-8 space-y-12 py-4 ml-4"
      >
        {experienceList.map((exp, idx) => (
          <motion.div 
            key={exp.id || exp.companyName + idx} 
            variants={itemVariants}
            className="relative bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-primary transition-all duration-300 space-y-4"
          >
            {/* Timeline indicator node */}
            <div className="absolute -left-[39px] md:-left-[49px] top-6 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-sm">
              <Briefcase className="text-primary" size={12} />
            </div>

            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 border-b border-border/50 pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground font-serif leading-snug">{exp.role}</h3>
                <h4 className="text-sm font-semibold text-primary font-serif mt-0.5">{exp.companyName}</h4>
              </div>
              
              <div className="flex flex-col gap-1 text-xs text-muted-foreground font-mono self-start md:items-end">
                <span className="flex items-center gap-1">
                  <Calendar size={13} /> {exp.duration}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {exp.location}
                </span>
              </div>
            </div>

            {/* Responsibilities */}
            <div>
              <h5 className="text-xs uppercase font-mono font-bold tracking-wider text-muted-foreground mb-2">Key Responsibilities</h5>
              <ul className="space-y-1.5">
                {exp.responsibilities.map((resp, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                    <CheckCircle className="text-primary/75 shrink-0 mt-1" size={13} />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Achievements */}
            {exp.achievements && exp.achievements.length > 0 && (
              <div>
                <h5 className="text-xs uppercase font-mono font-bold tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Award size={14} className="text-primary" /> Key Achievements
                </h5>
                <ul className="space-y-1.5 bg-background/50 border border-border/40 p-4 rounded-xl">
                  {exp.achievements.map((ach, i) => (
                    <li key={i} className="text-xs text-foreground font-medium flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tech stack & Gained skills */}
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground block mb-2">Technologies Used</span>
                <div className="flex flex-wrap gap-1">
                  {exp.technologiesUsed.map(t => (
                    <span key={t} className="px-2 py-0.5 text-[10px] font-mono rounded bg-background text-foreground border border-border">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground block mb-2">Skills Gained</span>
                <div className="flex flex-wrap gap-1">
                  {exp.skillsGained.map(s => (
                    <span key={s} className="px-2 py-0.5 text-[10px] font-mono rounded bg-background text-foreground border border-border">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {experienceList.length === 0 && (
          <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground text-sm">Experience logging has not been populated.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Experience;
