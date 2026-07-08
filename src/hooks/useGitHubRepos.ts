import { useQuery } from "@tanstack/react-query";

const fetchRepos = async (username: string) => {
  if (!username) return [];
  const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=50`);
  if (!res.ok) {
    throw new Error(res.statusText || "Failed to fetch repositories.");
  }
  return res.json();
};

export const useGitHubRepos = (username: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["githubRepos", username],
    queryFn: () => fetchRepos(username),
    enabled: enabled && !!username,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
};
