import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, Save, Plus, Trash2, ShieldAlert, KeyRound,
  User, BookOpen, Cpu, Briefcase, Award, Sparkles,
  GraduationCap, Trophy, FileText, Github, Sun, Moon, MessageSquare, Sliders, Edit3
} from "lucide-react";
import { toast } from "sonner";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  getPortfolioData, savePortfolioData, PortfolioData,
  ProjectData, CertificationData, SkillCategory, SkillItem, AboutHighlight,
  ExperienceData, EducationData, AchievementItem, ResumeData, ContactExtraData,
  getSectionVisibility, SectionVisibility
} from "@/lib/portfolioData";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { useGitHubRepos } from "@/hooks/useGitHubRepos";
import { fetchContactMessages, deleteContactMessage, isTursoActive, ContactMessage } from "@/lib/turso";

const hashPassword = async (password: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

interface GitHubRepo {
  name: string;
  language: string | null;
  description: string | null;
  html_url: string;
}

const getCroppedImg = async (
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<string> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Calculate natural scaling factors (since crop coordinate points are layout-based, not natural pixel dimensions)
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Scale coordinates to the natural image dimensions
  const sourceX = crop.x * scaleX;
  const sourceY = crop.y * scaleY;
  const sourceWidth = crop.width * scaleX;
  const sourceHeight = crop.height * scaleY;

  // Calculate target downscaled dimensions keeping aspect ratio (max size 300px)
  const maxDimension = 300;
  let targetWidth = sourceWidth;
  let targetHeight = sourceHeight;

  if (sourceWidth > maxDimension || sourceHeight > maxDimension) {
    if (sourceWidth > sourceHeight) {
      targetWidth = maxDimension;
      targetHeight = Math.round((sourceHeight / sourceWidth) * maxDimension);
    } else {
      targetHeight = maxDimension;
      targetWidth = Math.round((sourceWidth / sourceHeight) * maxDimension);
    }
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Draw natural dimensions onto canvas downscaled to target size
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return canvas.toDataURL("image/jpeg", 0.8);
};

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_auth") === "true";
    }
    return false;
  });

  const storeData = usePortfolioStore((state) => state.data);
  const storeDbError = usePortfolioStore((state) => state.dbError);
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(storeData);
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "skills" | "projects" | "certifications" | "experience" | "education" | "achievements" | "resume" | "messages" | "visibility" | "security">(() => {
    if (typeof window !== "undefined") {
      const queryParams = new URLSearchParams(window.location.hash.split("?")[1] || window.location.search);
      const tab = queryParams.get("tab");
      if (tab) return tab as any;
    }
    return "hero";
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search || window.location.hash.split("?")[1]);
    const tab = queryParams.get("tab");
    if (tab) {
      setActiveTab(tab as any);
    }
  }, [location.search]);

  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return true; // default to dark mode
    }
    return true;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // Technical Interests input state
  const [newInterestInput, setNewInterestInput] = useState("");

  const handleAddInterest = () => {
    if (!newInterestInput.trim()) return;
    const currentInterests = portfolioData.about.interests || [];
    if (currentInterests.includes(newInterestInput.trim())) {
      toast.warning("Interest already exists!");
      return;
    }
    setPortfolioData({
      ...portfolioData,
      about: {
        ...portfolioData.about,
        interests: [...currentInterests, newInterestInput.trim()]
      }
    });
    setNewInterestInput("");
  };

  const handleRemoveInterest = (index: number) => {
    const currentInterests = [...(portfolioData.about.interests || [])];
    currentInterests.splice(index, 1);
    setPortfolioData({
      ...portfolioData,
      about: {
        ...portfolioData.about,
        interests: currentInterests
      }
    });
  };

  // Profile Image crop states (react-image-crop)
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Center square selection dynamically when image loads
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    imgRef.current = e.currentTarget;

    const size = Math.min(width, height) * 0.8;
    const x = (width - size) / 2;
    const y = (height - size) / 2;

    setCrop({
      unit: "px",
      x,
      y,
      width: size,
      height: size,
    });
  };

  // Avatar upload and remove handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        setCrop({
          unit: "%",
          x: 10,
          y: 10,
          width: 80,
          height: 80,
        });
        setCompletedCrop(null);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setPortfolioData({
      ...portfolioData,
      hero: {
        ...portfolioData.hero,
        avatarUrl: ""
      }
    });
    toast.info("Profile photo removed. Standard initials will be used.");
  };

  const handleSaveCrop = async () => {
    if (!imgRef.current || !completedCrop) {
      toast.warning("Please select a crop area first.");
      return;
    }
    try {
      const croppedBase64 = await getCroppedImg(imgRef.current, completedCrop);
      setPortfolioData({
        ...portfolioData,
        hero: {
          ...portfolioData.hero,
          avatarUrl: croppedBase64
        }
      });
      setIsCropping(false);
      setImageSrc(null);
      toast.success("Profile photo cropped and loaded successfully!");
    } catch (error) {
      console.error("Failed to crop image:", error);
      toast.error("Failed to crop image. Please try another file.");
    }
  };

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);

  const loadMessages = async () => {
    setIsFetchingMessages(true);
    try {
      const list = await fetchContactMessages();
      setMessages(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingMessages(false);
    }
  };

  useEffect(() => {
    loadMessages();

    // Setup polling for messages if Turso is active
    const interval = isTursoActive
      ? setInterval(() => {
          loadMessages();
        }, 10000)
      : undefined;

    // Setup local storage listener fallback for messages
    const handleMessagesUpdate = () => {
      loadMessages();
    };
    window.addEventListener("contactMessagesUpdate", handleMessagesUpdate);

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener("contactMessagesUpdate", handleMessagesUpdate);
    };
  }, []);

  const handleDeleteMessage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const success = await deleteContactMessage(id);
      if (success) {
        toast.success("Message deleted successfully.");
        loadMessages();
      } else {
        toast.error("Failed to delete message.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting message.");
    }
  };

  const visibility = getSectionVisibility(portfolioData);

  const handleToggleSection = (section: keyof SectionVisibility) => {
    const currentVis = getSectionVisibility(portfolioData);
    const updatedVis = {
      ...currentVis,
      [section]: !currentVis[section]
    };
    setPortfolioData({
      ...portfolioData,
      sectionVisibility: updatedVis
    });
    toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} section visibility updated!`);
  };

  useEffect(() => {
    setPortfolioData(storeData);
  }, [storeData]);

  // Debounced auto-save to Zustand store for real-time live database sync
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (JSON.stringify(portfolioData) !== JSON.stringify(storeData)) {
        const success = await usePortfolioStore.getState().updateData(portfolioData);
        if (!success) {
          toast.error("Database auto-save failed! Please verify connection.");
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [portfolioData, storeData]);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // Authentication Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const DEFAULT_HASH = "14cf0ff94aa0774dfb8197dd86dfc8dfc6c08c49fe3216e18390ae0be49825d9";
      const storedHash = localStorage.getItem("admin_passcode_hash") || DEFAULT_HASH;
      const inputHash = await hashPassword(passcode);
      
      if (inputHash === storedHash) {
        sessionStorage.setItem("admin_auth", "true");
        setIsAuthenticated(true);
        toast.success("Authenticated successfully!");
      } else {
        toast.error("Incorrect passcode! Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Authentication failed.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const DEFAULT_HASH = "14cf0ff94aa0774dfb8197dd86dfc8dfc6c08c49fe3216e18390ae0be49825d9";
      const storedHash = localStorage.getItem("admin_passcode_hash") || DEFAULT_HASH;
      
      const currentHash = await hashPassword(currentPass);
      if (currentHash !== storedHash) {
        toast.error("Current passcode is incorrect!");
        return;
      }

      if (newPass.length < 6) {
        toast.error("New passcode must be at least 6 characters long.");
        return;
      }

      if (newPass !== confirmPass) {
        toast.error("New passcodes do not match!");
        return;
      }

      const hashed = await hashPassword(newPass);
      localStorage.setItem("admin_passcode_hash", hashed);
      toast.success("Passcode changed successfully!");
      
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update passcode.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    toast.info("Logged out.");
  };

  // General Save Handler
  const handleSave = async () => {
    const success = await usePortfolioStore.getState().updateData(portfolioData);
    if (success) {
      toast.success("Portfolio changes saved globally to database!");
    } else {
      toast.error("Failed to save changes to the database! Check connection or credentials.");
    }
  };

  // State Updaters
  const updateHero = (field: keyof typeof portfolioData.hero, value: string) => {
    setPortfolioData({
      ...portfolioData,
      hero: {
        ...portfolioData.hero,
        [field]: value
      }
    });
  };

  const updateAboutBio = (value: string) => {
    setPortfolioData({
      ...portfolioData,
      about: {
        ...portfolioData.about,
        bio: value
      }
    });
  };

  const updateAboutHighlight = (index: number, field: keyof AboutHighlight, value: string) => {
    const updatedHighlights = [...portfolioData.about.highlights];
    updatedHighlights[index] = {
      ...updatedHighlights[index],
      [field]: value
    };
    setPortfolioData({
      ...portfolioData,
      about: {
        ...portfolioData.about,
        highlights: updatedHighlights
      }
    });
  };

  // Skills Editor States
  const [editingSkillInfo, setEditingSkillInfo] = useState<{
    catIndex: number;
    skillIndex: number;
  } | null>(null);

  const [skillForm, setSkillForm] = useState({
    categoryIndex: 0,
    name: "",
    level: "Intermediate" as "Beginner" | "Intermediate" | "Advanced" | "Expert",
    percentage: 75,
    description: "",
    usedInProjectsText: ""
  });

  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillForm.name.trim()) {
      toast.error("Skill name is required.");
      return;
    }

    const updatedSkills = [...portfolioData.skills];
    const cat = updatedSkills[skillForm.categoryIndex];
    if (!cat.skillItems) cat.skillItems = [];
    if (!cat.skills) cat.skills = [];

    const skillItem: SkillItem = {
      name: skillForm.name.trim(),
      level: skillForm.level,
      percentage: Number(skillForm.percentage),
      description: skillForm.description.trim(),
      usedInProjects: skillForm.usedInProjectsText
        ? skillForm.usedInProjectsText.split(",").map(p => p.trim()).filter(Boolean)
        : []
    };

    if (editingSkillInfo !== null) {
      const { catIndex, skillIndex } = editingSkillInfo;
      const oldCat = updatedSkills[catIndex];
      if (!oldCat.skillItems) oldCat.skillItems = [];
      if (!oldCat.skills) oldCat.skills = [];

      // If category changed
      if (catIndex !== skillForm.categoryIndex) {
        // Remove from old category
        oldCat.skillItems.splice(skillIndex, 1);
        const nameIdx = oldCat.skills.indexOf(skillForm.name.trim());
        if (nameIdx > -1) {
          oldCat.skills.splice(nameIdx, 1);
        }

        // Add to new category
        cat.skillItems.push(skillItem);
        if (!cat.skills.includes(skillItem.name)) {
          cat.skills.push(skillItem.name);
        }
      } else {
        // Update in place
        oldCat.skillItems[skillIndex] = skillItem;
        // Ensure present in simple list
        if (!oldCat.skills.includes(skillItem.name)) {
          oldCat.skills.push(skillItem.name);
        }
      }
      toast.success("Skill updated successfully!");
    } else {
      // Add new skill
      cat.skillItems.push(skillItem);
      if (!cat.skills.includes(skillItem.name)) {
        cat.skills.push(skillItem.name);
      }
      toast.success("Skill added successfully!");
    }

    setPortfolioData({ ...portfolioData, skills: updatedSkills });

    // Reset Form
    setSkillForm({
      categoryIndex: skillForm.categoryIndex,
      name: "",
      level: "Intermediate",
      percentage: 75,
      description: "",
      usedInProjectsText: ""
    });
    setEditingSkillInfo(null);
  };

  const handleSelectSkillForEdit = (catIndex: number, skillIndex: number) => {
    const cat = portfolioData.skills[catIndex];
    if (!cat) return;

    let skill: SkillItem;
    if (cat.skillItems && cat.skillItems[skillIndex]) {
      skill = cat.skillItems[skillIndex];
    } else {
      const name = cat.skills[skillIndex];
      skill = {
        name,
        level: "Intermediate",
        percentage: 75,
        description: `Practical application of ${name} in engineering laboratory works and project designs.`,
        usedInProjects: []
      };
    }

    setEditingSkillInfo({ catIndex, skillIndex });
    setSkillForm({
      categoryIndex: catIndex,
      name: skill.name,
      level: skill.level,
      percentage: skill.percentage,
      description: skill.description || "",
      usedInProjectsText: (skill.usedInProjects || []).join(", ")
    });

    const element = document.getElementById("admin-skill-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRemoveSkill = (catIndex: number, skillIndex: number) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    const updatedSkills = [...portfolioData.skills];
    const cat = updatedSkills[catIndex];

    if (cat.skillItems && cat.skillItems[skillIndex]) {
      const name = cat.skillItems[skillIndex].name;
      cat.skillItems.splice(skillIndex, 1);
      const nameIdx = cat.skills.indexOf(name);
      if (nameIdx > -1) {
        cat.skills.splice(nameIdx, 1);
      }
    } else {
      cat.skills.splice(skillIndex, 1);
    }

    setPortfolioData({ ...portfolioData, skills: updatedSkills });
    toast.success("Skill deleted successfully.");

    if (editingSkillInfo && editingSkillInfo.catIndex === catIndex && editingSkillInfo.skillIndex === skillIndex) {
      setEditingSkillInfo(null);
      setSkillForm({
        categoryIndex: 0,
        name: "",
        level: "Intermediate",
        percentage: 75,
        description: "",
        usedInProjectsText: ""
      });
    }
  };

  const handleAddSkillCategory = (title: string) => {
    if (!title.trim()) return;
    const newCategory: SkillCategory = { title: title.trim(), skills: [], skillItems: [] };
    setPortfolioData({
      ...portfolioData,
      skills: [...portfolioData.skills, newCategory]
    });
    toast.success("Skill category added!");
  };

  const handleRemoveSkillCategory = (index: number) => {
    if (!confirm("Are you sure you want to delete this category and all its skills?")) return;
    const updatedSkills = [...portfolioData.skills];
    updatedSkills.splice(index, 1);
    setPortfolioData({ ...portfolioData, skills: updatedSkills });
    toast.success("Category deleted successfully.");
  };

  // Projects Handlers
  const [newProject, setNewProject] = useState<Partial<ProjectData>>({
    title: "", subtitle: "", desc: "", link: "", tech: [], features: [], featured: false,
    status: "Completed", duration: "", teamSize: "", role: "",
    problemStatement: "", businessGoal: "", architectureDiagram: "", folderStructure: "",
    authenticationFlow: "", testingStrategy: "", seoOptimization: ""
  });
  const [projectTechInput, setProjectTechInput] = useState("");
  const [projectFeatureInput, setProjectFeatureInput] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectFormTab, setProjectFormTab] = useState<"basic" | "timeline" | "context" | "architecture" | "details" | "challenges">("basic");
  const [projectSecFeaturesInput, setProjectSecFeaturesInput] = useState("");
  const [projectPerfOptsInput, setProjectPerfOptsInput] = useState("");
  const [projectChallengesInput, setProjectChallengesInput] = useState("");
  const [projectSolutionsInput, setProjectSolutionsInput] = useState("");
  const [projectLessonsInput, setProjectLessonsInput] = useState("");

  // GitHub Fetcher State with TanStack Query
  const [ghUsername, setGhUsername] = useState("Mr-Vishnu-145");
  const [shouldFetchRepos, setShouldFetchRepos] = useState(false);
  const { data: ghRepos = [], isFetching, isError, error } = useGitHubRepos(ghUsername, shouldFetchRepos);

  const fetchGitHubRepos = () => {
    if (!ghUsername.trim()) {
      toast.error("Please enter a GitHub username.");
      return;
    }
    setShouldFetchRepos(true);
  };

  useEffect(() => {
    if (shouldFetchRepos && !isFetching) {
      if (isError) {
        toast.error((error as Error)?.message || "Error fetching GitHub repositories.");
      } else if (ghRepos.length > 0) {
        toast.success(`Loaded ${ghRepos.length} repositories successfully!`);
      }
      setShouldFetchRepos(false);
    }
  }, [ghRepos, isFetching, isError, error, shouldFetchRepos]);

  const handlePreloadRepo = (repo: GitHubRepo) => {
    let formattedTitle = repo.name.replace(/[-_]/g, " ");
    formattedTitle = formattedTitle
      .split(" ")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    setNewProject({
      title: formattedTitle,
      subtitle: repo.language ? `GitHub Project (${repo.language})` : "GitHub Project",
      desc: repo.description || "",
      link: repo.html_url,
      tech: repo.language ? [repo.language] : [],
      features: []
    });
    toast.success(`Preloaded ${repo.name}! Check details below.`);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !newProject.desc) {
      toast.error("Please provide at least a title and description.");
      return;
    }

    const securityFeatures = projectSecFeaturesInput.split("\n").map(s => s.trim()).filter(Boolean);
    const performanceOptimizations = projectPerfOptsInput.split("\n").map(s => s.trim()).filter(Boolean);
    const challengesFaced = projectChallengesInput.split("\n").map(s => s.trim()).filter(Boolean);
    const solutionsImplemented = projectSolutionsInput.split("\n").map(s => s.trim()).filter(Boolean);
    const lessonsLearned = projectLessonsInput.split("\n").map(s => s.trim()).filter(Boolean);
    
    if (editingProjectId) {
      const updatedProjects = portfolioData.projects.map((proj) => {
        if (proj.id === editingProjectId) {
          return {
            ...proj,
            ...newProject,
            title: newProject.title || "",
            subtitle: newProject.subtitle || "",
            tech: newProject.tech || [],
            desc: newProject.desc || "",
            features: newProject.features || [],
            link: newProject.link || "#",
            featured: !!newProject.featured,
            status: newProject.status || "Completed",
            duration: newProject.duration || "",
            teamSize: newProject.teamSize || "",
            role: newProject.role || "",
            problemStatement: newProject.problemStatement || "",
            businessGoal: newProject.businessGoal || "",
            architectureDiagram: newProject.architectureDiagram || "",
            folderStructure: newProject.folderStructure || "",
            authenticationFlow: newProject.authenticationFlow || "",
            testingStrategy: newProject.testingStrategy || "",
            seoOptimization: newProject.seoOptimization || "",
            securityFeatures,
            performanceOptimizations,
            challengesFaced,
            solutionsImplemented,
            lessonsLearned,
          };
        }
        return proj;
      });
      setPortfolioData({
        ...portfolioData,
        projects: updatedProjects
      });
      setEditingProjectId(null);
      setNewProject({
        title: "", subtitle: "", desc: "", link: "", tech: [], features: [], featured: false,
        status: "Completed", duration: "", teamSize: "", role: "",
        problemStatement: "", businessGoal: "", architectureDiagram: "", folderStructure: "",
        authenticationFlow: "", testingStrategy: "", seoOptimization: ""
      });
      setProjectSecFeaturesInput("");
      setProjectPerfOptsInput("");
      setProjectChallengesInput("");
      setProjectSolutionsInput("");
      setProjectLessonsInput("");
      toast.success("Project updated successfully!");
    } else {
      const projectToAdd: ProjectData = {
        id: newProject.id || `project-${Date.now()}`,
        title: newProject.title || "New Project",
        subtitle: newProject.subtitle || "Side Project",
        tech: newProject.tech || [],
        desc: newProject.desc || "",
        features: newProject.features || [],
        link: newProject.link || "#",
        featured: !!newProject.featured,
        status: newProject.status || "Completed",
        duration: newProject.duration || "",
        teamSize: newProject.teamSize || "",
        role: newProject.role || "",
        problemStatement: newProject.problemStatement || "",
        businessGoal: newProject.businessGoal || "",
        architectureDiagram: newProject.architectureDiagram || "",
        folderStructure: newProject.folderStructure || "",
        authenticationFlow: newProject.authenticationFlow || "",
        testingStrategy: newProject.testingStrategy || "",
        seoOptimization: newProject.seoOptimization || "",
        securityFeatures,
        performanceOptimizations,
        challengesFaced,
        solutionsImplemented,
        lessonsLearned,
      };
      setPortfolioData({
        ...portfolioData,
        projects: [...portfolioData.projects, projectToAdd]
      });
      setNewProject({
        title: "", subtitle: "", desc: "", link: "", tech: [], features: [], featured: false,
        status: "Completed", duration: "", teamSize: "", role: "",
        problemStatement: "", businessGoal: "", architectureDiagram: "", folderStructure: "",
        authenticationFlow: "", testingStrategy: "", seoOptimization: ""
      });
      setProjectSecFeaturesInput("");
      setProjectPerfOptsInput("");
      setProjectChallengesInput("");
      setProjectSolutionsInput("");
      setProjectLessonsInput("");
      toast.success("Project added to list!");
    }
  };

  const handleRemoveProject = (index: number) => {
    const updatedProjects = [...portfolioData.projects];
    updatedProjects.splice(index, 1);
    setPortfolioData({ ...portfolioData, projects: updatedProjects });
  };

  const handleSelectProjectForEdit = (proj: ProjectData) => {
    setEditingProjectId(proj.id);
    setNewProject({
      id: proj.id,
      title: proj.title,
      subtitle: proj.subtitle,
      desc: proj.desc,
      link: proj.link,
      tech: proj.tech || [],
      features: proj.features || [],
      featured: proj.featured,
      status: proj.status || "Completed",
      duration: proj.duration || "",
      teamSize: proj.teamSize || "",
      role: proj.role || "",
      problemStatement: proj.problemStatement || "",
      businessGoal: proj.businessGoal || "",
      architectureDiagram: proj.architectureDiagram || "",
      folderStructure: proj.folderStructure || "",
      authenticationFlow: proj.authenticationFlow || "",
      testingStrategy: proj.testingStrategy || "",
      seoOptimization: proj.seoOptimization || "",
    });
    setProjectSecFeaturesInput((proj.securityFeatures || []).join("\n"));
    setProjectPerfOptsInput((proj.performanceOptimizations || []).join("\n"));
    setProjectChallengesInput((proj.challengesFaced || []).join("\n"));
    setProjectSolutionsInput((proj.solutionsImplemented || []).join("\n"));
    setProjectLessonsInput((proj.lessonsLearned || []).join("\n"));

    const element = document.getElementById("admin-project-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    toast.info(`Editing "${proj.title}"`);
  };

  // Certifications Handlers
  const [newCert, setNewCert] = useState<Partial<CertificationData>>({
    name: "",
    org: "",
    verifyUrl: "",
    credentialId: "",
    issueDate: "",
    category: "General",
  });
  const [certSkillsText, setCertSkillsText] = useState("");
  const [editingCertIndex, setEditingCertIndex] = useState<number | null>(null);

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.name || !newCert.org) {
      toast.error("Please fill in both certification name and issuing organization.");
      return;
    }
    const targetCerts = [...portfolioData.certifications];
    const skillsArray = certSkillsText.split(",").map(s => s.trim()).filter(Boolean);

    if (editingCertIndex !== null) {
      // Update mode
      const targetId = targetCerts[editingCertIndex]?.id || `cert-${Date.now()}`;
      targetCerts[editingCertIndex] = {
        id: targetId,
        name: newCert.name,
        org: newCert.org,
        verifyUrl: newCert.verifyUrl || "",
        credentialId: newCert.credentialId || "",
        issueDate: newCert.issueDate || "",
        category: newCert.category || "General",
        skillsLearned: skillsArray,
      };
      setPortfolioData({
        ...portfolioData,
        certifications: targetCerts
      });
      setEditingCertIndex(null);
      toast.success("Certification updated successfully!");
    } else {
      // Add mode
      const certToAdd: CertificationData = {
        id: `cert-${Date.now()}`,
        name: newCert.name,
        org: newCert.org,
        verifyUrl: newCert.verifyUrl || "",
        credentialId: newCert.credentialId || "",
        issueDate: newCert.issueDate || "",
        category: newCert.category || "General",
        skillsLearned: skillsArray,
      };
      setPortfolioData({
        ...portfolioData,
        certifications: [...portfolioData.certifications, certToAdd]
      });
      toast.success("Certification added!");
    }
    setNewCert({
      name: "",
      org: "",
      verifyUrl: "",
      credentialId: "",
      issueDate: "",
      category: "General",
    });
    setCertSkillsText("");
  };

  const handleSelectCertForEdit = (index: number) => {
    const cert = portfolioData.certifications[index];
    if (!cert) return;
    setEditingCertIndex(index);
    setNewCert({
      name: cert.name,
      org: cert.org,
      verifyUrl: cert.verifyUrl || "",
      credentialId: cert.credentialId || "",
      issueDate: cert.issueDate || "",
      category: cert.category || "General",
    });
    setCertSkillsText((cert.skillsLearned || []).join(", "));

    const element = document.getElementById("admin-cert-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    toast.info(`Editing certification "${cert.name}"`);
  };

  const handleRemoveCert = (index: number) => {
    const updatedCerts = [...portfolioData.certifications];
    updatedCerts.splice(index, 1);
    setPortfolioData({ ...portfolioData, certifications: updatedCerts });
    if (editingCertIndex === index) {
      setEditingCertIndex(null);
      setNewCert({
        name: "",
        org: "",
        verifyUrl: "",
        credentialId: "",
        issueDate: "",
        category: "General",
      });
      setCertSkillsText("");
    } else if (editingCertIndex !== null && editingCertIndex > index) {
      setEditingCertIndex(editingCertIndex - 1);
    }
  };

  // Experience Handler
  const [newExp, setNewExp] = useState<Partial<ExperienceData>>({
    companyName: "", role: "", duration: "", location: "",
    responsibilities: [], technologiesUsed: [], achievements: [],
    projectsWorkedOn: [], skillsGained: []
  });
  const [expRespText, setExpRespText] = useState("");
  const [expTechText, setExpTechText] = useState("");
  const [expAchText, setExpAchText] = useState("");
  const [expSkillsText, setExpSkillsText] = useState("");

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.companyName || !newExp.role) {
      toast.error("Please provide at least a company name and role.");
      return;
    }
    const expToAdd: ExperienceData = {
      id: `exp-${Date.now()}`,
      companyName: newExp.companyName || "New Company",
      role: newExp.role || "Developer",
      duration: newExp.duration || "Present",
      location: newExp.location || "Remote",
      responsibilities: expRespText.split("\n").map(r => r.trim()).filter(Boolean),
      technologiesUsed: expTechText.split(",").map(t => t.trim()).filter(Boolean),
      achievements: expAchText.split("\n").map(a => a.trim()).filter(Boolean),
      projectsWorkedOn: [],
      skillsGained: expSkillsText.split(",").map(s => s.trim()).filter(Boolean),
    };
    setPortfolioData({
      ...portfolioData,
      experience: [...(portfolioData.experience || []), expToAdd]
    });
    setNewExp({ companyName: "", role: "", duration: "", location: "" });
    setExpRespText("");
    setExpTechText("");
    setExpAchText("");
    setExpSkillsText("");
    toast.success("Experience added!");
  };

  const handleRemoveExperience = (index: number) => {
    const updated = [...(portfolioData.experience || [])];
    updated.splice(index, 1);
    setPortfolioData({ ...portfolioData, experience: updated });
  };

  // Education Handler
  const [newEdu, setNewEdu] = useState<Partial<EducationData>>({
    college: "", degree: "", department: "", duration: "", cgpa: "",
    relevantCoursework: [], projects: [], achievements: [], activities: [], certificates: []
  });
  const [eduCoursesText, setEduCoursesText] = useState("");
  const [eduProjectsList, setEduProjectsList] = useState<string[]>([]);
  const [eduProjectInput, setEduProjectInput] = useState("");
  const [eduAchText, setEduAchText] = useState("");
  const [eduActivitiesList, setEduActivitiesList] = useState<string[]>([]);
  const [eduActivityInput, setEduActivityInput] = useState("");
  const [eduCertificatesList, setEduCertificatesList] = useState<string[]>([]);
  const [eduCertificateInput, setEduCertificateInput] = useState("");
  const [editingEduIndex, setEditingEduIndex] = useState<number | null>(null);

  const handleAddEducation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEdu.college || !newEdu.degree) {
      toast.error("Please provide at least college name and degree.");
      return;
    }
    const targetEduList = [...(portfolioData.education || [])];
    
    if (editingEduIndex !== null) {
      // Update mode
      const targetId = targetEduList[editingEduIndex]?.id || `edu-${Date.now()}`;
      targetEduList[editingEduIndex] = {
        id: targetId,
        college: newEdu.college || "",
        degree: newEdu.degree || "",
        department: newEdu.department || "",
        duration: newEdu.duration || "",
        cgpa: newEdu.cgpa || "",
        relevantCoursework: eduCoursesText.split(",").map(c => c.trim()).filter(Boolean),
        projects: eduProjectsList,
        achievements: eduAchText.split("\n").map(a => a.trim()).filter(Boolean),
        activities: eduActivitiesList,
        certificates: eduCertificatesList,
      };
      setPortfolioData({
        ...portfolioData,
        education: targetEduList
      });
      setEditingEduIndex(null);
      toast.success("Education record updated successfully!");
    } else {
      // Add mode
      const eduToAdd: EducationData = {
        id: `edu-${Date.now()}`,
        college: newEdu.college || "KIT",
        degree: newEdu.degree || "B.Tech",
        department: newEdu.department || "",
        duration: newEdu.duration || "",
        cgpa: newEdu.cgpa || "",
        relevantCoursework: eduCoursesText.split(",").map(c => c.trim()).filter(Boolean),
        projects: eduProjectsList,
        achievements: eduAchText.split("\n").map(a => a.trim()).filter(Boolean),
        activities: eduActivitiesList,
        certificates: eduCertificatesList,
      };
      setPortfolioData({
        ...portfolioData,
        education: [...targetEduList, eduToAdd]
      });
      toast.success("Education added!");
    }

    setNewEdu({ college: "", degree: "", department: "", duration: "", cgpa: "" });
    setEduCoursesText("");
    setEduProjectsList([]);
    setEduProjectInput("");
    setEduAchText("");
    setEduActivitiesList([]);
    setEduActivityInput("");
    setEduCertificatesList([]);
    setEduCertificateInput("");
  };

  const handleSelectEduForEdit = (index: number) => {
    const edu = (portfolioData.education || [])[index];
    if (!edu) return;
    setEditingEduIndex(index);
    setNewEdu({
      college: edu.college,
      degree: edu.degree,
      department: edu.department,
      duration: edu.duration,
      cgpa: edu.cgpa
    });
    setEduCoursesText((edu.relevantCoursework || []).join(", "));
    setEduProjectsList(edu.projects || []);
    setEduProjectInput("");
    setEduAchText((edu.achievements || []).join("\n"));
    setEduActivitiesList(edu.activities || []);
    setEduActivityInput("");
    setEduCertificatesList(edu.certificates || []);
    setEduCertificateInput("");

    const element = document.getElementById("admin-education-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    toast.info(`Editing education record for "${edu.college}"`);
  };

  const handleRemoveEducation = (index: number) => {
    const updated = [...(portfolioData.education || [])];
    updated.splice(index, 1);
    setPortfolioData({ ...portfolioData, education: updated });
    if (editingEduIndex === index) {
      setEditingEduIndex(null);
      setNewEdu({ college: "", degree: "", department: "", duration: "", cgpa: "" });
      setEduCoursesText("");
      setEduProjectsList([]);
      setEduProjectInput("");
      setEduAchText("");
      setEduActivitiesList([]);
      setEduActivityInput("");
      setEduCertificatesList([]);
      setEduCertificateInput("");
    }
  };

  // Achievements Handler
  const [newAch, setNewAch] = useState<Partial<AchievementItem>>({
    title: "", organization: "", date: "", category: "Award", description: "", link: ""
  });

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAch.title || !newAch.organization) {
      toast.error("Please provide at least a title and organization.");
      return;
    }
    const achToAdd: AchievementItem = {
      id: `ach-${Date.now()}`,
      title: newAch.title || "New Achievement",
      organization: newAch.organization || "",
      date: newAch.date || "",
      category: newAch.category || "Award",
      description: newAch.description || "",
      link: newAch.link || ""
    };
    setPortfolioData({
      ...portfolioData,
      achievements: [...(portfolioData.achievements || []), achToAdd]
    });
    setNewAch({ title: "", organization: "", date: "", category: "Award", description: "", link: "" });
    toast.success("Achievement added!");
  };

  const handleRemoveAchievement = (index: number) => {
    const updated = [...(portfolioData.achievements || [])];
    updated.splice(index, 1);
    setPortfolioData({ ...portfolioData, achievements: updated });
  };

  // Resume & Contact Extra Updaters
  const updateResume = (field: keyof ResumeData, value: string) => {
    setPortfolioData({
      ...portfolioData,
      resume: {
        ...portfolioData.resume,
        [field]: value
      }
    });
  };

  const updateContactExtra = (field: keyof ContactExtraData, value: string) => {
    setPortfolioData({
      ...portfolioData,
      contactExtra: {
        ...portfolioData.contactExtra,
        [field]: value
      }
    });
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <KeyRound className="text-primary" size={28} />
            </div>
            <h1 className="text-2xl font-bold font-serif text-foreground">Admin Access</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Enter your passcode to unlock editing panels
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter admin passcode"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Unlock Panels
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border flex justify-between items-center text-xs text-muted-foreground">

            <button
              onClick={() => navigate("/")}
              className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft size={12} /> Back to Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD SCREEN
  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg border border-border hover:border-primary hover:text-primary transition-colors"
              title="Back to Portfolio"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold font-serif flex items-center gap-2 flex-wrap">
                Portfolio Admin Panel
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Active</span>
                {isTursoActive ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-sans font-semibold">
                    Cloud Database (Global)
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-sans font-semibold animate-pulse" title="VITE_TURSO_AUTH_TOKEN is missing. Storing in local sandbox mode.">
                    Local Storage Sandbox
                  </span>
                )}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Modify certificates, skills, projects & bio content</p>
            </div>
          </div>
 
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDark(!dark)}
              className="p-2.5 rounded-lg border border-border text-foreground hover:text-primary hover:border-primary transition-all duration-300 bg-background/50"
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive text-sm font-medium transition-colors"
            >
              Lock Panel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 font-semibold text-sm transition-opacity flex items-center gap-2 shadow-lg"
            >
              <Save size={16} />
              Save Updates
            </button>
          </div>
        </div>
      </header>

      {!isTursoActive && (
        <div className="container mx-auto px-4 mt-6 max-w-5xl animate-fade-in">
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed">
            <span className="p-1 rounded bg-destructive/20 font-bold shrink-0">⚠️ Inactive</span>
            <div>
              <p className="font-bold text-foreground text-sm">Database Credentials Missing</p>
              <p className="mt-1">
                Your database credentials are not configured (<code>VITE_TURSO_AUTH_TOKEN</code> is missing). Local sandbox mode has been disabled. You must configure a database connection in your <code>.env</code> file to save changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {storeDbError && (
        <div className="container mx-auto px-4 mt-6 max-w-5xl animate-fade-in">
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed">
            <span className="p-1 rounded bg-destructive/20 font-bold shrink-0">❌ Database Error</span>
            <div>
              <p className="font-bold text-foreground text-sm">Database Connection Error</p>
              <p className="mt-1 font-mono text-xs">{storeDbError}</p>
              <p className="mt-1">
                Please verify your Turso database credentials inside the <code>.env</code> file, check your connection, and try again.
              </p>
            </div>
          </div>
        </div>
      )}
 
      <div className="container mx-auto px-4 mt-6 max-w-5xl">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Navigation Tabs */}
          <aside className="md:col-span-1 space-y-1">
            <button
              onClick={() => setActiveTab("hero")}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === "hero"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card hover:bg-accent hover:text-foreground text-muted-foreground"
                }`}
            >
              <User size={18} />
              Hero & Contact
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === "about"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card hover:bg-accent hover:text-foreground text-muted-foreground"
                }`}
            >
              <BookOpen size={18} />
              About Me
            </button>
            <button
              onClick={() => setActiveTab("skills")}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === "skills"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card hover:bg-accent hover:text-foreground text-muted-foreground"
                }`}
            >
              <Cpu size={18} />
              Skills
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === "projects"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card hover:bg-accent hover:text-foreground text-muted-foreground"
                }`}
            >
              <Briefcase size={18} />
              Projects
            </button>
            <button
              onClick={() => setActiveTab("certifications")}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === "certifications"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card hover:bg-accent hover:text-foreground text-muted-foreground"
                }`}
            >
              <Award size={18} />
              Certifications
            </button>
            <button
              onClick={() => setActiveTab("experience")}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === "experience"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card hover:bg-accent hover:text-foreground text-muted-foreground"
                }`}
            >
              <Briefcase size={18} />
              Experience
            </button>
            <button
              onClick={() => setActiveTab("education")}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === "education"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card hover:bg-accent hover:text-foreground text-muted-foreground"
                }`}
            >
              <GraduationCap size={18} />
              Education
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === "achievements"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card hover:bg-accent hover:text-foreground text-muted-foreground"
                }`}
            >
              <Trophy size={18} />
              Achievements
            </button>
            <button
              onClick={() => setActiveTab("resume")}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === "resume"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card hover:bg-accent hover:text-foreground text-muted-foreground"
                }`}
            >
              <FileText size={18} />
              Resume & Availability
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between font-medium text-sm transition-all ${activeTab === "messages"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card hover:bg-accent hover:text-foreground text-muted-foreground"
                }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={18} />
                Contact Messages
              </div>
              {messages.length > 0 && (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  activeTab === "messages"
                    ? "bg-primary-foreground text-primary"
                    : "bg-primary text-primary-foreground"
                }`}>
                  {messages.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("visibility")}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === "visibility"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card hover:bg-accent hover:text-foreground text-muted-foreground"
                }`}
            >
              <Sliders size={18} />
              Section Visibility
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium text-sm transition-all ${activeTab === "security"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card hover:bg-accent hover:text-foreground text-muted-foreground"
                }`}
            >
              <KeyRound size={18} />
              Security Settings
            </button>
          </aside>

          {/* Form Content Area */}
          <main className="md:col-span-3 bg-card rounded-2xl border border-border p-6 shadow-sm">
            {/* HERO SECTION FORM */}
            {activeTab === "hero" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-serif pb-3 border-b border-border">Hero & Contact Info</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Name</label>
                    <input
                      type="text"
                      value={portfolioData.hero.name}
                      onChange={(e) => updateHero("name", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Name</label>
                    <input
                      type="text"
                      value={portfolioData.hero.lastName}
                      onChange={(e) => updateHero("lastName", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hero Subtitle / Description</label>
                  <textarea
                    value={portfolioData.hero.description}
                    onChange={(e) => updateHero("description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground">Social & Contact Links</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">GitHub URL</label>
                      <input
                        type="url"
                        value={portfolioData.hero.github}
                        onChange={(e) => updateHero("github", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">LinkedIn URL</label>
                      <input
                        type="url"
                        value={portfolioData.hero.linkedin}
                        onChange={(e) => updateHero("linkedin", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Email Address</label>
                      <input
                        type="email"
                        value={portfolioData.hero.email}
                        onChange={(e) => updateHero("email", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="name@example.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Phone Number</label>
                      <input
                        type="text"
                        value={portfolioData.hero.phone || ""}
                        onChange={(e) => updateHero("phone", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="+91-9500861022"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT SECTION FORM */}
            {activeTab === "about" && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold font-serif pb-3 border-b border-border">About Me Management</h2>

                {/* Profile Image Upload & Crop */}
                <div className="bg-card border border-border p-5 rounded-xl space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    Profile Image
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Visual Avatar Preview */}
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary/20 to-accent-foreground/20 border border-primary/20 flex items-center justify-center overflow-hidden relative group shrink-0">
                      {portfolioData.hero.avatarUrl ? (
                        <img 
                          src={portfolioData.hero.avatarUrl} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold font-serif text-primary">
                          {portfolioData.hero.name.charAt(0)}{portfolioData.hero.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-center sm:text-left">
                      <p className="text-xs text-muted-foreground">
                        Upload a photo. You can crop and zoom it in the editor. Optimized size (300x300 px) will be saved.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <label className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                          Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {portfolioData.hero.avatarUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 text-xs font-semibold rounded-lg hover:bg-destructive/20 transition-colors"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Career Objective */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-muted-foreground font-semibold">Career Objective</label>
                  <textarea
                    value={portfolioData.about.objective || ""}
                    onChange={(e) => setPortfolioData({
                      ...portfolioData,
                      about: { ...portfolioData.about, objective: e.target.value }
                    })}
                    rows={3}
                    placeholder="Enter your career objective..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed text-sm"
                  />
                </div>

                {/* Biography */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-muted-foreground font-semibold">Who I Am (Bio Paragraph)</label>
                  <textarea
                    value={portfolioData.about.bio}
                    onChange={(e) => setPortfolioData({
                      ...portfolioData,
                      about: { ...portfolioData.about, bio: e.target.value }
                    })}
                    rows={5}
                    placeholder="Enter your bio..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed text-sm"
                  />
                </div>

                {/* Journey */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-muted-foreground font-semibold">My Journey (Details)</label>
                  <textarea
                    value={portfolioData.about.journey || ""}
                    onChange={(e) => setPortfolioData({
                      ...portfolioData,
                      about: { ...portfolioData.about, journey: e.target.value }
                    })}
                    rows={4}
                    placeholder="Describe your roadmap and programming journey..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed text-sm"
                  />
                </div>

                {/* Technical Interests (Tags Style) */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-muted-foreground font-semibold block">Technical Interests</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newInterestInput}
                      onChange={(e) => setNewInterestInput(e.target.value)}
                      placeholder="e.g. Distributed Systems"
                      className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInterest();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddInterest}
                      className="px-3 bg-accent border border-border text-foreground hover:border-primary font-semibold text-xs rounded-lg font-sans shrink-0"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(portfolioData.about.interests || []).map((interest, i) => (
                      <span key={i} className="px-2 py-0.5 text-[10px] font-mono rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                        {interest}
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(i)}
                          className="font-bold text-xs"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    {(portfolioData.about.interests || []).length === 0 && (
                      <span className="text-[10px] text-muted-foreground italic pl-1">None added yet</span>
                    )}
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground">Bio Highlights</h3>
                  <div className="grid gap-4">
                    {portfolioData.about.highlights.map((highlight, index) => (
                      <div key={highlight.title} className="p-4 rounded-xl bg-background border border-border space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold uppercase text-primary tracking-wider">{highlight.title}</span>
                        </div>
                        <div className="grid gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase text-muted-foreground">Highlight Name</label>
                            <input
                              type="text"
                              value={highlight.title}
                              onChange={(e) => updateAboutHighlight(index, "title", e.target.value)}
                              className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase text-muted-foreground">Highlight Details (newlines supported)</label>
                            <textarea
                              value={highlight.desc}
                              onChange={(e) => updateAboutHighlight(index, "desc", e.target.value)}
                              rows={3}
                              className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SKILLS SECTION FORM */}
            {activeTab === "skills" && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold font-serif pb-3 border-b border-border">Manage Skills & Expertise</h2>

                {/* Skill Details Form */}
                <form id="admin-skill-form" onSubmit={handleSaveSkill} className="bg-background border border-border p-5 rounded-xl space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Plus size={18} className="text-primary" /> {editingSkillInfo !== null ? "Edit Skill Details" : "Add Detailed Skill"}
                    </span>
                    {editingSkillInfo !== null && (
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                        Editing Mode
                      </span>
                    )}
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-muted-foreground font-semibold">Skill Category</label>
                      <select
                        value={skillForm.categoryIndex}
                        onChange={(e) => setSkillForm({ ...skillForm, categoryIndex: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {portfolioData.skills.map((cat, idx) => (
                          <option key={cat.title + idx} value={idx}>{cat.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-muted-foreground font-semibold">Skill Name</label>
                      <input
                        type="text"
                        value={skillForm.name}
                        onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                        placeholder="e.g. Java, React.js"
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-muted-foreground font-semibold">Proficiency Level</label>
                      <select
                        value={skillForm.level}
                        onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value as any })}
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold text-muted-foreground">
                        <label>Mastery Percentage</label>
                        <span className="text-primary font-mono">{skillForm.percentage}%</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={skillForm.percentage}
                          onChange={(e) => setSkillForm({ ...skillForm, percentage: Number(e.target.value) })}
                          className="flex-1 accent-primary bg-muted rounded-lg h-2 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-muted-foreground font-semibold">Skill Description (Keep brief, fits in card)</label>
                    <textarea
                      value={skillForm.description}
                      onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                      placeholder="e.g. Object-oriented concepts, multithreading, collections, streams..."
                      rows={2}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-muted-foreground font-semibold">Applied In Projects</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1 max-h-36 overflow-y-auto p-1.5 bg-muted/30 border border-border rounded-lg">
                      {portfolioData.projects.map((proj) => {
                        const projectsList = skillForm.usedInProjectsText.split(",").map(p => p.trim()).filter(Boolean);
                        const isChecked = projectsList.includes(proj.title);
                        return (
                          <label key={proj.id} className="flex items-center gap-1.5 p-1.5 rounded bg-card border border-border/60 hover:border-primary/30 cursor-pointer text-[10px] truncate select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                let list = [...projectsList];
                                if (e.target.checked) {
                                  if (!list.includes(proj.title)) list.push(proj.title);
                                } else {
                                  list = list.filter(p => p !== proj.title);
                                }
                                setSkillForm({ ...skillForm, usedInProjectsText: list.join(", ") });
                              }}
                              className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <span className="truncate">{proj.title}</span>
                          </label>
                        );
                      })}
                    </div>
                    <input
                      type="text"
                      value={skillForm.usedInProjectsText}
                      onChange={(e) => setSkillForm({ ...skillForm, usedInProjectsText: e.target.value })}
                      placeholder="Or type custom project names (comma separated)..."
                      className="w-full mt-2 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="flex gap-2">
                    {editingSkillInfo !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSkillInfo(null);
                          setSkillForm({
                            categoryIndex: 0,
                            name: "",
                            level: "Intermediate",
                            percentage: 75,
                            description: "",
                            usedInProjectsText: ""
                          });
                          toast.info("Edit cancelled.");
                        }}
                        className="flex-1 py-2 bg-muted text-muted-foreground border border-border rounded-lg font-semibold text-xs hover:bg-accent transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-xs hover:opacity-90 flex items-center justify-center gap-1.5 transition-opacity"
                    >
                      {editingSkillInfo !== null ? <Save size={14} /> : <Plus size={14} />}
                      {editingSkillInfo !== null ? "Update Skill" : "Add Skill"}
                    </button>
                  </div>
                </form>

                {/* Add Category Widget */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const input = form.elements.namedItem("categoryTitle") as HTMLInputElement;
                    handleAddSkillCategory(input.value);
                    input.value = "";
                  }}
                  className="flex gap-2 items-end bg-background p-4 rounded-xl border border-border text-xs"
                >
                  <div className="flex-1 space-y-1">
                    <label className="text-muted-foreground font-semibold">Create New Skill Category</label>
                    <input
                      name="categoryTitle"
                      type="text"
                      placeholder="e.g. Cloud & DevOps"
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 flex items-center gap-1 shrink-0"
                  >
                    <Plus size={14} /> Create Category
                  </button>
                </form>

                {/* Display Current Categories and Skills */}
                <div className="space-y-6 pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground font-serif">Logged Skills Matrix ({portfolioData.skills.length} Categories)</h3>
                  <div className="space-y-4">
                    {portfolioData.skills.map((category, catIdx) => {
                      const items = category.skillItems || [];
                      const itemNames = new Set(items.map(i => i.name));
                      
                      const displayItems: SkillItem[] = [
                        ...items,
                        ...category.skills
                          .filter(name => !itemNames.has(name))
                          .map(name => ({
                            name,
                            level: "Intermediate" as const,
                            percentage: 75,
                            description: `Practical application of ${name} in engineering laboratory works and project designs.`,
                            usedInProjects: []
                          }))
                      ];

                      return (
                        <div key={category.title + catIdx} className="p-4 rounded-xl bg-background border border-border space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b border-border">
                            <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                              <span className="w-1.5 h-3 bg-primary rounded-full" /> {category.title} ({displayItems.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkillCategory(catIdx)}
                              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                              title="Delete Category"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {displayItems.map((skill, skillIdx) => {
                              const isEditingThis = editingSkillInfo !== null && 
                                                   editingSkillInfo.catIndex === catIdx && 
                                                   editingSkillInfo.skillIndex === skillIdx;
                              return (
                                <div 
                                  key={skill.name + skillIdx} 
                                  className={`p-3 rounded-lg border transition-all flex flex-col justify-between gap-2 shadow-sm ${
                                    isEditingThis 
                                      ? "bg-primary/5 border-primary ring-1 ring-primary"
                                      : "bg-card border-border/80 hover:border-primary/20"
                                  }`}
                                >
                                  <div>
                                    <div className="flex justify-between items-start gap-2">
                                      <div>
                                        <span className="font-bold text-xs text-foreground block">{skill.name}</span>
                                        <span className="text-[9px] text-primary font-mono font-bold bg-primary/10 px-1.5 py-0.5 rounded inline-block mt-0.5">{skill.level}</span>
                                      </div>
                                      <span className="text-xs font-mono font-bold text-muted-foreground shrink-0">{skill.percentage}%</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2 leading-normal">
                                      {skill.description}
                                    </p>
                                    {skill.usedInProjects && skill.usedInProjects.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {skill.usedInProjects.map(p => (
                                          <span key={p} className="text-[8px] font-mono px-1 py-0.2 bg-muted text-muted-foreground border border-border rounded">
                                            {p}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex justify-end gap-1.5 border-t border-border/50 pt-2 mt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSelectSkillForEdit(catIdx, skillIdx)}
                                      className="p-1 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                                      title="Edit Skill Details"
                                    >
                                      <Edit3 size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSkill(catIdx, skillIdx)}
                                      className="p-1 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                                      title="Delete Skill"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                            {displayItems.length === 0 && (
                              <p className="text-xs text-muted-foreground italic col-span-2">No skills in this category yet. Use the form above to add one.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PROJECTS SECTION FORM */}
            {activeTab === "projects" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-serif pb-3 border-b border-border">Manage Projects</h2>

                {/* GitHub Preloader Widget */}
                <div className="bg-background border border-border p-5 rounded-xl space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Github size={18} className="text-primary" /> Fetch from GitHub
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans">
                    Enter your GitHub username to list your public repositories and click one to automatically preload the project form.
                  </p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ghUsername}
                      onChange={(e) => setGhUsername(e.target.value)}
                      placeholder="GitHub Username"
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                    />
                    <button
                      type="button"
                      onClick={fetchGitHubRepos}
                      disabled={isFetching}
                      className="px-4 py-1.5 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      {isFetching ? "Fetching..." : "Fetch Repos"}
                    </button>
                  </div>

                  {ghRepos.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Select a Repository to Preload ({ghRepos.length} found)
                      </label>
                      <div className="max-h-48 overflow-y-auto border border-border rounded-lg divide-y divide-border bg-card/50">
                        {ghRepos.map((repo) => (
                          <button
                            key={repo.id}
                            type="button"
                            onClick={() => handlePreloadRepo(repo)}
                            className="w-full text-left p-3 hover:bg-accent hover:text-accent-foreground transition-all flex justify-between items-start gap-4"
                          >
                            <div className="space-y-1">
                              <span className="font-semibold text-xs text-foreground block">{repo.name}</span>
                              {repo.description && (
                                <p className="text-[10px] text-muted-foreground line-clamp-1">{repo.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {repo.language && (
                                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[9px] font-mono text-primary border border-primary/10">
                                  {repo.language}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground">★ {repo.stargazers_count}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Add New Project Form */}
                <div id="admin-project-form" className="bg-background border border-border p-5 rounded-xl space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    {editingProjectId ? (
                      <>
                        <Sparkles size={18} className="text-primary animate-pulse" /> Edit Project: <span className="text-primary font-bold">{newProject.title}</span>
                      </>
                    ) : (
                      <>
                        <Plus size={18} className="text-primary" /> Add New Project
                      </>
                    )}
                  </h3>

                  {/* Form Sub-Tabs Navigation */}
                  <div className="flex flex-wrap gap-1 border-b border-border pb-2">
                    {[
                      { id: "basic", label: "Basic Info" },
                      { id: "timeline", label: "Timeline & Role" },
                      { id: "context", label: "Problem & Goal" },
                      { id: "architecture", label: "Architecture" },
                      { id: "details", label: "Auth & Security" },
                      { id: "challenges", label: "Challenges & Lessons" }
                    ].map(subTab => (
                      <button
                        key={subTab.id}
                        type="button"
                        onClick={() => setProjectFormTab(subTab.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          projectFormTab === subTab.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        {subTab.label}
                      </button>
                    ))}
                  </div>

                  {/* Sub-Tab 1: Basic Info */}
                  {projectFormTab === "basic" && (
                    <div className="space-y-4 pt-2">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">Project Title</label>
                          <input
                            type="text"
                            value={newProject.title || ""}
                            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                            placeholder="e.g. Portfolio Builder"
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">Subtitle / Category</label>
                          <input
                            type="text"
                            value={newProject.subtitle || ""}
                            onChange={(e) => setNewProject({ ...newProject, subtitle: e.target.value })}
                            placeholder="e.g. Full-Stack Project"
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground font-semibold">Description</label>
                        <textarea
                          value={newProject.desc || ""}
                          onChange={(e) => setNewProject({ ...newProject, desc: e.target.value })}
                          placeholder="Brief project details..."
                          rows={2}
                          className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {/* Tech List */}
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">Tech Stack Tags</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={projectTechInput}
                              onChange={(e) => setProjectTechInput(e.target.value)}
                              placeholder="e.g. React.js"
                              className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!projectTechInput.trim()) return;
                                const currentTech = newProject.tech || [];
                                setNewProject({ ...newProject, tech: [...currentTech, projectTechInput.trim()] });
                                setProjectTechInput("");
                              }}
                              className="px-3 bg-accent border border-border text-foreground hover:border-primary font-semibold text-xs rounded-lg"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(newProject.tech || []).map((t, idx) => (
                              <span key={t} className="px-2 py-0.5 text-[10px] font-mono rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                                {t}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = [...(newProject.tech || [])];
                                    list.splice(idx, 1);
                                    setNewProject({ ...newProject, tech: list });
                                  }}
                                  className="font-bold text-xs"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Features List */}
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">Core Features Checklist</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={projectFeatureInput}
                              onChange={(e) => setProjectFeatureInput(e.target.value)}
                              placeholder="e.g. Authentication"
                              className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!projectFeatureInput.trim()) return;
                                const currentFeatures = newProject.features || [];
                                setNewProject({ ...newProject, features: [...currentFeatures, projectFeatureInput.trim()] });
                                setProjectFeatureInput("");
                              }}
                              className="px-3 bg-accent border border-border text-foreground hover:border-primary font-semibold text-xs rounded-lg"
                            >
                              Add
                            </button>
                          </div>
                          <div className="space-y-1">
                            {(newProject.features || []).map((f, idx) => (
                              <div key={f} className="text-[10px] text-muted-foreground flex items-center justify-between bg-card p-1 border border-border rounded">
                                <span>• {f}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const list = [...(newProject.features || [])];
                                    list.splice(idx, 1);
                                    setNewProject({ ...newProject, features: list });
                                  }}
                                  className="text-destructive font-bold px-1"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground font-semibold">Project Repository URL / Live Link</label>
                        <input
                          type="url"
                          value={newProject.link || ""}
                          onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                          placeholder="https://github.com/..."
                          className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          id="projectFeatured"
                          checked={!!newProject.featured}
                          onChange={(e) => setNewProject({ ...newProject, featured: e.target.checked })}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                        />
                        <label htmlFor="projectFeatured" className="text-xs text-muted-foreground cursor-pointer font-semibold">
                          Featured Project (Show on Homepage)
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Sub-Tab 2: Timeline & Role */}
                  {projectFormTab === "timeline" && (
                    <div className="space-y-4 pt-2 animate-fade-in">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">Status</label>
                          <select
                            value={newProject.status || "Completed"}
                            onChange={(e) => setNewProject({ ...newProject, status: e.target.value as any })}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="Completed">Completed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Planned">Planned</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">Timeline / Duration</label>
                          <input
                            type="text"
                            value={newProject.duration || ""}
                            onChange={(e) => setNewProject({ ...newProject, duration: e.target.value })}
                            placeholder="e.g. 4 Months or Jan 2025 - May 2025"
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">Team Size</label>
                          <input
                            type="text"
                            value={newProject.teamSize || ""}
                            onChange={(e) => setNewProject({ ...newProject, teamSize: e.target.value })}
                            placeholder="e.g. Solo Developer or Team of 3"
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">Your Role</label>
                          <input
                            type="text"
                            value={newProject.role || ""}
                            onChange={(e) => setNewProject({ ...newProject, role: e.target.value })}
                            placeholder="e.g. Lead Full-Stack Developer"
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-Tab 3: Problem & Goal */}
                  {projectFormTab === "context" && (
                    <div className="space-y-4 pt-2 animate-fade-in">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground font-semibold">Problem Statement</label>
                        <textarea
                          value={newProject.problemStatement || ""}
                          onChange={(e) => setNewProject({ ...newProject, problemStatement: e.target.value })}
                          placeholder="Describe the business/user issues that this project solves..."
                          rows={4}
                          className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground font-semibold">Business Goal & Objectives</label>
                        <textarea
                          value={newProject.businessGoal || ""}
                          onChange={(e) => setNewProject({ ...newProject, businessGoal: e.target.value })}
                          placeholder="What did this project set out to achieve?"
                          rows={4}
                          className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  )}

                  {/* Sub-Tab 4: Architecture */}
                  {projectFormTab === "architecture" && (
                    <div className="space-y-4 pt-2 animate-fade-in">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground font-semibold">System Architecture Diagram (Text Art)</label>
                        <textarea
                          value={newProject.architectureDiagram || ""}
                          onChange={(e) => setNewProject({ ...newProject, architectureDiagram: e.target.value })}
                          placeholder="Draw a text-based system diagram, e.g.:&#10;[React Client] ===> [Spring Boot] ===> [MySQL]"
                          rows={6}
                          className="w-full p-3 text-xs font-mono rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-tight whitespace-pre"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground font-semibold">Workspace Directory Structure (Text Art)</label>
                        <textarea
                          value={newProject.folderStructure || ""}
                          onChange={(e) => setNewProject({ ...newProject, folderStructure: e.target.value })}
                          placeholder="Provide files directory layout tree, e.g.:&#10;project/&#10;├── frontend/&#10;└── backend/"
                          rows={6}
                          className="w-full p-3 text-xs font-mono rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-tight whitespace-pre"
                        />
                      </div>
                    </div>
                  )}

                  {/* Sub-Tab 5: Auth & Security */}
                  {projectFormTab === "details" && (
                    <div className="space-y-4 pt-2 animate-fade-in">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground font-semibold">Authentication Flow Details</label>
                        <textarea
                          value={newProject.authenticationFlow || ""}
                          onChange={(e) => setNewProject({ ...newProject, authenticationFlow: e.target.value })}
                          placeholder="Describe how authentication and authorizations work (e.g. JWT session cookies, standard PIN check...)"
                          rows={2}
                          className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">Security Implementations (One per line)</label>
                          <textarea
                            value={projectSecFeaturesInput}
                            onChange={(e) => setProjectSecFeaturesInput(e.target.value)}
                            placeholder="Spring Security JWT token authentication&#10;BCrypt encrypted passwords&#10;SQL injection parameter bindings"
                            rows={4}
                            className="w-full p-3 text-xs font-sans rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">Performance Optimizations (One per line)</label>
                          <textarea
                            value={projectPerfOptsInput}
                            onChange={(e) => setProjectPerfOptsInput(e.target.value)}
                            placeholder="HikariCP database connection pooling&#10;Dynamic bundles splitting and code caching&#10;Tables index queries tuning"
                            rows={4}
                            className="w-full p-3 text-xs font-sans rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">Testing Strategy</label>
                          <input
                            type="text"
                            value={newProject.testingStrategy || ""}
                            onChange={(e) => setNewProject({ ...newProject, testingStrategy: e.target.value })}
                            placeholder="e.g. Unit tests with JUnit & Mockito"
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">SEO Configurations</label>
                          <input
                            type="text"
                            value={newProject.seoOptimization || ""}
                            onChange={(e) => setNewProject({ ...newProject, seoOptimization: e.target.value })}
                            placeholder="e.g. Structured tag layouts and robot indexing headers"
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-Tab 6: Challenges & Lessons */}
                  {projectFormTab === "challenges" && (
                    <div className="space-y-4 pt-2 animate-fade-in">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">Challenges Faced (One per line)</label>
                          <textarea
                            value={projectChallengesInput}
                            onChange={(e) => setProjectChallengesInput(e.target.value)}
                            placeholder="Managing concurrent stock updates&#10;Query response speed constraints"
                            rows={5}
                            className="w-full p-3 text-xs font-sans rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-muted-foreground font-semibold">Solutions Implemented (One per line)</label>
                          <textarea
                            value={projectSolutionsInput}
                            onChange={(e) => setProjectSolutionsInput(e.target.value)}
                            placeholder="Applied database pessimistic locking&#10;Constructed cached SQL database tables"
                            rows={5}
                            className="w-full p-3 text-xs font-sans rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground font-semibold">Key Takeaways & Lessons (One per line)</label>
                        <textarea
                          value={projectLessonsInput}
                          onChange={(e) => setProjectLessonsInput(e.target.value)}
                          placeholder="Always design API formats beforehand&#10;React error boundaries secure client states"
                          rows={4}
                          className="w-full p-3 text-xs font-sans rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {/* Save/Cancel Controls */}
                  <div className="flex gap-2 pt-2 border-t border-border mt-4">
                    {editingProjectId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProjectId(null);
                          setNewProject({
                            title: "", subtitle: "", desc: "", link: "", tech: [], features: [], featured: false,
                            status: "Completed", duration: "", teamSize: "", role: "",
                            problemStatement: "", businessGoal: "", architectureDiagram: "", folderStructure: "",
                            authenticationFlow: "", testingStrategy: "", seoOptimization: ""
                          });
                          setProjectSecFeaturesInput("");
                          setProjectPerfOptsInput("");
                          setProjectChallengesInput("");
                          setProjectSolutionsInput("");
                          setProjectLessonsInput("");
                          toast.info("Edit cancelled.");
                        }}
                        className="flex-1 py-2 bg-muted text-muted-foreground border border-border rounded-lg font-semibold text-sm hover:bg-accent transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      onClick={handleAddProject}
                      className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 flex items-center justify-center gap-1.5 transition-opacity"
                    >
                      {editingProjectId ? <Save size={16} /> : <Plus size={16} />}
                      {editingProjectId ? "Update Project" : "Add Project to Portfolio"}
                    </button>
                  </div>
                </div>

                {/* Projects List */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground">Current Projects ({portfolioData.projects.length})</h3>
                  <div className="grid gap-3">
                    {portfolioData.projects.map((proj, idx) => (
                      <div
                        key={proj.title + idx}
                        onClick={() => navigate(`/admin/edit-project/${proj.id}`)}
                        className="p-4 rounded-xl bg-background border border-border hover:border-primary/50 hover:shadow-sm transition-all flex justify-between items-center gap-4 cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-foreground text-sm truncate">{proj.title}</h4>
                            {proj.featured && (
                              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[9px] font-mono text-primary font-semibold border border-primary/20 shrink-0">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-mono truncate">{proj.subtitle}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{proj.desc}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const list = [...portfolioData.projects];
                              list[idx] = { ...list[idx], featured: !list[idx].featured };
                              setPortfolioData({ ...portfolioData, projects: list });
                            }}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                              proj.featured
                                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                : "bg-muted text-muted-foreground border-border hover:bg-accent"
                            }`}
                          >
                            {proj.featured ? "★ Featured" : "Standard"}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/edit-project/${proj.id}`);
                            }}
                            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors shrink-0"
                            title="Edit Project"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveProject(idx);
                            }}
                            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
                            title="Delete Project"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CERTIFICATIONS SECTION FORM */}
            {activeTab === "certifications" && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold font-serif pb-3 border-b border-border">Manage Certifications</h2>

                {/* Add/Edit Certificate Form */}
                <form id="admin-cert-form" onSubmit={handleAddCert} className="bg-background border border-border p-5 rounded-xl space-y-4 shadow-sm">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    {editingCertIndex !== null ? <Edit3 size={18} className="text-primary" /> : <Plus size={18} className="text-primary" />}
                    {editingCertIndex !== null ? "Edit Certification Details" : "Add Certification"}
                  </h3>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold">Certification Name</label>
                    <input
                      type="text"
                      value={newCert.name}
                      onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                      placeholder="e.g. AWS Certified Solutions Architect"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold">Issuing Organization</label>
                    <input
                      type="text"
                      value={newCert.org}
                      onChange={(e) => setNewCert({ ...newCert, org: e.target.value })}
                      placeholder="e.g. AWS Academy / Udemy"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Credential ID (Optional)</label>
                      <input
                        type="text"
                        value={newCert.credentialId || ""}
                        onChange={(e) => setNewCert({ ...newCert, credentialId: e.target.value })}
                        placeholder="e.g. AWS-SEC-12345"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Issue Date (Optional)</label>
                      <input
                        type="text"
                        value={newCert.issueDate || ""}
                        onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                        placeholder="e.g. June 2024"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Category</label>
                      <select
                        value={newCert.category || "General"}
                        onChange={(e) => setNewCert({ ...newCert, category: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-background"
                      >
                        <option value="General">General</option>
                        <option value="Cloud">Cloud</option>
                        <option value="Programming">Programming</option>
                        <option value="Database">Database</option>
                        <option value="Testing">Testing</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Skills Learned (Comma-separated)</label>
                      <input
                        type="text"
                        value={certSkillsText}
                        onChange={(e) => setCertSkillsText(e.target.value)}
                        placeholder="e.g. React, Tailwind CSS, Node.js"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 border-t border-border pt-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Verification Method</label>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-muted-foreground block font-semibold">Option A: Paste Verification URL</label>
                      <input
                        type="url"
                        value={newCert.verifyUrl && !newCert.verifyUrl.startsWith("data:") ? newCert.verifyUrl : ""}
                        onChange={(e) => setNewCert({ ...newCert, verifyUrl: e.target.value })}
                        placeholder="https://verify.org/badge/123..."
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase text-muted-foreground block font-semibold">Option B: Upload Certificate File (PDF or Image)</label>
                      <div className="flex items-center gap-3">
                        <label className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                          Upload Document File
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.addEventListener("load", () => {
                                  setNewCert({ ...newCert, verifyUrl: reader.result as string });
                                  toast.success(`"${file.name}" uploaded successfully!`);
                                });
                                reader.readAsDataURL(file);
                              }
                              e.target.value = ""; // Reset value to support selecting same file again
                            }}
                            className="hidden"
                          />
                        </label>
                        {newCert.verifyUrl && newCert.verifyUrl.startsWith("data:") && (
                          <div className="text-[10px] text-primary font-mono font-bold flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded border border-primary/25">
                            <span>✅ Document loaded ({newCert.verifyUrl.startsWith("data:application/pdf") ? "PDF" : "Image"})</span>
                            <button
                              type="button"
                              onClick={() => setNewCert({ ...newCert, verifyUrl: "" })}
                              className="text-destructive font-bold text-xs hover:opacity-85"
                            >
                              &times;
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">Accepts image files or PDF documents. The document will load into the database for immediate offline previews.</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 flex items-center justify-center gap-1.5"
                    >
                      {editingCertIndex !== null ? <Save size={16} /> : <Plus size={16} />}
                      {editingCertIndex !== null ? "Save Changes" : "Add Certification"}
                    </button>
                    {editingCertIndex !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCertIndex(null);
                          setNewCert({
                            name: "",
                            org: "",
                            verifyUrl: "",
                            credentialId: "",
                            issueDate: "",
                            category: "General",
                          });
                          setCertSkillsText("");
                          toast.info("Editing cancelled.");
                        }}
                        className="px-4 py-2.5 border border-border text-muted-foreground hover:bg-accent rounded-lg font-semibold text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Certificates List */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground font-serif">Current Certifications ({portfolioData.certifications.length})</h3>
                  <div className="grid gap-3">
                    {portfolioData.certifications.map((c, idx) => (
                      <div key={c.name + idx} className="p-4 rounded-xl bg-background border border-border flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm hover:border-primary/50 transition-all">
                        <div className="space-y-2 flex-1">
                          <div>
                            <span className="font-semibold text-foreground text-sm block">{c.name}</span>
                            <span className="text-xs text-muted-foreground font-medium">{c.org}</span>
                          </div>

                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground font-mono">
                            {c.credentialId && (
                              <span>ID: <span className="text-foreground font-bold">{c.credentialId}</span></span>
                            )}
                            {c.issueDate && (
                              <span>Date: <span className="text-foreground font-bold">{c.issueDate}</span></span>
                            )}
                            {c.category && (
                              <span className="px-1.5 py-0.5 rounded bg-accent text-accent-foreground font-bold uppercase text-[8px] tracking-wider border border-border w-fit">
                                {c.category}
                              </span>
                            )}
                          </div>

                          {c.skillsLearned && c.skillsLearned.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {c.skillsLearned.map(t => (
                                <span key={t} className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-primary/5 text-primary border border-primary/10">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {c.verifyUrl && (
                            <span className="text-[10px] text-primary block mt-1.5 font-mono bg-primary/5 px-2 py-0.5 rounded border border-primary/10 w-fit">
                              {c.verifyUrl.startsWith("data:") 
                                ? (c.verifyUrl.startsWith("data:application/pdf") ? "📄 Attached PDF Certificate" : "🖼️ Attached Image Certificate")
                                : `🔗 External Link: ${c.verifyUrl.substring(0, 45)}...`}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleSelectCertForEdit(idx)}
                            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors shrink-0"
                            title="Edit Certificate"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCert(idx)}
                            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                            title="Delete Certificate"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {portfolioData.certifications.length === 0 && (
                      <p className="text-xs text-muted-foreground italic text-center py-6 bg-card border border-dashed rounded-xl">No certifications added yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* EXPERIENCE TAB FORM */}
            {activeTab === "experience" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-serif pb-3 border-b border-border">Manage Experience</h2>

                <form onSubmit={handleAddExperience} className="bg-background border border-border p-5 rounded-xl space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Plus size={18} className="text-primary" /> Add Experience Item
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Company Name</label>
                      <input
                        type="text"
                        value={newExp.companyName}
                        onChange={(e) => setNewExp({ ...newExp, companyName: e.target.value })}
                        placeholder="e.g. Acme Labs"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Role / Position</label>
                      <input
                        type="text"
                        value={newExp.role}
                        onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                        placeholder="e.g. Intern Developer"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Duration</label>
                      <input
                        type="text"
                        value={newExp.duration}
                        onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                        placeholder="e.g. Jan 2025 - Present"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Location</label>
                      <input
                        type="text"
                        value={newExp.location}
                        onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                        placeholder="e.g. Coimbatore, Remote"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold">Responsibilities (one per line)</label>
                    <textarea
                      value={expRespText}
                      onChange={(e) => setExpRespText(e.target.value)}
                      placeholder="Designed core Spring Boot controllers...&#10;Integrated React views..."
                      rows={3}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold">Key Achievements (one per line)</label>
                    <textarea
                      value={expAchText}
                      onChange={(e) => setExpAchText(e.target.value)}
                      placeholder="Reduced page latency by 30%...&#10;Secured databases schema authorization rules..."
                      rows={2}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Technologies (comma separated)</label>
                      <input
                        type="text"
                        value={expTechText}
                        onChange={(e) => setExpTechText(e.target.value)}
                        placeholder="Java, Spring Boot, React"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Skills Gained (comma separated)</label>
                      <input
                        type="text"
                        value={expSkillsText}
                        onChange={(e) => setExpSkillsText(e.target.value)}
                        placeholder="REST APIs, Clean Code, Git workflows"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-xs hover:opacity-90 flex items-center justify-center gap-1"
                  >
                    <Plus size={14} /> Add Experience Item
                  </button>
                </form>

                {/* List items */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground font-serif">Logged Experiences ({(portfolioData.experience || []).length})</h3>
                  <div className="grid gap-2">
                    {(portfolioData.experience || []).map((exp, idx) => (
                      <div key={exp.companyName + idx} className="p-3 rounded-lg bg-background border border-border flex justify-between items-center gap-4">
                        <div>
                          <span className="font-medium text-foreground text-sm block">{exp.role}</span>
                          <span className="text-xs text-muted-foreground">{exp.companyName} | {exp.duration}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                          title="Delete Experience"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* EDUCATION TAB FORM */}
            {activeTab === "education" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-serif pb-3 border-b border-border">Manage Education</h2>

                <form id="admin-education-form" onSubmit={handleAddEducation} className="bg-background border border-border p-5 rounded-xl space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Plus size={18} className="text-primary" /> {editingEduIndex !== null ? "Edit Education Institution" : "Add Education Institution"}
                    </span>
                    {editingEduIndex !== null && (
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                        Editing Mode
                      </span>
                    )}
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">College / University</label>
                      <input
                        type="text"
                        value={newEdu.college}
                        onChange={(e) => setNewEdu({ ...newEdu, college: e.target.value })}
                        placeholder="e.g. Karpagam Institute of Tech"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Degree & Branch</label>
                      <input
                        type="text"
                        value={newEdu.degree}
                        onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                        placeholder="e.g. B.Tech IT"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Department</label>
                      <input
                        type="text"
                        value={newEdu.department}
                        onChange={(e) => setNewEdu({ ...newEdu, department: e.target.value })}
                        placeholder="Information Technology"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Duration</label>
                      <input
                        type="text"
                        value={newEdu.duration}
                        onChange={(e) => setNewEdu({ ...newEdu, duration: e.target.value })}
                        placeholder="e.g. 2023 - 2027"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">CGPA / Percentage</label>
                      <input
                        type="text"
                        value={newEdu.cgpa}
                        onChange={(e) => setNewEdu({ ...newEdu, cgpa: e.target.value })}
                        placeholder="e.g. 8.2 / 10.0"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold">Coursework (comma separated)</label>
                    <input
                      type="text"
                      value={eduCoursesText}
                      onChange={(e) => setEduCoursesText(e.target.value)}
                      placeholder="Data Structures, DBMS, Java OOP"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold">Key Achievements (one per line)</label>
                    <textarea
                      value={eduAchText}
                      onChange={(e) => setEduAchText(e.target.value)}
                      placeholder="Ranked top 10% of the class...&#10;Coding Club coordinator..."
                      rows={2}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    {/* Academic Projects (add one by one) */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase text-muted-foreground font-semibold">Academic Projects</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={eduProjectInput}
                          onChange={(e) => setEduProjectInput(e.target.value)}
                          placeholder="e.g. ERP portal"
                          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (eduProjectInput.trim()) {
                                setEduProjectsList([...eduProjectsList, eduProjectInput.trim()]);
                                setEduProjectInput("");
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (eduProjectInput.trim()) {
                              setEduProjectsList([...eduProjectsList, eduProjectInput.trim()]);
                              setEduProjectInput("");
                            }
                          }}
                          className="px-3 bg-accent border border-border text-foreground hover:border-primary font-semibold text-xs rounded-lg font-sans"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {eduProjectsList.map((proj, i) => (
                          <span key={i} className="px-2 py-0.5 text-[10px] font-mono rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                            {proj}
                            <button
                              type="button"
                              onClick={() => setEduProjectsList(eduProjectsList.filter((_, idx) => idx !== i))}
                              className="font-bold text-xs"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                        {eduProjectsList.length === 0 && (
                          <span className="text-[10px] text-muted-foreground italic pl-1">None added yet</span>
                        )}
                      </div>
                    </div>

                    {/* Activities (add one by one) */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase text-muted-foreground font-semibold">Activities</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={eduActivityInput}
                          onChange={(e) => setEduActivityInput(e.target.value)}
                          placeholder="e.g. Coding Club"
                          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (eduActivityInput.trim()) {
                                setEduActivitiesList([...eduActivitiesList, eduActivityInput.trim()]);
                                setEduActivityInput("");
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (eduActivityInput.trim()) {
                              setEduActivitiesList([...eduActivitiesList, eduActivityInput.trim()]);
                              setEduActivityInput("");
                            }
                          }}
                          className="px-3 bg-accent border border-border text-foreground hover:border-primary font-semibold text-xs rounded-lg font-sans"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {eduActivitiesList.map((act, i) => (
                          <span key={i} className="px-2 py-0.5 text-[10px] font-mono rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                            {act}
                            <button
                              type="button"
                              onClick={() => setEduActivitiesList(eduActivitiesList.filter((_, idx) => idx !== i))}
                              className="font-bold text-xs"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                        {eduActivitiesList.length === 0 && (
                          <span className="text-[10px] text-muted-foreground italic pl-1">None added yet</span>
                        )}
                      </div>
                    </div>

                    {/* Certificates (add one by one) */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase text-muted-foreground font-semibold">Certificates</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={eduCertificateInput}
                          onChange={(e) => setEduCertificateInput(e.target.value)}
                          placeholder="e.g. AWS Academy"
                          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (eduCertificateInput.trim()) {
                                setEduCertificatesList([...eduCertificatesList, eduCertificateInput.trim()]);
                                setEduCertificateInput("");
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (eduCertificateInput.trim()) {
                              setEduCertificatesList([...eduCertificatesList, eduCertificateInput.trim()]);
                              setEduCertificateInput("");
                            }
                          }}
                          className="px-3 bg-accent border border-border text-foreground hover:border-primary font-semibold text-xs rounded-lg font-sans"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {eduCertificatesList.map((cert, i) => (
                          <span key={i} className="px-2 py-0.5 text-[10px] font-mono rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                            {cert}
                            <button
                              type="button"
                              onClick={() => setEduCertificatesList(eduCertificatesList.filter((_, idx) => idx !== i))}
                              className="font-bold text-xs"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                        {eduCertificatesList.length === 0 && (
                          <span className="text-[10px] text-muted-foreground italic pl-1">None added yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {editingEduIndex !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEduIndex(null);
                          setNewEdu({ college: "", degree: "", department: "", duration: "", cgpa: "" });
                          setEduCoursesText("");
                          setEduProjectsList([]);
                          setEduProjectInput("");
                          setEduAchText("");
                          setEduActivitiesList([]);
                          setEduActivityInput("");
                          setEduCertificatesList([]);
                          setEduCertificateInput("");
                          toast.info("Edit cancelled.");
                        }}
                        className="flex-1 py-2 bg-muted text-muted-foreground border border-border rounded-lg font-semibold text-xs hover:bg-accent transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-xs hover:opacity-90 flex items-center justify-center gap-1.5 transition-opacity"
                    >
                      {editingEduIndex !== null ? <Save size={14} /> : <Plus size={14} />}
                      {editingEduIndex !== null ? "Update Record" : "Add Education Record"}
                    </button>
                  </div>
                </form>

                {/* Logged Education records */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground font-serif">Logged Education ({(portfolioData.education || []).length})</h3>
                  <div className="grid gap-2">
                    {(portfolioData.education || []).map((edu, idx) => (
                      <div
                        key={edu.college + idx}
                        onClick={() => handleSelectEduForEdit(idx)}
                        className={`p-3 rounded-lg bg-background border transition-all flex justify-between items-center gap-4 cursor-pointer ${
                          editingEduIndex === idx
                            ? "border-primary ring-1 ring-primary shadow-sm bg-primary/5"
                            : "border-border hover:border-primary/50 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground text-sm block truncate">{edu.college}</span>
                          <span className="text-xs text-muted-foreground truncate block">{edu.degree} | {edu.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectEduForEdit(idx);
                            }}
                            className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                            title="Edit Record"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveEducation(idx);
                            }}
                            className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ACHIEVEMENTS TAB FORM */}
            {activeTab === "achievements" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-serif pb-3 border-b border-border">Manage Achievements</h2>

                <form onSubmit={handleAddAchievement} className="bg-background border border-border p-5 rounded-xl space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Plus size={18} className="text-primary" /> Add Achievement / Honor
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Title</label>
                      <input
                        type="text"
                        value={newAch.title}
                        onChange={(e) => setNewAch({ ...newAch, title: e.target.value })}
                        placeholder="e.g. Smart India Hackathon Finalist"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Issuing Organization</label>
                      <input
                        type="text"
                        value={newAch.organization}
                        onChange={(e) => setNewAch({ ...newAch, organization: e.target.value })}
                        placeholder="e.g. Karpagam Institute of Tech"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Date / Period</label>
                      <input
                        type="text"
                        value={newAch.date}
                        onChange={(e) => setNewAch({ ...newAch, date: e.target.value })}
                        placeholder="e.g. Sep 2024"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-semibold">Category</label>
                      <select
                        value={newAch.category}
                        onChange={(e) => setNewAch({ ...newAch, category: e.target.value as AchievementItem["category"] })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-card text-foreground"
                      >
                        <option value="Award">Award</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Contest">Contest</option>
                        <option value="Contribution">Contribution</option>
                        <option value="Leadership">Leadership</option>
                        <option value="Volunteer">Volunteer</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold">Description</label>
                    <textarea
                      value={newAch.description}
                      onChange={(e) => setNewAch({ ...newAch, description: e.target.value })}
                      placeholder="Brief details about the reward or your role..."
                      rows={2}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold">Reference Link / Proof URL (Optional)</label>
                    <input
                      type="url"
                      value={newAch.link}
                      onChange={(e) => setNewAch({ ...newAch, link: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-xs hover:opacity-90 flex items-center justify-center gap-1"
                  >
                    <Plus size={14} /> Add Achievement
                  </button>
                </form>

                {/* Logged Achievements */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground font-serif">Current Achievements ({(portfolioData.achievements || []).length})</h3>
                  <div className="grid gap-2">
                    {(portfolioData.achievements || []).map((ach, idx) => (
                      <div key={ach.title + idx} className="p-3 rounded-lg bg-background border border-border flex justify-between items-center gap-4">
                        <div>
                          <span className="font-medium text-foreground text-sm block">{ach.title}</span>
                          <span className="text-xs text-muted-foreground">{ach.category} | {ach.organization}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAchievement(idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                          title="Delete Achievement"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* RESUME & AVAILABILITY TAB FORM */}
            {activeTab === "resume" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-serif pb-3 border-b border-border">Resume & Availability</h2>

                {/* Resume URLs */}
                <div className="space-y-4 p-4 rounded-xl bg-background border border-border">
                  <h3 className="font-semibold text-foreground font-serif text-sm">Resume Settings</h3>
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-muted-foreground font-semibold">Resume PDF URL Path (Relative or Absolute)</label>
                      <input
                        type="text"
                        value={portfolioData.resume?.resumeUrl || ""}
                        onChange={(e) => updateResume("resumeUrl", e.target.value)}
                        placeholder="/Portfolio/resume.pdf"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-muted-foreground font-semibold font-semibold">ATS Plain-Text Resume Content</label>
                      <textarea
                        value={portfolioData.resume?.atsContent || ""}
                        onChange={(e) => updateResume("atsContent", e.target.value)}
                        placeholder="Paste plain text resume summary..."
                        rows={10}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground font-mono text-[10px] leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Extra details */}
                <div className="space-y-4 p-4 rounded-xl bg-background border border-border">
                  <h3 className="font-semibold text-foreground font-serif text-sm">Availability Settings</h3>
                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-muted-foreground font-semibold">Availability Status</label>
                      <input
                        type="text"
                        value={portfolioData.contactExtra?.availability || ""}
                        onChange={(e) => updateContactExtra("availability", e.target.value)}
                        placeholder="Open to roles..."
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-muted-foreground font-semibold">Response Speed</label>
                      <input
                        type="text"
                        value={portfolioData.contactExtra?.responseTime || ""}
                        onChange={(e) => updateContactExtra("responseTime", e.target.value)}
                        placeholder="Within 24 hours..."
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-muted-foreground font-semibold">Location / Relocation</label>
                      <input
                        type="text"
                        value={portfolioData.contactExtra?.location || ""}
                        onChange={(e) => updateContactExtra("location", e.target.value)}
                        placeholder="Coimbatore, Tamil Nadu..."
                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB FORM */}
            {activeTab === "security" && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <h2 className="text-xl font-bold font-serif pb-3 border-b border-border">Security Settings</h2>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Passcode</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Enter current passcode"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Passcode</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Enter new passcode (min. 6 characters)"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm New Passcode</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Confirm new passcode"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Update Passcode
                </button>
              </form>
            )}

            {/* MESSAGES TAB */}
            {activeTab === "messages" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <h2 className="text-xl font-bold font-serif">Contact Messages</h2>
                  <button
                    onClick={loadMessages}
                    disabled={isFetchingMessages}
                    className="text-xs text-primary hover:underline font-semibold disabled:opacity-50"
                  >
                    {isFetchingMessages ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                {messages.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <p className="text-muted-foreground text-sm">No messages received yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-3 relative group">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-bold text-foreground text-sm">{msg.name}</h4>
                            <a
                              href={`mailto:${msg.email}`}
                              className="text-xs text-primary hover:underline font-semibold"
                            >
                              {msg.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded hover:bg-destructive/10"
                              title="Delete Message"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {msg.subject && (
                          <div className="text-xs font-semibold text-foreground bg-accent/50 px-2.5 py-1 rounded-md inline-block">
                            Subject: {msg.subject}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECTION VISIBILITY TAB */}
            {activeTab === "visibility" && (
              <div className="space-y-6">
                <div className="pb-3 border-b border-border">
                  <h2 className="text-xl font-bold font-serif">Section Visibility Settings</h2>
                  <p className="text-xs text-muted-foreground mt-1">Control which sections are displayed in the main navigation menu and on the portfolio homepage.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {(Object.keys(visibility) as Array<keyof SectionVisibility>).map((sec) => (
                    <div
                      key={sec}
                      onClick={() => handleToggleSection(sec)}
                      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between group ${
                        visibility[sec]
                          ? "bg-primary/5 border-primary shadow-sm"
                          : "bg-card border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-sm capitalize">{sec} Section</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {visibility[sec] ? "Currently visible on portfolio" : "Currently hidden from portfolio"}
                        </p>
                      </div>
                      <div className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-300 shrink-0 ${
                        visibility[sec] ? "bg-primary" : "bg-muted"
                      }`}>
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${
                          visibility[sec] ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Cropper Modal Overlay */}
      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-scale-in max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card shrink-0">
              <h3 className="font-bold text-foreground text-base">Crop Profile Picture</h3>
              <button
                type="button"
                onClick={() => {
                  setIsCropping(false);
                  setImageSrc(null);
                }}
                className="text-muted-foreground hover:text-foreground font-bold text-xl"
              >
                &times;
              </button>
            </div>

            {/* Cropper Container */}
            <div className="relative w-full bg-background/50 flex justify-center items-center p-6 flex-1 min-h-[200px] overflow-visible touch-none">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Source"
                  className="max-w-full max-h-[350px] md:max-h-[380px] object-contain block select-none"
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-border bg-card shrink-0">
              <p className="text-xs text-muted-foreground mb-4">
                Drag the crop circle's corners to resize, or drag from the center to reposition the crop area.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCropping(false);
                    setImageSrc(null);
                  }}
                  className="px-4 py-2 border border-border text-muted-foreground hover:bg-accent rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCrop}
                  className="px-5 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-xl text-sm font-semibold transition-opacity"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
