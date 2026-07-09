import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Save, ShieldAlert, Cpu, Award, Edit3, KeyRound
} from "lucide-react";
import { toast } from "sonner";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { ProjectData } from "@/lib/portfolioData";

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const storeData = usePortfolioStore((state) => state.data);
  const updateDataInStore = usePortfolioStore((state) => state.updateData);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_auth") === "true";
    }
    return false;
  });

  const [project, setProject] = useState<ProjectData | undefined>(undefined);
  const [projectFormTab, setProjectFormTab] = useState<"basic" | "timeline" | "context" | "architecture" | "details" | "challenges">("basic");

  // Multi-line list states
  const [projectSecFeaturesInput, setProjectSecFeaturesInput] = useState("");
  const [projectPerfOptsInput, setProjectPerfOptsInput] = useState("");
  const [projectChallengesInput, setProjectChallengesInput] = useState("");
  const [projectSolutionsInput, setProjectSolutionsInput] = useState("");
  const [projectLessonsInput, setProjectLessonsInput] = useState("");

  // Tech & Feature inputs
  const [projectTechInput, setProjectTechInput] = useState("");
  const [projectFeatureInput, setProjectFeatureInput] = useState("");

  // Passcode login state if accessed directly without auth
  const [passcode, setPasscode] = useState("");

  const hashPassword = async (password: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const inputHash = await hashPassword(passcode);
      const savedHash = localStorage.getItem("admin_passcode_hash");
      const defaultHash = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"; // default: admin123

      if (inputHash === (savedHash || defaultHash)) {
        sessionStorage.setItem("admin_auth", "true");
        setIsAuthenticated(true);
        toast.success("Authenticated successfully!");
      } else {
        toast.error("Incorrect passcode.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Authentication failed.");
    }
  };

  useEffect(() => {
    if (isAuthenticated && storeData?.projects) {
      const found = storeData.projects.find(p => p.id === id);
      if (found) {
        setProject(found);
        setProjectSecFeaturesInput((found.securityFeatures || []).join("\n"));
        setProjectPerfOptsInput((found.performanceOptimizations || []).join("\n"));
        setProjectChallengesInput((found.challengesFaced || []).join("\n"));
        setProjectSolutionsInput((found.solutionsImplemented || []).join("\n"));
        setProjectLessonsInput((found.lessonsLearned || []).join("\n"));
      }
    }
  }, [id, storeData, isAuthenticated]);

  const handleSaveProject = () => {
    if (!project) return;

    // Parse textarea multi-lines
    const securityFeatures = projectSecFeaturesInput.split("\n").map(s => s.trim()).filter(Boolean);
    const performanceOptimizations = projectPerfOptsInput.split("\n").map(s => s.trim()).filter(Boolean);
    const challengesFaced = projectChallengesInput.split("\n").map(s => s.trim()).filter(Boolean);
    const solutionsImplemented = projectSolutionsInput.split("\n").map(s => s.trim()).filter(Boolean);
    const lessonsLearned = projectLessonsInput.split("\n").map(s => s.trim()).filter(Boolean);

    const updatedProject: ProjectData = {
      ...project,
      securityFeatures,
      performanceOptimizations,
      challengesFaced,
      solutionsImplemented,
      lessonsLearned,
      featured: !!project.featured
    };

    const updatedProjects = storeData.projects.map(p => p.id === project.id ? updatedProject : p);

    updateDataInStore({
      ...storeData,
      projects: updatedProjects
    });

    toast.success("Project saved successfully!");
    navigate("/admin?tab=projects");
  };

  // Lock Screen view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-card shadow-lg flex flex-col items-center">
          <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
            <KeyRound size={28} />
          </div>
          <h2 className="text-xl font-bold font-serif mb-1 text-center">Admin Access Required</h2>
          <p className="text-xs text-muted-foreground text-center mb-6">
            Please enter your administrator passcode to edit this project.
          </p>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <input
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-center"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="flex-1 py-2 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:bg-accent"
              >
                Back to Admin
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90"
              >
                Unlock Editor
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <ShieldAlert className="text-destructive mx-auto mb-4" size={48} />
        <h2 className="text-xl font-bold font-serif mb-2 text-foreground">Project Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The project with ID "{id}" could not be found or has been removed.
        </p>
        <button
          onClick={() => navigate("/admin?tab=projects")}
          className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90"
        >
          <ArrowLeft size={16} /> Return to Admin Panel
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin?tab=projects")}
            className="p-2 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold font-serif flex items-center gap-2">
              <Edit3 size={18} className="text-primary" /> Edit Project
            </h1>
            <p className="text-xs text-muted-foreground">Editing case study for "{project.title}"</p>
          </div>
        </div>
        <button
          onClick={handleSaveProject}
          className="py-2 px-4 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 flex items-center justify-center gap-1.5 shadow-sm transition-opacity"
        >
          <Save size={16} /> Save Case Study
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-6">
        <div className="flex flex-wrap gap-1 border-b border-border pb-3">
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

        {/* Tab 1: Basic Info */}
        {projectFormTab === "basic" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-semibold">Project Title</label>
                <input
                  type="text"
                  value={project.title || ""}
                  onChange={(e) => setProject({ ...project, title: e.target.value })}
                  placeholder="e.g. Portfolio Builder"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-semibold">Subtitle / Category</label>
                <input
                  type="text"
                  value={project.subtitle || ""}
                  onChange={(e) => setProject({ ...project, subtitle: e.target.value })}
                  placeholder="e.g. Full-Stack Project"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground font-semibold">Description</label>
              <textarea
                value={project.desc || ""}
                onChange={(e) => setProject({ ...project, desc: e.target.value })}
                placeholder="Brief project details..."
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Tech Stack tags */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-muted-foreground font-semibold">Tech Stack Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={projectTechInput}
                    onChange={(e) => setProjectTechInput(e.target.value)}
                    placeholder="e.g. React.js"
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!projectTechInput.trim()) return;
                      const currentTech = project.tech || [];
                      setProject({ ...project, tech: [...currentTech, projectTechInput.trim()] });
                      setProjectTechInput("");
                    }}
                    className="px-3 bg-accent border border-border text-foreground hover:border-primary font-semibold text-xs rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(project.tech || []).map((t, idx) => (
                    <span key={t} className="px-2 py-0.5 text-[10px] font-mono rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      {t}
                      <button
                        type="button"
                        onClick={() => {
                          const list = [...(project.tech || [])];
                          list.splice(idx, 1);
                          setProject({ ...project, tech: list });
                        }}
                        className="font-bold text-xs"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Checklist features */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase text-muted-foreground font-semibold">Core Features Checklist</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={projectFeatureInput}
                    onChange={(e) => setProjectFeatureInput(e.target.value)}
                    placeholder="e.g. Authentication"
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!projectFeatureInput.trim()) return;
                      const currentFeatures = project.features || [];
                      setProject({ ...project, features: [...currentFeatures, projectFeatureInput.trim()] });
                      setProjectFeatureInput("");
                    }}
                    className="px-3 bg-accent border border-border text-foreground hover:border-primary font-semibold text-xs rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1">
                  {(project.features || []).map((f, idx) => (
                    <div key={f} className="text-[10px] text-muted-foreground flex items-center justify-between bg-background p-1.5 border border-border rounded">
                      <span>• {f}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const list = [...(project.features || [])];
                          list.splice(idx, 1);
                          setProject({ ...project, features: list });
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
                value={project.link || ""}
                onChange={(e) => setProject({ ...project, link: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="projectFeatured"
                checked={!!project.featured}
                onChange={(e) => setProject({ ...project, featured: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="projectFeatured" className="text-xs text-muted-foreground cursor-pointer font-semibold">
                Featured Project (Show on Homepage)
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: Timeline & Role */}
        {projectFormTab === "timeline" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-semibold">Status</label>
                <select
                  value={project.status || "Completed"}
                  onChange={(e) => setProject({ ...project, status: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
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
                  value={project.duration || ""}
                  onChange={(e) => setProject({ ...project, duration: e.target.value })}
                  placeholder="e.g. 4 Months"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-semibold">Team Size</label>
                <input
                  type="text"
                  value={project.teamSize || ""}
                  onChange={(e) => setProject({ ...project, teamSize: e.target.value })}
                  placeholder="e.g. Solo Developer"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-semibold">Your Role</label>
                <input
                  type="text"
                  value={project.role || ""}
                  onChange={(e) => setProject({ ...project, role: e.target.value })}
                  placeholder="e.g. Full-Stack Developer"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Problem & Goal */}
        {projectFormTab === "context" && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground font-semibold">Problem Statement</label>
              <textarea
                value={project.problemStatement || ""}
                onChange={(e) => setProject({ ...project, problemStatement: e.target.value })}
                placeholder="Describe the issues that this project solves..."
                rows={5}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground font-semibold">Business Goal & Objectives</label>
              <textarea
                value={project.businessGoal || ""}
                onChange={(e) => setProject({ ...project, businessGoal: e.target.value })}
                placeholder="What did this project achieve?"
                rows={5}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Architecture */}
        {projectFormTab === "architecture" && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground font-semibold">System Architecture Diagram (Text Art)</label>
              <textarea
                value={project.architectureDiagram || ""}
                onChange={(e) => setProject({ ...project, architectureDiagram: e.target.value })}
                placeholder="[React Client] ===> [Spring Boot] ===> [MySQL]"
                rows={8}
                className="w-full p-3 text-xs font-mono rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-tight whitespace-pre"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground font-semibold">Workspace Directory Structure (Text Art)</label>
              <textarea
                value={project.folderStructure || ""}
                onChange={(e) => setProject({ ...project, folderStructure: e.target.value })}
                placeholder="project/&#10;├── src/&#10;└── public/"
                rows={8}
                className="w-full p-3 text-xs font-mono rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-tight whitespace-pre"
              />
            </div>
          </div>
        )}

        {/* Tab 5: Auth & Security */}
        {projectFormTab === "details" && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground font-semibold">Authentication Flow Details</label>
              <textarea
                value={project.authenticationFlow || ""}
                onChange={(e) => setProject({ ...project, authenticationFlow: e.target.value })}
                placeholder="Describe how authentication works..."
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-semibold">Security Implementations (One per line)</label>
                <textarea
                  value={projectSecFeaturesInput}
                  onChange={(e) => setProjectSecFeaturesInput(e.target.value)}
                  placeholder="JWT Web Tokens&#10;Encrypted Passwords"
                  rows={5}
                  className="w-full p-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-semibold">Performance Optimizations (One per line)</label>
                <textarea
                  value={projectPerfOptsInput}
                  onChange={(e) => setProjectPerfOptsInput(e.target.value)}
                  placeholder="Connection Pooling&#10;Asset Bundling"
                  rows={5}
                  className="w-full p-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-semibold">Testing Strategy</label>
                <input
                  type="text"
                  value={project.testingStrategy || ""}
                  onChange={(e) => setProject({ ...project, testingStrategy: e.target.value })}
                  placeholder="Unit testing details"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-semibold">SEO Configurations</label>
                <input
                  type="text"
                  value={project.seoOptimization || ""}
                  onChange={(e) => setProject({ ...project, seoOptimization: e.target.value })}
                  placeholder="SEO tag layouts"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Challenges & Lessons */}
        {projectFormTab === "challenges" && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-semibold">Challenges Faced (One per line)</label>
                <textarea
                  value={projectChallengesInput}
                  onChange={(e) => setProjectChallengesInput(e.target.value)}
                  placeholder="Concurrent transactions..."
                  rows={6}
                  className="w-full p-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-semibold">Solutions Implemented (One per line)</label>
                <textarea
                  value={projectSolutionsInput}
                  onChange={(e) => setProjectSolutionsInput(e.target.value)}
                  placeholder="Used database locks..."
                  rows={6}
                  className="w-full p-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground font-semibold">Key Takeaways & Lessons (One per line)</label>
              <textarea
                value={projectLessonsInput}
                onChange={(e) => setProjectLessonsInput(e.target.value)}
                placeholder="Always scope APIs beforehand..."
                rows={5}
                className="w-full p-3 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Footer controls */}
        <div className="flex gap-2 pt-4 border-t border-border mt-6">
          <button
            type="button"
            onClick={() => navigate("/admin?tab=projects")}
            className="flex-1 py-2 bg-muted text-muted-foreground border border-border rounded-lg font-semibold text-sm hover:bg-accent transition-colors"
          >
            Cancel and Return
          </button>
          <button
            type="button"
            onClick={handleSaveProject}
            className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 flex items-center justify-center gap-1.5 shadow-sm transition-opacity"
          >
            <Save size={16} /> Save Case Study
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProject;
