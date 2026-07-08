import React, { useState, useEffect } from "react";
import { getPortfolioData, ResumeData, HeroData } from "@/lib/portfolioData";
import { Download, FileText, Printer, Share2, Clipboard, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Resume = () => {
  const [resume, setResume] = useState<ResumeData>(() => getPortfolioData().resume);
  const [hero, setHero] = useState<HeroData>(() => getPortfolioData().hero);
  const [viewMode, setViewMode] = useState<"preview" | "ats">("preview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = getPortfolioData();
    setResume(p.resume);
    setHero(p.hero);
    
    const handleUpdate = () => {
      const updated = getPortfolioData();
      setResume(updated.resume);
      setHero(updated.hero);
    };
    window.addEventListener("portfolioDataUpdate", handleUpdate);
    return () => window.removeEventListener("portfolioDataUpdate", handleUpdate);
  }, []);

  const handleDownload = async () => {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}resume.pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Vishnu_Resume.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Resume downloaded successfully!");
    } catch (error) {
      console.error(error);
      const fallback = document.createElement("a");
      fallback.href = `${import.meta.env.BASE_URL}resume.pdf`;
      fallback.setAttribute("download", "Vishnu_Resume.pdf");
      fallback.click();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${hero.name} ${hero.lastName} - Resume`,
        text: `Check out the professional resume of ${hero.name} ${hero.lastName}`,
        url: window.location.href
      }).catch(err => console.error(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard for sharing!");
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(resume.atsContent);
    setCopied(true);
    toast.success("ATS Resume content copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-3">
          Curriculum <span className="text-primary">Vitae</span>
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent-foreground mx-auto rounded-full" />
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Preview my official resume, download it for recruitment systems, or read the ATS-friendly text summary.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Toggle Toggles */}
        <div className="flex rounded-lg border border-border p-0.5 bg-background self-stretch sm:self-auto">
          <button
            onClick={() => setViewMode("preview")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === "preview" ? "bg-accent text-primary shadow-2xs" : "text-muted-foreground"
            }`}
          >
            PDF Preview
          </button>
          <button
            onClick={() => setViewMode("ats")}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === "ats" ? "bg-accent text-primary shadow-2xs" : "text-muted-foreground"
            }`}
          >
            ATS Plain-Text
          </button>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-initial px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Download size={13} /> Download
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all bg-background"
            title="Print Resume"
          >
            <Printer size={15} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all bg-background"
            title="Share Resume Link"
          >
            <Share2 size={15} />
          </button>
        </div>
      </div>

      {/* Render Panel */}
      {viewMode === "preview" ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md aspect-[1/1.4] w-full flex flex-col">
          {/* Header */}
          <div className="bg-background px-4 py-2 border-b border-border flex justify-between items-center text-xs text-muted-foreground font-mono">
            <span>resume.pdf</span>
            <span>PDF Viewer Context</span>
          </div>
          
          {/* Iframe preview */}
          <iframe 
            src={`${import.meta.env.BASE_URL}resume.pdf#toolbar=0`} 
            className="w-full flex-1 border-none"
            title="Resume PDF Frame"
          />
        </div>
      ) : (
        /* ATS Plain Text View */
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-md relative">
          {/* Copy Button */}
          <button
            onClick={handleCopyToClipboard}
            className="absolute top-4 right-4 p-2 rounded-lg border border-border text-muted-foreground hover:text-primary bg-background transition-all"
            title="Copy Text to Clipboard"
          >
            {copied ? <Check size={14} className="text-primary" /> : <Clipboard size={14} />}
          </button>

          <div className="mb-4">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-primary">ATS Reader Friendly</span>
            <h2 className="text-xl font-bold font-serif text-foreground mt-0.5">Resume Summary</h2>
          </div>

          <pre className="p-5 rounded-xl bg-background border border-border text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto">
            {resume.atsContent}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Resume;
