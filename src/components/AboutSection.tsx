import { GraduationCap, Code, Briefcase } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const AboutSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="about" className="py-24 bg-card">
      <div ref={ref} className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h2 className={`text-3xl md:text-4xl font-bold font-serif text-center mb-4 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          About <span className="text-primary">Me</span>
        </h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-12" />

        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className={`text-muted-foreground text-lg leading-relaxed ${isVisible ? "animate-fade-up" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
            Motivated and enthusiastic engineering graduate seeking an entry-level Java / Full-Stack Developer role.
            Strong foundation in Java, Spring Boot, React.js, PHP, and MySQL, with hands-on experience in building
            real-world academic and personal projects. Passionate about writing clean, scalable code and continuously
            improving technical skills.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { icon: GraduationCap, title: "Education", desc: "B.Tech – Information Technology\nKarpagam Institute of Technology\n2023 – 2027" },
            { icon: Code, title: "Focus Areas", desc: "Full-Stack Development\nJava & Spring Boot\nReact.js & Frontend" },
            { icon: Briefcase, title: "Looking For", desc: "Entry-Level Positions\nJava / Full-Stack Roles\nRemote & On-site" },
          ].map((item, i) => (
            <div
              key={item.title}
              className={`p-6 rounded-xl border border-border bg-background hover:border-primary transition-all duration-500 hover:-translate-y-2 group ${isVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${0.3 + i * 0.15}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="text-accent-foreground" size={24} />
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm whitespace-pre-line">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
