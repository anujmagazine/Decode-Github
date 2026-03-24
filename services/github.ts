
import { RepoInfo, FileContent } from '../types';

/**
 * Parses a GitHub URL into owner, repo, and optional branch.
 */
export const parseGitHubUrl = (url: string): RepoInfo | null => {
  try {
    const cleanUrl = url.trim().replace(/\/$/, '');
    const regex = /github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?/;
    const match = cleanUrl.match(regex);
    if (!match) return null;
    return {
      owner: match[1],
      repo: match[2],
      branch: match[3] || 'main'
    };
  } catch (e) {
    return null;
  }
};

/**
 * Fetches the directory structure and filters for relevant code files.
 */
export const fetchRepoContents = async (info: RepoInfo): Promise<FileContent[]> => {
  const { owner, repo } = info;
  let { branch } = info;

  // 1. Get repo info to find the default branch if not specified
  if (!branch || branch === 'main') {
    try {
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (repoRes.ok) {
        const repoData = await repoRes.json();
        branch = repoData.default_branch || 'main';
      } else if (repoRes.status === 404) {
        throw new Error(`Repository not found: ${owner}/${repo}. Please check for typos (e.g., "Compliant" vs "Complaint") or if the repository is private.`);
      } else if (repoRes.status === 403) {
        throw new Error("GitHub API rate limit exceeded. Please try again later.");
      } else {
        const errorData = await repoRes.json().catch(() => ({}));
        throw new Error(`GitHub API error: ${errorData.message || repoRes.statusText || repoRes.status}`);
      }
    } catch (e: any) {
      if (e.message.includes('GitHub API') || e.message.includes('Repository not found')) throw e;
      // Fallback to 'main' if repo info fetch fails for other reasons
      branch = branch || 'main';
    }
  }
  
  // 2. Get the recursive tree
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const response = await fetch(treeUrl);
  
  if (!response.ok) {
    // If 'main' fails and we haven't tried 'master' yet (and we didn't get branch from API)
    if (branch === 'main' && !info.branch) {
      return fetchRepoContents({ ...info, branch: 'master' });
    }
    
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || response.statusText || response.status;
    
    if (response.status === 404) {
      throw new Error(`Branch "${branch}" not found or repository is private.`);
    }
    if (response.status === 403 && message.includes('rate limit')) {
      throw new Error("GitHub API rate limit exceeded. Please try again later.");
    }
    
    throw new Error(`GitHub API error: ${message}`);
  }

  const data = await response.json();
  const tree = data.tree as any[];

  // Filter for relevant file extensions and exclude common noise
  const excludedDirs = ['node_modules', '.git', 'dist', 'build', 'vendor', 'assets', 'images', 'public'];
  const includedExts = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.cs', '.md', '.json', '.yml', '.yaml'];

  const codeFiles = tree.filter(item => {
    if (item.type !== 'blob') return false;
    const isExcluded = excludedDirs.some(dir => item.path.includes(`${dir}/`));
    const isIncluded = includedExts.some(ext => item.path.endsWith(ext));
    return !isExcluded && isIncluded;
  });

  // Limit file count to prevent hitting context limits or browser memory issues
  // We prioritize root files, README, and core source files
  const prioritizedFiles = codeFiles.sort((a, b) => {
    if (a.path.toLowerCase().includes('readme')) return -1;
    if (b.path.toLowerCase().includes('readme')) return 1;
    if (a.path.split('/').length < b.path.split('/').length) return -1;
    return 0;
  }).slice(0, 100);

  // 2. Fetch contents for each file
  const fileContents: FileContent[] = await Promise.all(
    prioritizedFiles.map(async (file) => {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
        const res = await fetch(rawUrl);
        if (!res.ok) return { path: file.path, content: '', size: 0 };
        const text = await res.text();
        return {
          path: file.path,
          content: text.length > 50000 ? text.substring(0, 50000) + '... [truncated]' : text,
          size: text.length
        };
      } catch (e) {
        return { path: file.path, content: '', size: 0 };
      }
    })
  );

  return fileContents.filter(f => f.content.length > 0);
};
