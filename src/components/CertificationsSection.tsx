import { useState } from "react";
import { Award, ExternalLink, Download } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { CertificationData } from "@/lib/portfolioData";
import { usePortfolioStore } from "@/store/usePortfolioStore";

const CertificationsSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const certs = usePortfolioStore((state) => state.data.certifications);
  const [activePreview, setActivePreview] = useState<{ name: string; url: string } | null>(null);

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
              key={cert.name + i}
              className={`p-5 rounded-xl border border-border bg-card hover:border-primary transition-all duration-500 hover:-translate-y-1 group flex flex-col justify-between ${isVisible ? "animate-scale-in" : "opacity-0"}`}
              style={{ animationDelay: `${0.05 + i * 0.08}s` }}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <Award size={20} className="text-primary group-hover:scale-110 transition-transform" />
                  {cert.issueDate && (
                    <span className="text-[9px] font-mono bg-accent text-accent-foreground px-1.5 py-0.5 rounded font-bold shrink-0">
                      {cert.issueDate}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1 leading-tight">{cert.name}</h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs text-muted-foreground font-mono">{cert.org}</p>
                  {cert.category && (
                    <span className="text-[8px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-1 py-0.5 rounded border border-primary/20">
                      {cert.category}
                    </span>
                  )}
                </div>

                {cert.credentialId && (
                  <p className="text-[10px] text-muted-foreground font-mono mt-1 mb-2">
                    ID: <span className="text-foreground font-bold">{cert.credentialId}</span>
                  </p>
                )}

                {cert.skillsLearned && cert.skillsLearned.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-border/50">
                    {cert.skillsLearned.slice(0, 3).map(skill => (
                      <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded bg-background border border-border">
                        {skill}
                      </span>
                    ))}
                    {cert.skillsLearned.length > 3 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground font-bold">
                        +{cert.skillsLearned.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {cert.verifyUrl && (
                <div className="mt-4 pt-3 border-t border-border/50 flex justify-end">
                  <a
                    href={cert.verifyUrl}
                    target={cert.verifyUrl.startsWith("data:") ? "_self" : "_blank"}
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (cert.verifyUrl && cert.verifyUrl.startsWith("data:")) {
                        e.preventDefault();
                        setActivePreview({ name: cert.name, url: cert.verifyUrl });
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
                  >
                    Verify Certification
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Document Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-scale-in max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card shrink-0">
              <h3 className="font-bold text-foreground text-base">{activePreview.name} - Certificate Preview</h3>
              <button
                onClick={() => setActivePreview(null)}
                className="text-muted-foreground hover:text-foreground font-bold text-xl"
              >
                &times;
              </button>
            </div>

            {/* Content Container */}
            <div className="relative w-full bg-background/50 flex justify-center items-center p-4 flex-1 overflow-auto min-h-[300px]">
              {activePreview.url.startsWith("data:application/pdf") ? (
                <iframe
                  src={activePreview.url}
                  title="PDF Preview"
                  className="w-full h-[65vh] rounded-lg border border-border bg-white"
                />
              ) : activePreview.url.startsWith("data:image/") ? (
                <img
                  src={activePreview.url}
                  alt={activePreview.name}
                  className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-sm"
                />
              ) : (
                <p className="text-muted-foreground text-sm font-mono">Unable to render preview.</p>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-border bg-card shrink-0 flex justify-end gap-2">
              <a
                href={activePreview.url}
                download={`${activePreview.name.replace(/\s+/g, "_")}_Certificate.${activePreview.url.startsWith("data:application/pdf") ? "pdf" : "jpg"}`}
                className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-xl text-xs font-semibold transition-opacity flex items-center gap-1.5"
              >
                <Download size={14} /> Download Certificate
              </a>
              <button
                onClick={() => setActivePreview(null)}
                className="px-4 py-2 border border-border text-muted-foreground hover:bg-accent rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CertificationsSection;
