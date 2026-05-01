import { ExternalLink } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const projects = [
  {
    title: "ERP Management System",
    subtitle: "Full-Stack Project",
    tech: ["React.js", "Spring Boot", "MySQL"],
    desc: "A full-stack ERP application to automate organizational processes including Finance, HR, Inventory and Enterprise Reports modules.",
    features: ["Responsive UI Components", "RESTful APIs", "MVC Architecture", "Relational DB Schemas"],
    link: "https://github.com/Mr-Vishnu-145",
  },
  {
    title: "Hospital Management System",
    subtitle: "Full-Stack Project",
    tech: ["React.js", "Spring Boot", "MySQL"],
    desc: "Developed a scalable full-stack ERP system to automate core business operations. Modeled and managed relational databases using MySQL, ensuring data integrity and optimized queries. Engineered responsive, reusable UI components using React.js, improving user experience and maintainability.",
    features: ["CRUD Operations", "Modular Design", "Scalable Code"],
    link: "https://github.com/Mr-Vishnu-145",
  },
  {
    title: "Employee Management System",
    subtitle: "Java Console Application",
    tech: ["Java"],
    desc: "Console-based Java application for employee data handling with complete CRUD operations and structured program design.",
    features: ["Console UI", "CRUD Operations", "Structured Design"],
    link: "https://github.com/Mr-Vishnu-145",
  },
  {
    title: "Guess Game",
    subtitle: "Web Game",
    tech: ["HTML", "CSS", "JavaScript"],
    desc: "An interactive browser-based game with JavaScript logic and responsive, user-friendly interface.",
    features: ["Interactive Gameplay", "Responsive Design"],
    link: "https://github.com/Mr-Vishnu-145",
  },
];

const ProjectsSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="projects" className="py-24 bg-card">
      <div ref={ref} className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h2 className={`text-3xl md:text-4xl font-bold font-serif text-center mb-4 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          My <span className="text-primary">Projects</span>
        </h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-12" />

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {projects.map((project, i) => (
            <a
              key={project.title}
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

                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{project.desc}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tech.map((t) => (
                    <span key={t} className="px-2.5 py-1 text-xs font-mono rounded-md bg-primary/10 text-primary border border-primary/20">
                      {t}
                    </span>
                  ))}
                </div>

                <ul className="space-y-1">
                  {project.features.map((f) => (
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
      </div>
    </section>
  );
};

export default ProjectsSection;