import React from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectsSection from "@/components/ProjectsSection";
import ExperienceSection from "@/components/ExperienceSection";
import EducationSection from "@/components/EducationSection";
import AchievementsSection from "@/components/AchievementsSection";
import CertificationsSection from "@/components/CertificationsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { getSectionVisibility } from "@/lib/portfolioData";

const Index = () => {
  const data = usePortfolioStore((state) => state.data);
  const visibility = getSectionVisibility(data);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      {visibility.about && <AboutSection />}
      {visibility.skills && <SkillsSection />}
      {visibility.projects && <ProjectsSection />}
      {visibility.experience && <ExperienceSection />}
      {visibility.education && <EducationSection />}
      {visibility.achievements && <AchievementsSection />}
      {visibility.certifications && <CertificationsSection />}
      {visibility.contact && <ContactSection />}
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
