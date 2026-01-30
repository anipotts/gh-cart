export type FileStatus = 'added' | 'modified' | 'removed' | 'renamed';

export interface PRFile {
  filename: string;
  status: FileStatus;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
  previousFilename?: string;
}

export interface PRData {
  owner: string;
  repo: string;
  number: number;
  title: string;
  baseBranch: string;
  headBranch: string;
  files: PRFile[];
  totalAdditions: number;
  totalDeletions: number;
  state: 'open' | 'closed' | 'merged';
  htmlUrl: string;
}

export interface PRListItem {
  number: number;
  title: string;
  author: string;
  createdAt: string;
  headBranch: string;
  additions: number;
  deletions: number;
  changedFiles: number;
}

export type ApplyAction = 'cherry-pick' | 'branch' | 'patch';
