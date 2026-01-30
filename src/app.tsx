import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import SelectInput from 'ink-select-input';
import { FilePicker } from './components/FilePicker.js';
import { DiffPreview } from './components/DiffPreview.js';
import { ApplyPrompt } from './components/ApplyPrompt.js';
import { BranchInput } from './components/BranchInput.js';
import {
  checkAuth,
  getRepoInfo,
  listOpenPRs,
  fetchPR,
  parsePRUrl,
} from './github.js';
import {
  isGitRepo,
  savePatch,
  applyToCurrentBranch,
  applyToNewBranch,
} from './git.js';
import type { PRData, PRFile, PRListItem, ApplyAction } from './types.js';

type View =
  | { type: 'loading'; message: string }
  | { type: 'error'; message: string }
  | { type: 'pick-pr'; prs: PRListItem[] }
  | { type: 'file-picker'; pr: PRData }
  | { type: 'diff-preview'; pr: PRData; file: PRFile; selected: Set<string> }
  | { type: 'apply-prompt'; pr: PRData; selected: Set<string> }
  | { type: 'branch-input'; pr: PRData; selected: Set<string> }
  | { type: 'done'; message: string };

interface AppProps {
  prArg?: string;
}

export function App({ prArg }: AppProps) {
  const [view, setView] = useState<View>({
    type: 'loading',
    message: 'Starting...',
  });

  useEffect(() => {
    boot();
  }, []);

  async function boot() {
    // Check prerequisites
    if (!isGitRepo()) {
      setView({ type: 'error', message: 'Not a git repository. Run this from inside a repo.' });
      return;
    }

    if (!checkAuth()) {
      setView({ type: 'error', message: 'GitHub auth required. Run: gh auth login' });
      return;
    }

    const repo = getRepoInfo();
    if (!repo) {
      setView({ type: 'error', message: 'Could not detect repository. Is a GitHub remote configured?' });
      return;
    }

    // If a PR number or URL was provided, load it directly
    if (prArg) {
      const parsed = parsePRUrl(prArg);
      if (parsed) {
        loadPR(parsed.owner, parsed.repo, parsed.number);
        return;
      }

      const num = parseInt(prArg, 10);
      if (!isNaN(num) && num > 0) {
        loadPR(repo.owner, repo.repo, num);
        return;
      }

      setView({ type: 'error', message: `Invalid PR reference: "${prArg}". Use a number or GitHub URL.` });
      return;
    }

    // No PR specified — list open PRs
    setView({ type: 'loading', message: `Loading open PRs for ${repo.owner}/${repo.repo}...` });

    try {
      const prs = listOpenPRs(repo.owner, repo.repo);
      if (prs.length === 0) {
        setView({ type: 'error', message: 'No open PRs found. Create one with: gh pr create' });
        return;
      }
      setView({ type: 'pick-pr', prs });
    } catch (err) {
      setView({ type: 'error', message: `Failed to list PRs: ${err}` });
    }
  }

  function loadPR(owner: string, repo: string, number: number) {
    setView({ type: 'loading', message: `Loading PR #${number}...` });

    try {
      const pr = fetchPR(owner, repo, number);
      if (pr.files.length === 0) {
        setView({ type: 'error', message: `PR #${number} has no file changes.` });
        return;
      }
      setView({ type: 'file-picker', pr });
    } catch (err) {
      setView({ type: 'error', message: `Failed to load PR #${number}: ${err}` });
    }
  }

  function handleApply(pr: PRData, selected: Set<string>, action: ApplyAction) {
    try {
      switch (action) {
        case 'cherry-pick': {
          applyToCurrentBranch(pr, selected);
          setView({
            type: 'done',
            message: `Applied ${selected.size} files from PR #${pr.number} to current branch.`,
          });
          break;
        }
        case 'patch': {
          const path = savePatch(pr, selected);
          setView({
            type: 'done',
            message: `Patch saved to ${path}`,
          });
          break;
        }
        case 'branch': {
          // Will be handled by BranchInput view
          setView({ type: 'branch-input', pr, selected });
          break;
        }
      }
    } catch (err) {
      setView({ type: 'error', message: `Apply failed: ${err}` });
    }
  }

  // --- Render ---

  if (view.type === 'loading') {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" />
        </Text>
        <Text> {view.message}</Text>
      </Box>
    );
  }

  if (view.type === 'error') {
    return (
      <Box>
        <Text color="red" bold>Error: </Text>
        <Text>{view.message}</Text>
      </Box>
    );
  }

  if (view.type === 'done') {
    return (
      <Box>
        <Text color="green" bold>Done: </Text>
        <Text>{view.message}</Text>
      </Box>
    );
  }

  if (view.type === 'pick-pr') {
    const repo = getRepoInfo()!;
    const items = view.prs.map((pr) => ({
      label: `#${pr.number} ${pr.title} (${formatTimeAgo(pr.createdAt)})`,
      value: pr.number,
    }));

    return (
      <Box flexDirection="column">
        <Text bold>Select a PR to shop:</Text>
        <Box marginTop={1}>
          <SelectInput
            items={items}
            onSelect={(item) => loadPR(repo.owner, repo.repo, item.value)}
          />
        </Box>
      </Box>
    );
  }

  if (view.type === 'file-picker') {
    const { pr } = view;
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color="blue">PR #{pr.number}: </Text>
          <Text bold>{pr.title}</Text>
          <Text dimColor>  ({pr.files.length} files, </Text>
          <Text color="green">+{pr.totalAdditions}</Text>
          <Text dimColor> </Text>
          <Text color="red">-{pr.totalDeletions}</Text>
          <Text dimColor>)</Text>
        </Box>
        <FilePicker
          files={pr.files}
          onDone={(selected) => {
            if (selected.size === 0) {
              setView({ type: 'error', message: 'No files selected. Nothing to apply.' });
              return;
            }
            setView({ type: 'apply-prompt', pr, selected });
          }}
          onViewDiff={(file) =>
            setView({ type: 'diff-preview', pr, file, selected: new Set() })
          }
          onQuit={() => setView({ type: 'done', message: 'Cancelled.' })}
        />
      </Box>
    );
  }

  if (view.type === 'diff-preview') {
    const { pr, file, selected } = view;
    return (
      <DiffPreview
        file={file}
        onBack={() => setView({ type: 'file-picker', pr })}
      />
    );
  }

  if (view.type === 'apply-prompt') {
    const { pr, selected } = view;
    const additions = pr.files
      .filter((f) => selected.has(f.filename))
      .reduce((sum, f) => sum + f.additions, 0);
    const deletions = pr.files
      .filter((f) => selected.has(f.filename))
      .reduce((sum, f) => sum + f.deletions, 0);

    return (
      <ApplyPrompt
        fileCount={selected.size}
        additions={additions}
        deletions={deletions}
        onSelect={(action) => handleApply(pr, selected, action)}
        onCancel={() => setView({ type: 'file-picker', pr })}
      />
    );
  }

  if (view.type === 'branch-input') {
    const { pr, selected } = view;
    const defaultName = `cart/pr-${pr.number}`;

    return (
      <BranchInput
        defaultName={defaultName}
        onSubmit={(name) => {
          try {
            applyToNewBranch(pr, selected, name);
            setView({
              type: 'done',
              message: `Created branch "${name}" with ${selected.size} files from PR #${pr.number}.`,
            });
          } catch (err) {
            setView({ type: 'error', message: `Failed to create branch: ${err}` });
          }
        }}
        onCancel={() => setView({ type: 'apply-prompt', pr, selected })}
      />
    );
  }

  return null;
}

function formatTimeAgo(dateString: string): string {
  const ms = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
