import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPortfolioData, ProjectData } from "@/lib/portfolioData";
import { 
  ArrowLeft, Github, ExternalLink, Calendar, Users, 
  Tag, Shield, Server, Cpu, Database, Award, ArrowRight,
  HelpCircle, CheckCircle, AlertTriangle, Lightbulb, Code, Edit3
} from "lucide-react";
import { motion } from "framer-motion";

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectData[]>(() => getPortfolioData().projects);
  const [project, setProject] = useState<ProjectData | undefined>(undefined);

  useEffect(() => {
    const allProjects = getPortfolioData().projects;
    setProjects(allProjects);
    const found = allProjects.find(p => p.id === id);
    setProject(found);
  }, [id]);

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <AlertTriangle className="text-destructive mx-auto mb-4" size={48} />
        <h2 className="text-2xl font-bold font-serif mb-2 text-foreground">Case Study Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The project ID you are trying to view does not exist or has been deleted.
        </p>
        <Link 
          to="/projects"
          className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90"
        >
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>
    );
  }

  // Find next project index
  const currentIndex = projects.findIndex(p => p.id === project.id);
  const nextProject = currentIndex !== -1 && currentIndex < projects.length - 1 
    ? projects[currentIndex + 1] 
    : projects[0] !== project ? projects[0] : undefined;

  // Filter related projects (other projects matching some tech or just generic)
  const relatedProjects = projects
    .filter(p => p.id !== project.id)
    .slice(0, 2);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back & Edit Buttons */}
      <div className="flex justify-between items-center mb-8">
        <Link 
          to="/projects" 
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary font-semibold transition-colors"
        >
          <ArrowLeft size={14} /> Back to Projects
        </Link>
        <Link 
          to={`/admin?editProject=${project.id}`} 
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-foreground font-bold transition-all bg-primary/10 hover:bg-primary px-3 py-1.5 rounded-lg border border-primary/20 hover:border-primary"
        >
          <Edit3 size={14} /> Edit Project in Admin
        </Link>
      </div>

      {/* Hero Banner Section */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md mb-12 relative">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-accent-foreground to-primary" />
        
        {/* Banner Details */}
        <div className="p-8 md:p-12 relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              Case Study
            </span>
            {project.status && (
              <span className="text-xs font-mono font-semibold bg-accent text-accent-foreground px-3 py-1 rounded-full border border-primary/10">
                {project.status}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold font-serif text-foreground leading-tight">
            {project.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
            {project.desc}
          </p>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-border/50">
            <div className="flex items-center gap-3">
              <Calendar className="text-primary shrink-0" size={18} />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">Timeline</p>
                <p className="text-xs text-foreground font-bold font-mono">{project.duration || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="text-primary shrink-0" size={18} />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">Team Size</p>
                <p className="text-xs text-foreground font-bold font-mono">{project.teamSize || "Solo Developer"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Award className="text-primary shrink-0" size={18} />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">Role</p>
                <p className="text-xs text-foreground font-bold font-mono">{project.role || "Lead Architect"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tag className="text-primary shrink-0" size={18} />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">Tech Category</p>
                <p className="text-xs text-foreground font-bold font-mono">{project.subtitle || "Full-Stack"}</p>
              </div>
            </div>
          </div>

          {/* External Call to Actions */}
          <div className="flex flex-wrap gap-4 pt-6">
            <a 
              href={project.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-95 shadow-lg shadow-primary/10"
            >
              <Github size={14} />
              GitHub Codebase
            </a>
            <a 
              href={project.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-xl border border-border text-foreground hover:border-primary hover:text-primary font-semibold text-xs transition-all"
            >
              <ExternalLink size={14} />
              Live Demonstration
            </a>
          </div>
        </div>
      </div>

      {/* Case Study Core Sections */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-12">
          {/* Problem & Goal */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold font-serif text-foreground flex items-center gap-2 mb-2">
                <HelpCircle className="text-primary" size={18} /> Problem Statement
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {project.problemStatement || "Developing scalable solutions requires solving real-world friction. In complex workflows, static spreadsheet management or manual administration creates synchronization errors and communication friction."}
              </p>
            </div>

            <div className="pt-4 border-t border-border/50">
              <h3 className="text-lg font-bold font-serif text-foreground flex items-center gap-2 mb-2">
                <CheckCircle className="text-primary" size={18} /> Business Goal & Objectives
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {project.businessGoal || "Centralize tracking, secure user profiles using standard authorization rules, and provide interactive analytical tools enabling user insights."}
              </p>
            </div>
          </div>

          {/* Architecture & Flow */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
              <Cpu className="text-primary" size={18} /> System Architecture & Flow
            </h3>
            
            {project.architectureDiagram ? (
              <div>
                <span className="text-xs uppercase text-muted-foreground tracking-wider font-semibold block mb-2">Data Flow Model</span>
                <pre className="p-4 rounded-xl bg-background border border-border text-[10px] font-mono text-primary leading-tight overflow-x-auto whitespace-pre">
                  {project.architectureDiagram}
                </pre>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs italic">System architecture workflow details are structured recursively.</p>
            )}

            {project.folderStructure && (
              <div className="pt-4 border-t border-border/50">
                <span className="text-xs uppercase text-muted-foreground tracking-wider font-semibold block mb-2">Workspace Directories</span>
                <pre className="p-4 rounded-xl bg-background border border-border text-[10px] font-mono text-muted-foreground leading-tight overflow-x-auto whitespace-pre">
                  {project.folderStructure}
                </pre>
              </div>
            )}
          </div>

          {/* Security & Optimization */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
              <Shield className="text-primary" size={18} /> Security & Performance Optimizations
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Security */}
              <div>
                <span className="text-xs uppercase text-muted-foreground tracking-wider font-semibold block mb-2">Security Implementations</span>
                <ul className="space-y-1.5">
                  {project.securityFeatures ? (
                    project.securityFeatures.map((feat, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        <span>{feat}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Encrypted data properties
                      </li>
                      <li className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Parameter binds preventing SQL Injections
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Performance */}
              <div>
                <span className="text-xs uppercase text-muted-foreground tracking-wider font-semibold block mb-2">Performance Configurations</span>
                <ul className="space-y-1.5">
                  {project.performanceOptimizations ? (
                    project.performanceOptimizations.map((opt, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        <span>{opt}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Connection pools tuning for concurrent reads
                      </li>
                      <li className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> React bundle splitting and assets caching
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Challenges & Solutions */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
              <Lightbulb className="text-primary" size={18} /> Challenges Faced & Solutions
            </h3>
            
            <div className="space-y-4">
              {project.challengesFaced ? (
                project.challengesFaced.map((challenge, i) => (
                  <div key={i} className="bg-background border border-border p-4 rounded-xl space-y-2">
                    <p className="text-xs font-bold text-destructive font-mono flex items-center gap-1.5">
                      <AlertTriangle size={14} /> CHALLENGE #{i + 1}
                    </p>
                    <p className="text-xs text-foreground font-semibold leading-relaxed">{challenge}</p>
                    {project.solutionsImplemented && project.solutionsImplemented[i] && (
                      <div className="pt-2 border-t border-border/30 mt-2">
                        <p className="text-[10px] font-bold text-primary font-mono uppercase">SOLUTION IMPLEMENTED</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{project.solutionsImplemented[i]}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No technical logs entered.</p>
              )}
            </div>
          </div>

          {/* Lessons Learned */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-serif text-foreground flex items-center gap-2">
              <Award className="text-primary" size={18} /> Key Takeaways & Lessons
            </h3>
            <ul className="space-y-2">
              {project.lessonsLearned ? (
                project.lessonsLearned.map((lesson, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{lesson}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Dynamic data layers require robust database constraints checks early.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Sidebar Info Area */}
        <div className="md:col-span-1 space-y-6">
          {/* Tech Stack widget */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-bold text-foreground font-serif">Technology Stack</h4>
            <div className="flex flex-wrap gap-1.5">
              {project.tech.map(t => (
                <span key={t} className="px-2.5 py-1 text-xs font-mono rounded-md bg-background text-foreground border border-border">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Key Features list */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-bold text-foreground font-serif">Core Features</h4>
            <ul className="space-y-2">
              {project.features.map((feat, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                  <span className="leading-tight">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Project Details Sidebar */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 text-xs">
            <h4 className="font-bold text-foreground font-serif text-sm">Case Details</h4>
            
            <div className="space-y-3 pt-2">
              {project.authenticationFlow && (
                <div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Auth Flow</span>
                  <span className="text-foreground leading-relaxed mt-0.5 block">{project.authenticationFlow}</span>
                </div>
              )}
              {project.testingStrategy && (
                <div className="pt-2 border-t border-border/50">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Testing Strategy</span>
                  <span className="text-foreground leading-relaxed mt-0.5 block">{project.testingStrategy}</span>
                </div>
              )}
              {project.seoOptimization && (
                <div className="pt-2 border-t border-border/50">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">SEO Configurations</span>
                  <span className="text-foreground leading-relaxed mt-0.5 block">{project.seoOptimization}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Next Case Study Navigation */}
      {nextProject && (
        <div className="border-t border-border pt-12 mb-16">
          <div className="bg-card border border-border p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary transition-all duration-300">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-muted-foreground">Up Next</span>
              <h3 className="text-2xl font-bold font-serif text-foreground mt-1">{nextProject.title}</h3>
              <p className="text-muted-foreground text-xs mt-1 leading-relaxed max-w-xl">{nextProject.desc}</p>
            </div>
            
            <Link
              to={`/projects/${nextProject.id}`}
              className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-95 shrink-0 transition-opacity"
            >
              Next Case Study <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
