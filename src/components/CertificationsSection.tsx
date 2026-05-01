import { Award } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const certs = [
  { name: "AWS Academy Graduate – Cloud Foundations", org: "AWS Academy" },
  { name: "Java Programming", org: "Great Learning" },
  { name: "Building a Website with Node.js and Express.js", org: "LinkedIn Learning" },
  { name: "Learning MongoDB", org: "LinkedIn Learning" },
  { name: "SQL and Relational Databases 101", org: "IBM (Cognitive Class)" },
  { name: "Problem Solving Through Programming in C", org: "NPTEL (IIT Kharagpur)" },
  { name: "Software Testing", org: "NPTEL (IIIT Bangalore / IIT Madras)" },
  { name: "Time Management", org: "Infosys Springboard" },
];

const CertificationsSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="certifications" className="py-24">
      <div ref={ref} className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h2 className={`text-3xl md:text-4xl font-bold font-serif text-center mb-4 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          <span className="text-primary">Certifications</span>
        </h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-12" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {certs.map((cert, i) => (
            <div
              key={cert.name}
              className={`p-5 rounded-xl border border-border bg-card hover:border-primary transition-all duration-500 hover:-translate-y-1 group ${isVisible ? "animate-scale-in" : "opacity-0"}`}
              style={{ animationDelay: `${0.05 + i * 0.08}s` }}
            >
              <Award size={20} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground text-sm mb-1 leading-tight">{cert.name}</h3>
              <p className="text-xs text-muted-foreground">{cert.org}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
