import { ExternalLink, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePortfolioStore } from "@/store/usePortfolioStore";

const ProjectsSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const projects = usePortfolioStore((state) => state.data.projects);

  // Filter featured projects (show all featured, or fallback to first 4 if none are marked)
  const featuredProjects = projects.filter(p => p.featured);
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 4);

  return (
    <section id="projects" className="py-24 bg-card">
      <div ref={ref} className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h2 className={`text-3xl md:text-4xl font-bold font-serif text-center mb-4 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          My <span className="text-primary">Projects</span>
        </h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-12" />

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {displayProjects.map((project, i) => (
            <a
              key={project.id || project.title + i}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div
                className={`group rounded-xl border border-border bg-background p-6 hover:border-primary transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${isVisible ? "animate-fade-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 + i * 0.15}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-mono">{project.subtitle}</p>
                  </div>
                  <ExternalLink size={18} className="text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                </div>

                <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">{project.desc}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tech.map((t) => (
                    <span key={t} className="px-2.5 py-1 text-xs font-mono rounded-md bg-primary/10 text-primary border border-primary/20">
                      {t}
                    </span>
                  ))}
                </div>

                <ul className="space-y-1">
                  {project.features.slice(0, 3).map((f) => (
                    <li key={f} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </a>
          ))}
        </div>

        {/* View All Projects Button */}
        <div className="text-center mt-12">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:opacity-95 shadow-md shadow-primary/10 transition-all duration-300 hover:gap-2.5"
          >
            View All Projects <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;