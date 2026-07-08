import React, { useState, useEffect } from "react";
import { getPortfolioData, EducationData } from "@/lib/portfolioData";
import { GraduationCap, Calendar, Award, BookOpen, Layers, Users } from "lucide-react";
import { motion } from "framer-motion";

const Education = () => {
  const [educationList, setEducationList] = useState<EducationData[]>(() => getPortfolioData().education);

  useEffect(() => {
    setEducationList(getPortfolioData().education);
    const handleUpdate = () => {
      setEducationList(getPortfolioData().education);
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
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-3">
          Academic <span className="text-primary">Background</span>
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent-foreground mx-auto rounded-full" />
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Review my institutional education records, coursework distributions, and technical academic achievements.
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
      >
        {educationList.map((edu, idx) => (
          <motion.div 
            key={edu.id || edu.college + idx} 
            variants={itemVariants}
            className="bg-card border border-border p-6 md:p-8 rounded-2xl shadow-sm hover:border-primary transition-all duration-300 space-y-6"
          >
            {/* Header banner */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border/50 pb-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-primary shrink-0">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground font-serif leading-snug">{edu.college}</h2>
                  <p className="text-sm font-semibold text-primary mt-0.5">{edu.degree} — {edu.department}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 text-xs text-muted-foreground font-mono self-start md:items-end">
                <span className="flex items-center gap-1 font-bold">
                  <Calendar size={13} /> {edu.duration}
                </span>
                <span className="text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full mt-1">
                  CGPA: {edu.cgpa}
                </span>
              </div>
            </div>

            {/* Coursework & Subdetails */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Coursework */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold font-serif text-foreground flex items-center gap-2">
                  <BookOpen size={16} className="text-primary" /> Relevant Coursework
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {edu.relevantCoursework.map(course => (
                    <div key={course} className="p-2.5 rounded-lg bg-background border border-border text-xs text-muted-foreground leading-snug">
                      {course}
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects & Certs */}
              <div className="space-y-6">
                {/* Academic projects */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold font-serif text-foreground flex items-center gap-2">
                    <Layers size={16} className="text-primary" /> Core Projects Built
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {edu.projects.map(proj => (
                      <span key={proj} className="px-3 py-1 text-xs rounded-full bg-background border border-border text-foreground font-medium">
                        {proj}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold font-serif text-foreground flex items-center gap-2">
                    <Award size={16} className="text-primary" /> Academic Achievements
                  </h3>
                  <ul className="space-y-1.5">
                    {edu.achievements.map((ach, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Activities & Extra curriculars */}
            <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground flex items-center gap-1">
                  <Users size={12} /> Campus Activities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {edu.activities.map(act => (
                    <span key={act} className="px-2.5 py-0.5 text-[10px] rounded bg-background text-foreground border border-border font-medium">
                      {act}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground flex items-center gap-1">
                  <Award size={12} /> Earned Certifications
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {edu.certificates.map(cert => (
                    <span key={cert} className="px-2.5 py-0.5 text-[10px] rounded bg-background text-foreground border border-border font-medium">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {educationList.length === 0 && (
          <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground text-sm">Academic logs have not been populated.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Education;
