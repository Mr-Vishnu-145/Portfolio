import React, { useState } from "react";
import { ProjectData } from "@/lib/portfolioData";
import { Search, ExternalLink, ArrowRight, Github, Code, Filter, BookOpen, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePortfolioStore } from "@/store/usePortfolioStore";

const Projects = () => {
  const projects = usePortfolioStore((state) => state.data.projects);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"name" | "duration">("name");
  const [visibleCount, setVisibleCount] = useState(6);

  // Extract all unique tech tags across all projects
  const allTechTags = new Set<string>();
  projects.forEach(p => p.tech.forEach(t => allTechTags.add(t)));
  const uniqueTechs = ["All", ...Array.from(allTechTags)];

  // Extract all unique categories/subtitles
  const allCategories = new Set<string>();
  projects.forEach(p => {
    if (p.subtitle) allCategories.add(p.subtitle);
  });
  const uniqueCategories = ["All", ...Array.from(allCategories)];

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tech.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTech = selectedTech === "All" || project.tech.includes(selectedTech);
      const matchesCategory = selectedCategory === "All" || project.subtitle === selectedCategory;

      return matchesSearch && matchesTech && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      } else {
        // Sort by duration or length
        const durA = a.duration || "";
        const durB = b.duration || "";
        return durB.localeCompare(durA);
      }
    });

  const loadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-3">
          My <span className="text-primary">Projects</span>
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent-foreground mx-auto rounded-full" />
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Deep-dive into my creations, from full-stack ERP web platforms to terminal utilities and console algorithms.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-sm mb-8 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, description, or tech..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {/* Tech Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground shrink-0" />
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Technologies</option>
              {uniqueTechs.filter(t => t !== "All").map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-muted-foreground shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Categories</option>
              {uniqueCategories.filter(c => c !== "All").map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
          <div>
            Showing <span className="font-bold text-foreground font-mono">{filteredProjects.length}</span> projects
          </div>
          <div className="flex items-center gap-3">
            <span>Sort By:</span>
            <button
              onClick={() => setSortBy("name")}
              className={`font-semibold transition-all ${sortBy === "name" ? "text-primary font-bold underline" : "hover:text-foreground"}`}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy("duration")}
              className={`font-semibold transition-all ${sortBy === "duration" ? "text-primary font-bold underline" : "hover:text-foreground"}`}
            >
              Scale
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-8"
      >
        {filteredProjects.slice(0, visibleCount).map((project, idx) => (
          <motion.div
            key={project.id || project.title + idx}
            variants={cardVariants}
            className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary hover:shadow-xl transition-all duration-500 flex flex-col group relative"
          >
            {/* Status & Featured Tags */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              {project.featured && (
                <span className="text-[10px] font-bold font-mono tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase border border-primary/20 shadow-sm animate-pulse">
                  Featured
                </span>
              )}
              {project.status && (
                <span className="text-[10px] font-semibold font-mono bg-accent text-accent-foreground px-2 py-0.5 rounded-full border border-primary/10">
                  {project.status}
                </span>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col pt-12">
              <div className="mb-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-primary block">{project.subtitle}</span>
                <h3 className="text-2xl font-bold font-serif text-foreground group-hover:text-primary transition-colors mt-0.5">{project.title}</h3>
              </div>

              <div className="flex gap-4 text-xs text-muted-foreground mb-4 font-mono">
                {project.duration && <span>Duration: {project.duration}</span>}
                {project.role && <span>Role: {project.role}</span>}
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                {project.desc}
              </p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {project.tech.map(t => (
                  <span key={t} className="px-2.5 py-1 text-[10px] font-mono font-medium rounded bg-background text-foreground border border-border">
                    {t}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                {project.id ? (
                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-95 transition-opacity"
                  >
                    <BookOpen size={13} />
                    View Details
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-muted text-muted-foreground font-semibold text-xs cursor-not-allowed"
                  >
                    Details N/A
                  </button>
                )}

                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-border text-foreground hover:border-primary hover:text-primary font-semibold text-xs transition-colors"
                >
                  <Github size={13} />
                  Codebase
                </a>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-16 bg-card border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground text-sm">No projects found matching the current search parameters.</p>
          </div>
        )}
      </motion.div>

      {/* Load More Button */}
      {filteredProjects.length > visibleCount && (
        <div className="text-center mt-12">
          <button
            onClick={loadMore}
            className="px-6 py-2.5 rounded-xl border border-border hover:border-primary text-foreground hover:text-primary font-semibold text-sm transition-all"
          >
            Load More Projects
          </button>
        </div>
      )}
    </div>
  );
};

export default Projects;
