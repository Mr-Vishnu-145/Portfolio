import { Mail, Phone, Github, Linkedin } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const ContactSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="contact" className="py-24 bg-card">
      <div ref={ref} className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h2 className={`text-3xl md:text-4xl font-bold font-serif text-center mb-4 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          Get In <span className="text-primary">Touch</span>
        </h2>
        <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-12" />

        <div className="max-w-2xl mx-auto grid sm:grid-cols-2 gap-6">
          {[
            { icon: Mail, label: "Email", value: "Vishnuvenkat014@gmail.com", href: "mailto:Vishnuvenkat014@gmail.com" },
            { icon: Phone, label: "Phone", value: "+91-9500861022", href: "tel:+919500861022" },
            { icon: Github, label: "GitHub", value: "Mr-Vishnu-145", href: "https://github.com/Mr-Vishnu-145/" },
            { icon: Linkedin, label: "LinkedIn", value: "vishnu145", href: "https://www.linkedin.com/in/vishnu145/" },
          ].map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`flex items-center gap-4 p-5 rounded-xl border border-border bg-background hover:border-primary transition-all duration-500 hover:-translate-y-1 group ${isVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <item.icon size={20} className="text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.value}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
