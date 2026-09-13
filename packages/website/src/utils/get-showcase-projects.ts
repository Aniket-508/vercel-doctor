import {
  GITHUB_STARS_REVALIDATE_SECONDS,
  SHOWCASE_PROJECTS,
} from "@/constants/showcase";

interface GitHubStargazerCountResponse {
  count: number;
}

const GITHUB_API_REPOSITORIES_URL = "https://api.github.com/repos";
const GITHUB_REQUEST_HEADERS = new Headers({
  Accept: "application/vnd.github+json",
  "User-Agent": "vercel-doctor-showcase",
  "X-GitHub-Api-Version": "2026-03-10",
});

if (process.env.GITHUB_TOKEN) {
  GITHUB_REQUEST_HEADERS.set(
    "Authorization",
    `Bearer ${process.env.GITHUB_TOKEN}`,
  );
}

export const getShowcaseProjects = async () => {
  const projectsWithStars = await Promise.all(
    SHOWCASE_PROJECTS.map(async (project) => {
      try {
        const response = await fetch(
          `${GITHUB_API_REPOSITORIES_URL}/${project.githubRepository}/stargazers/count`,
          {
            headers: GITHUB_REQUEST_HEADERS,
            next: { revalidate: GITHUB_STARS_REVALIDATE_SECONDS },
          },
        );

        if (!response.ok) {
          throw new Error(`GitHub API returned ${response.status}`);
        }

        const stargazerCount: GitHubStargazerCountResponse =
          await response.json();
        const stars = Number.isInteger(stargazerCount.count)
          ? stargazerCount.count
          : null;

        return { ...project, stars };
      } catch {
        return { ...project, stars: null };
      }
    }),
  );

  return projectsWithStars.toSorted(
    (leftProject, rightProject) =>
      (rightProject.stars ?? -1) - (leftProject.stars ?? -1),
  );
};
