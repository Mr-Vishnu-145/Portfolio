import React, { useState, useEffect } from "react";
import { getPortfolioData, SkillCategory, SkillItem } from "@/lib/portfolioData";
import { Search, Database, Code, ShieldCheck, Terminal, Cpu, Settings, Cloud } from "lucide-react";
import { motion } from "framer-motion";

const getCategoryIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("language")) return Terminal;
  if (t.includes("front")) return Code;
  if (t.includes("back") || t.includes("db") || t.includes("database")) return Database;
  if (t.includes("tool") || t.includes("devops")) return Settings;
  if (t.includes("cloud")) return Cloud;
  return Cpu;
};

const getSkillIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n === "java" || n === "javascript" || n === "python" || n === "c") return Code;
  if (n.includes("db") || n.includes("sql") || n.includes("mongo")) return Database;
  if (n.includes("aws") || n.includes("cloud")) return Cloud;
  if (n.includes("test")) return ShieldCheck;
  return Terminal;
};

const Skills = () => {
  const [categories, setCategories] = useState<SkillCategory[]>(() => getPortfolioData().skills);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setCategories(getPortfolioData().skills);
    const handleUpdate = () => {
      setCategories(getPortfolioData().skills);
    };
    window.addEventListener("portfolioDataUpdate", handleUpdate);
    return () => window.removeEventListener("portfolioDataUpdate", handleUpdate);
  }, []);

  // Normalize skill categories into a flat list of skills with their categories for search/filtering
  const allSkills: (SkillItem & { category: string })[] = [];
  categories.forEach(cat => {
    const title = cat.title;
    if (cat.skillItems && cat.skillItems.length > 0) {
      cat.skillItems.forEach(item => {
        allSkills.push({ ...item, category: title });
      });
    } else {
      // Fallback for custom entries added through Admin panel
      cat.skills.forEach(skill => {
        allSkills.push({
          name: skill,
          level: "Intermediate",
          percentage: 75,
          description: `Practical application of ${skill} in engineering laboratory works and project designs.`,
          usedInProjects: [],
          category: title
        });
      });
    }
  });

  // Unique categories for filter tags
  const filterCategories = ["All", ...categories.map(c => c.title)];

  // Filter skills based on queries
  const filteredSkills = allSkills.filter(skill => {
    const matchesCategory = selectedCategory === "All" || skill.category === selectedCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          skill.level.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-3">
          Technical <span className="text-primary">Skills</span>
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent-foreground mx-auto rounded-full" />
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Explore my stack across frontend, backend, databases, tools, and computer science concepts.
        </p>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-card border border-border p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, experience levels, or tools..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {filterCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedCategory === cat
                  ? "bg-primary border-primary text-primary-foreground shadow-sm"
                  : "bg-background border-border text-muted-foreground hover:text-primary hover:border-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredSkills.map((skill, idx) => {
          const IconComponent = getSkillIcon(skill.name);
          return (
            <motion.div
              key={skill.name + idx}
              variants={cardVariants}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary hover:shadow-md transition-all duration-300 relative group overflow-hidden"
            >
              {/* Colored tag on top right */}
              <span className="absolute top-4 right-4 text-[10px] font-mono bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-bold border border-primary/10">
                {skill.level}
              </span>

              {/* Skill Title & Icon */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <IconComponent size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base leading-tight">{skill.name}</h3>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{skill.category}</span>
                </div>
              </div>

              {/* Skill description */}
              <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2 h-8">
                {skill.description}
              </p>

              {/* Progress Indicator */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-muted-foreground">Mastery</span>
                  <span className="text-primary font-bold">{skill.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden border border-border/30">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.percentage}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.05 }}
                    className="h-full bg-gradient-to-r from-primary to-accent-foreground rounded-full"
                  />
                </div>
              </div>

              {/* Used in projects */}
              {skill.usedInProjects.length > 0 ? (
                <div className="pt-3 border-t border-border/50">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Applied In:</span>
                  <div className="flex flex-wrap gap-1">
                    {skill.usedInProjects.map(proj => (
                      <span key={proj} className="text-[9px] font-mono px-2 py-0.5 rounded bg-background text-foreground border border-border">
                        {proj}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-border/50">
                  <span className="text-[9px] text-muted-foreground font-mono block italic">Awaiting project deployment</span>
                </div>
              )}
            </motion.div>
          );
        })}

        {filteredSkills.length === 0 && (
          <div className="col-span-full text-center py-12 bg-card border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground text-sm">No skills found matching your current filter filters.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Skills;
