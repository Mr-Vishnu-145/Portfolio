import React, { useState, useEffect } from "react";
import { getPortfolioData, AboutData, HeroData, EducationData } from "@/lib/portfolioData";
import { 
  GraduationCap, Briefcase, Calendar, Award, 
  Github, Linkedin, Mail, Phone, Download, Compass, Target, ArrowRight 
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const About = () => {
  const [data, setData] = useState<AboutData>(() => getPortfolioData().about);
  const [hero, setHero] = useState<HeroData>(() => getPortfolioData().hero);
  const [education, setEducation] = useState<EducationData[]>(() => getPortfolioData().education || []);
  const [projectCount, setProjectCount] = useState(0);
  const [skillsCount, setSkillsCount] = useState(0);

  useEffect(() => {
    const portfolio = getPortfolioData();
    setData(portfolio.about);
    setHero(portfolio.hero);
    setEducation(portfolio.education || []);
    setProjectCount(portfolio.projects.length);
    
    // Count unique skills
    const uniqueSkills = new Set<string>();
    portfolio.skills.forEach(c => c.skills.forEach(s => uniqueSkills.add(s)));
    setSkillsCount(uniqueSkills.size);

    const handleUpdate = () => {
      const p = getPortfolioData();
      setData(p.about);
      setHero(p.hero);
      setEducation(p.education || []);
      setProjectCount(p.projects.length);
      const u = new Set<string>();
      p.skills.forEach(c => c.skills.forEach(s => u.add(s)));
      setSkillsCount(u.size);
    };
    window.addEventListener("portfolioDataUpdate", handleUpdate);
    return () => window.removeEventListener("portfolioDataUpdate", handleUpdate);
  }, []);

  const handleDownloadResume = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
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
    } catch (error) {
      console.error("Failed to download resume:", error);
      const fallbackLink = document.createElement("a");
      fallbackLink.href = `${import.meta.env.BASE_URL}resume.pdf`;
      fallbackLink.setAttribute("download", "Vishnu_Resume.pdf");
      fallbackLink.click();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  } as const;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Page Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-3">
          About <span className="text-primary">Me</span>
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent-foreground mx-auto rounded-full" />
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Get to know my journey, academic credentials, and career objectives as a software engineer.
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-3 gap-8 mb-16"
      >
        {/* Profile Card & Info */}
        <motion.div variants={itemVariants} className="md:col-span-1 space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm text-center relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent-foreground" />
            
            {/* Visual Avatar */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary/20 to-accent-foreground/20 border border-primary/20 flex items-center justify-center mx-auto mb-4 overflow-hidden relative group">
              {hero.avatarUrl ? (
                <img 
                  src={hero.avatarUrl} 
                  alt={`${hero.name} ${hero.lastName}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <span className="text-3xl font-bold font-serif text-primary group-hover:scale-110 transition-transform duration-300">
                  {hero.name.charAt(0)}{hero.lastName.charAt(0)}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold font-serif text-foreground">{hero.name} {hero.lastName}</h2>
            <p className="text-xs text-primary font-mono tracking-wider uppercase mt-1">Java / Full-Stack Developer</p>
            
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Engineering student at Karpagam Institute of Technology, passionate about back-end logic, API scaling, and design patterns.
            </p>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border">
              <a 
                href={hero.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
                title="GitHub"
              >
                <Github size={18} />
              </a>
              <a 
                href={hero.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href={`mailto:${hero.email}`} 
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
                title="Email"
              >
                <Mail size={18} />
              </a>
              <a 
                href={`tel:${hero.phone}`} 
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
                title="Phone"
              >
                <Phone size={18} />
              </a>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadResume}
              className="w-full mt-6 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Download Resume
            </button>
          </div>
        </motion.div>

        {/* Career Details & Bio */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold font-serif text-foreground flex items-center gap-2 mb-3">
                <Target className="text-primary" size={20} /> Career Objective
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm bg-background/50 p-4 rounded-xl border border-border/50">
                {data.objective || "Motivated and enthusiastic engineering student seeking an entry-level Java / Full-Stack Developer role to build clean, modular, and scalable software solutions."}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold font-serif text-foreground flex items-center gap-2 mb-3">
                <Compass className="text-primary" size={20} /> Who I Am & My Journey
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                {data.bio}
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {data.journey || "My programming roadmap began with core system concepts and has expanded into automated dashboards, REST interfaces, and microservices integrations."}
              </p>
            </div>

            {/* Sub Interests */}
            {data.interests && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Technical Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {data.interests.map(interest => (
                    <span key={interest} className="px-3 py-1 text-xs rounded-full bg-accent text-accent-foreground border border-border">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Statistics Cards */}
      <h2 className="text-2xl font-bold font-serif text-foreground mb-6 text-center md:text-left">
        Key Metrics & <span className="text-primary">Statistics</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
        <div className="bg-card border border-border p-4 rounded-xl text-center">
          <p className="text-3xl font-bold text-primary font-mono">{projectCount}</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Projects Built</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl text-center">
          <p className="text-3xl font-bold text-primary font-mono">{skillsCount}</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Skills Mastered</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl text-center">
          <p className="text-3xl font-bold text-primary font-mono">100%</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Code Quality</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl text-center">
          <p className="text-3xl font-bold text-primary font-mono">3+</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">RDBMS Engines</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl text-center col-span-2 md:col-span-1">
          <p className="text-3xl font-bold text-primary font-mono">2027</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Graduation Year</p>
        </div>
      </div>

      {/* Learning Timeline */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Timeline Log */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold font-serif text-foreground">
            Learning <span className="text-primary">Timeline</span>
          </h2>
          <div className="relative border-l border-border pl-6 space-y-8 py-2 ml-2">
            {data.learningTimeline ? (
              data.learningTimeline.map((item, idx) => (
                <div key={item.title + idx} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <div className="text-xs font-mono font-bold text-primary">{item.date}</div>
                  <h4 className="font-bold text-foreground text-base mt-1">{item.title}</h4>
                  <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Learning logs will appear here.</p>
            )}
          </div>
        </div>

        {/* Academic Card */}
        <div className="md:col-span-1 space-y-6">
          <h2 className="text-2xl font-bold font-serif text-foreground">
            Academic <span className="text-primary">Summary</span>
          </h2>
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <GraduationCap className="text-primary" size={32} />
            {education.length > 0 ? (
              <div>
                <h4 className="font-bold text-foreground">{education[0].college}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {education[0].degree}{education[0].department ? ` – ${education[0].department}` : ""}
                </p>
                {education[0].cgpa && (
                  <p className="text-xs font-mono text-primary font-bold mt-1">CGPA: {education[0].cgpa}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">Duration: {education[0].duration}</p>
              </div>
            ) : (
              <div>
                <h4 className="font-bold text-foreground">Karpagam Institute of Technology</h4>
                <p className="text-xs text-muted-foreground mt-1">B.Tech – Information Technology</p>
                <p className="text-xs font-mono text-primary font-bold mt-1">CGPA: 8.2 / 10.0</p>
                <p className="text-xs text-muted-foreground mt-2">Expected Graduation: 2027</p>
              </div>
            )}
            
            <div className="pt-4 border-t border-border">
              <Link 
                to="/education" 
                className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:gap-2.5 transition-all"
              >
                View Detailed Education <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
