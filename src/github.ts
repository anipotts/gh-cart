import { execSync } from 'node:child_process';
import type { PRData, PRFile, PRListItem } from './types.js';

/**
 * All GitHub API calls go through `gh api` — zero auth management.
 * The gh CLI handles tokens, SSO, and Enterprise Server automatically.
 */

function gh(args: string): string {
  return execSync(`gh ${args}`, { encoding: 'utf-8' }).trim();
}

function ghApi(endpoint: string): unknown {
  const raw = gh(`api ${endpoint}`);
  return JSON.parse(raw);
}

export function checkAuth(): boolean {
  try {
    gh('auth status');
    return true;
  } catch {
    return false;
  }
}

export function getRepoInfo(): { owner: string; repo: string } | null {
  try {
    const raw = gh('repo view --json owner,name');
    const data = JSON.parse(raw) as { owner: { login: string }; name: string };
    return { owner: data.owner.login, repo: data.name };
  } catch {
    return null;
  }
}

export function listOpenPRs(owner: string, repo: string): PRListItem[] {
  const raw = gh(
    `pr list --repo ${owner}/${repo} --state open --json number,title,author,createdAt,headRefName,additions,deletions,changedFiles --limit 20`
  );
  const items = JSON.parse(raw) as Array<{
    number: number;
    title: string;
    author: { login: string };
    createdAt: string;
    headRefName: string;
    additions: number;
    deletions: number;
    changedFiles: number;
  }>;

  return items.map((item) => ({
    number: item.number,
    title: item.title,
    author: item.author.login,
    createdAt: item.createdAt,
    headBranch: item.headRefName,
    additions: item.additions,
    deletions: item.deletions,
    changedFiles: item.changedFiles,
  }));
}

export function fetchPR(owner: string, repo: string, number: number): PRData {
  const prRaw = gh(
    `pr view ${number} --repo ${owner}/${repo} --json number,title,baseRefName,headRefName,additions,deletions,state,url`
  );
  const pr = JSON.parse(prRaw) as {
    number: number;
    title: string;
    baseRefName: string;
    headRefName: string;
    additions: number;
    deletions: number;
    state: string;
    url: string;
  };

  // Fetch files via REST API (gh pr view doesn't include file list)
  const filesRaw = ghApi(
    `/repos/${owner}/${repo}/pulls/${number}/files?per_page=100`
  ) as Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
    previous_filename?: string;
  }>;

  const files: PRFile[] = filesRaw.map((f) => ({
    filename: f.filename,
    status: f.status as PRFile['status'],
    additions: f.additions,
    deletions: f.deletions,
    changes: f.changes,
    patch: f.patch,
    previousFilename: f.previous_filename,
  }));

  return {
    owner,
    repo,
    number: pr.number,
    title: pr.title,
    baseBranch: pr.baseRefName,
    headBranch: pr.headRefName,
    files,
    totalAdditions: pr.additions,
    totalDeletions: pr.deletions,
    state: pr.state as PRData['state'],
    htmlUrl: pr.url,
  };
}

/**
 * Parse a GitHub PR URL into its parts.
 * Accepts: https://github.com/owner/repo/pull/123
 */
export function parsePRUrl(
  url: string
): { owner: string; repo: string; number: number } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (match) {
    return {
      owner: match[1],
      repo: match[2],
      number: parseInt(match[3], 10),
    };
  }
  return null;
}
