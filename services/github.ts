
import { RepoInfo, FileContent } from '../types';

/**
 * Parses a GitHub URL into owner, repo, and optional branch.
 */
export const parseGitHubUrl = (url: string): RepoInfo | null => {
  try {
    const cleanUrl = url.replace(/\/$/, '');
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
  const { owner, repo, branch = 'main' } = info;
  
  // 1. Get the recursive tree
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const response = await fetch(treeUrl);
  
  if (!response.ok) {
    // If 'main' fails, try 'master'
    if (branch === 'main') {
      return fetchRepoContents({ ...info, branch: 'master' });
    }
    throw new Error(`GitHub API error: ${response.statusText}`);
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
