import { PortfolioData, generatePortfolioCodeFile } from "./portfolioData";

const REPO_OWNER = "Mr-Vishnu-145";
const REPO_NAME = "Portfolio";
const FILE_PATH = "src/lib/portfolioData.ts";

const toBase64 = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)));
};

/**
 * Pushes updated portfolioData.ts directly to GitHub repository using GitHub Contents API
 */
export const pushPortfolioToGitHub = async (
  data: PortfolioData,
  token?: string
): Promise<{ success: boolean; message: string }> => {
  const authToken = token || import.meta.env.VITE_GITHUB_TOKEN || localStorage.getItem("github_access_token") || "";

  if (!authToken) {
    return {
      success: false,
      message: "GitHub Personal Access Token is required to push live to GitHub repository."
    };
  }

  const newCode = generatePortfolioCodeFile(data);
  const base64Content = toBase64(newCode);

  try {
    // Step 1: Get existing file SHA from master branch
    const getRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=master`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    let currentSha = "";
    if (getRes.ok) {
      const getJson = await getRes.json();
      currentSha = getJson.sha;
    }

    // Step 2: PUT updated file content to GitHub repo on master branch
    const putRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Update portfolio content via Admin Panel",
        content: base64Content,
        sha: currentSha || undefined,
        branch: "master",
      }),
    });

    if (putRes.ok) {
      return {
        success: true,
        message: "Committed and pushed updated portfolio code to GitHub successfully!"
      };
    } else {
      const errJson = await putRes.json();
      return {
        success: false,
        message: errJson.message || "Failed to commit changes to GitHub."
      };
    }
  } catch (error) {
    console.error("GitHub API sync error:", error);
    return {
      success: false,
      message: (error as Error).message || "Network error while connecting to GitHub API."
    };
  }
};
