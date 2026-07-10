import React, { useState } from "react";
import { CertificationData } from "@/lib/portfolioData";
import { Search, ExternalLink, Calendar, Award, Grid, List, Download } from "lucide-react";
import { motion } from "framer-motion";
import { usePortfolioStore } from "@/store/usePortfolioStore";

const Certifications = () => {
  const certs = usePortfolioStore((state) => state.data.certifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const [activePreview, setActivePreview] = useState<{ name: string; url: string } | null>(null);

  const allCategories = Array.from(new Set(["All", ...certs.map(c => c.category).filter(Boolean)]));

  const filteredCerts = certs.filter(cert => {
    const matchesSearch = 
      cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cert.credentialId && cert.credentialId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || cert.category === selectedCategory || 
      // If it doesn't have a category, map some defaults for custom ones
      (selectedCategory === "Programming" && cert.name.toLowerCase().includes("java")) ||
      (selectedCategory === "Database" && cert.name.toLowerCase().includes("mongodb")) ||
      (selectedCategory === "Cloud" && cert.org.toLowerCase().includes("aws"));

    return matchesSearch && matchesCategory;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  } as const;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-3">
          Certifications & <span className="text-primary">Credentials</span>
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent-foreground mx-auto rounded-full" />
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          View my industry credentials, vendor certificates, and academic course completions.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search credentials, orgs..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Categories & View Mode */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-1">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                  selectedCategory === cat
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-border text-muted-foreground hover:text-primary hover:border-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border hidden md:block" />

          {/* Toggle Grid vs List/Timeline */}
          <div className="flex rounded-lg border border-border p-0.5 bg-background">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-accent text-primary" : "text-muted-foreground"}`}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "timeline" ? "bg-accent text-primary" : "text-muted-foreground"}`}
              title="Timeline View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Render */}
      {viewMode === "grid" ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCerts.map((cert, idx) => (
            <motion.div
              key={cert.name + idx}
              variants={itemVariants}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-primary mb-3">
                  <Award size={20} />
                </div>
                
                <div className="flex justify-between items-start gap-3 mb-1">
                  <h3 className="font-bold text-foreground text-sm leading-snug">{cert.name}</h3>
                  {cert.issueDate && (
                    <span className="text-[9px] font-mono bg-accent text-accent-foreground px-1.5 py-0.5 rounded font-bold shrink-0">
                      {cert.issueDate}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs text-muted-foreground font-mono">{cert.org}</p>
                  {cert.category && (
                    <span className="text-[8px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                      {cert.category}
                    </span>
                  )}
                </div>

                {cert.credentialId && (
                  <div className="mt-3 text-[10px] text-muted-foreground font-mono">
                    ID: <span className="text-foreground font-bold">{cert.credentialId}</span>
                  </div>
                )}

                {/* Skills Learned */}
                {cert.skillsLearned && cert.skillsLearned.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block mb-1">Acquired Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {cert.skillsLearned.map(skill => (
                        <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded bg-background border border-border">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-border/50">
                {cert.verifyUrl ? (
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
                    className="flex-1 py-1.5 px-3 rounded-lg bg-accent text-accent-foreground text-center text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1"
                  >
                    <ExternalLink size={12} />
                    Verify
                  </a>
                ) : (
                  <span className="flex-1 py-1.5 px-3 rounded-lg bg-background text-muted-foreground/30 text-center text-xs font-semibold border border-border/50 cursor-not-allowed flex items-center justify-center gap-1 select-none">
                    No Verification URL
                  </span>
                )}
                
                {(cert.verifyUrl?.startsWith("data:") || (cert.downloadUrl && cert.downloadUrl !== "#")) && (
                  <a
                    href={cert.verifyUrl?.startsWith("data:") ? cert.verifyUrl : cert.downloadUrl}
                    download={cert.verifyUrl?.startsWith("data:") ? `${cert.name.replace(/\s+/g, "_")}_Certificate.${cert.verifyUrl.startsWith("data:application/pdf") ? "pdf" : "jpg"}` : undefined}
                    className="py-1.5 px-2.5 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all flex items-center justify-center"
                    title="Download File"
                  >
                    <Download size={12} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}

          {filteredCerts.length === 0 && (
            <div className="col-span-full text-center py-16 bg-card border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground text-sm">No credentials found matching the selections.</p>
            </div>
          )}
        </motion.div>
      ) : (
        /* Timeline View */
        <div className="relative border-l border-border pl-6 space-y-8 py-2 ml-4">
          {filteredCerts.map((cert, idx) => (
            <div key={cert.name + idx} className="relative bg-card border border-border p-5 rounded-xl max-w-2xl hover:border-primary transition-all duration-300">
              {/* Timeline dot */}
              <div className="absolute -left-[33px] top-6 w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-foreground text-sm">{cert.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{cert.org}</p>
                </div>
                {cert.issueDate && (
                  <span className="text-[10px] font-mono bg-accent text-accent-foreground px-2 py-0.5 rounded border border-primary/10 self-start sm:self-center font-bold">
                    {cert.issueDate}
                  </span>
                )}
              </div>

              {cert.credentialId && (
                <div className="text-[10px] text-muted-foreground font-mono mb-3">
                  Credential ID: <span className="text-foreground font-bold">{cert.credentialId}</span>
                </div>
              )}

              {cert.skillsLearned && cert.skillsLearned.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {cert.skillsLearned.map(skill => (
                    <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded bg-background border border-border">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-border/50">
                <a
                  href={cert.verifyUrl || "#"}
                  target={cert.verifyUrl && cert.verifyUrl.startsWith("data:") ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (cert.verifyUrl && cert.verifyUrl.startsWith("data:")) {
                      e.preventDefault();
                      setActivePreview({ name: cert.name, url: cert.verifyUrl });
                    }
                  }}
                  className="py-1 px-3 rounded bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center gap-1"
                >
                  <ExternalLink size={11} /> Verify
                </a>
              </div>
            </div>
          ))}

          {filteredCerts.length === 0 && (
            <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground text-sm">No credentials found matching the selections.</p>
            </div>
          )}
        </div>
      )}

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
    </div>
  );
};

export default Certifications;
