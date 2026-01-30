import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PRData, PRFile } from './types.js';

export function isGitRepo(): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function getCurrentBranch(): string {
  return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
}

/**
 * Generate a unified patch from selected files.
 */
export function generatePatch(pr: PRData, selectedFiles: Set<string>): string {
  const patches = pr.files
    .filter((f) => selectedFiles.has(f.filename) && f.patch)
    .map((f) => formatFilePatch(f));

  return patches.join('\n');
}

function formatFilePatch(file: PRFile): string {
  const lines: string[] = [
    `diff --git a/${file.filename} b/${file.filename}`,
  ];

  if (file.status === 'added') {
    lines.push('new file mode 100644');
  } else if (file.status === 'removed') {
    lines.push('deleted file mode 100644');
  }

  const aPath =
    file.status === 'added' ? '/dev/null' : `a/${file.filename}`;
  const bPath =
    file.status === 'removed' ? '/dev/null' : `b/${file.filename}`;

  lines.push(`--- ${aPath}`);
  lines.push(`+++ ${bPath}`);
  lines.push(file.patch!);

  return lines.join('\n');
}

/**
 * Save patch to a file and return the path.
 */
export function savePatch(
  pr: PRData,
  selectedFiles: Set<string>
): string {
  const patch = generatePatch(pr, selectedFiles);
  const filename = `pr-${pr.number}-cart.patch`;
  const filepath = join(process.cwd(), filename);
  writeFileSync(filepath, patch, 'utf-8');
  return filepath;
}

/**
 * Apply selected file changes onto the current branch.
 * Fails hard on conflicts — matches default git behavior.
 */
export function applyToCurrentBranch(
  pr: PRData,
  selectedFiles: Set<string>
): void {
  const patch = generatePatch(pr, selectedFiles);
  const patchFile = `pr-${pr.number}-cart.patch`;

  try {
    execSync('git apply --check -', { input: patch, stdio: ['pipe', 'ignore', 'pipe'] });
    execSync('git apply -', { input: patch });
  } catch {
    // Save the patch so user can retry manually
    const filepath = join(process.cwd(), patchFile);
    writeFileSync(filepath, patch, 'utf-8');

    const lines = [
      `Patch failed to apply cleanly.`,
      `Saved patch to: ${filepath}`,
      ``,
      `To retry with 3-way merge:`,
      `  git apply --3way ${patchFile}`,
      ``,
      `Or cherry-pick individual files from the PR branch:`,
      `  git checkout ${pr.headBranch} -- <file>`,
    ];
    throw new Error(lines.join('\n'));
  }
}

/**
 * Create a new branch with only the selected file changes.
 */
export function applyToNewBranch(
  pr: PRData,
  selectedFiles: Set<string>,
  branchName: string
): void {
  const previousBranch = getCurrentBranch();
  execSync(`git checkout -b ${branchName}`);
  try {
    applyToCurrentBranch(pr, selectedFiles);
    execSync(
      `git add ${[...selectedFiles].map((f) => `"${f}"`).join(' ')}`
    );
    execSync(
      `git commit -m "Apply selected files from PR #${pr.number}\n\nFiles: ${[...selectedFiles].join(', ')}"`
    );
  } catch (err) {
    // Roll back: delete the branch, return to where user was
    execSync(`git checkout ${previousBranch}`);
    execSync(`git branch -D ${branchName}`);
    throw err;
  }
}
