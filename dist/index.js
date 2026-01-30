#!/usr/bin/env node

// src/index.tsx
import { render } from "ink";
import meow from "meow";

// src/app.tsx
import { useState as useState3, useEffect } from "react";
import { Box as Box5, Text as Text5 } from "ink";
import Spinner from "ink-spinner";
import SelectInput2 from "ink-select-input";

// src/components/FilePicker.tsx
import { useState } from "react";
import { Box, Text, useInput } from "ink";
import { jsx, jsxs } from "react/jsx-runtime";
var STATUS_COLORS = {
  added: "green",
  modified: "yellow",
  removed: "red",
  renamed: "cyan"
};
var STATUS_LABELS = {
  added: "added",
  modified: "modified",
  removed: "removed",
  renamed: "renamed"
};
function FilePicker({ files, onDone, onViewDiff, onQuit }) {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState(/* @__PURE__ */ new Set());
  const [scrollOffset, setScrollOffset] = useState(0);
  const maxVisible = 15;
  useInput((input, key) => {
    if (input === "q") {
      onQuit();
      return;
    }
    if (input === " ") {
      setSelected((prev) => {
        const next = new Set(prev);
        const filename = files[cursor].filename;
        if (next.has(filename)) {
          next.delete(filename);
        } else {
          next.add(filename);
        }
        return next;
      });
      return;
    }
    if (input === "a") {
      setSelected(new Set(files.map((f) => f.filename)));
      return;
    }
    if (input === "n") {
      setSelected(/* @__PURE__ */ new Set());
      return;
    }
    if (input === "d") {
      onViewDiff(files[cursor]);
      return;
    }
    if (key.return) {
      onDone(selected);
      return;
    }
    if (key.upArrow || input === "k") {
      setCursor((prev) => {
        const next = Math.max(0, prev - 1);
        if (next < scrollOffset) setScrollOffset(next);
        return next;
      });
      return;
    }
    if (key.downArrow || input === "j") {
      setCursor((prev) => {
        const next = Math.min(files.length - 1, prev + 1);
        if (next >= scrollOffset + maxVisible) setScrollOffset(next - maxVisible + 1);
        return next;
      });
      return;
    }
  });
  const visibleFiles = files.slice(scrollOffset, scrollOffset + maxVisible);
  const totalAdd = [...selected].reduce((sum, fn) => {
    const f = files.find((file) => file.filename === fn);
    return sum + (f?.additions ?? 0);
  }, 0);
  const totalDel = [...selected].reduce((sum, fn) => {
    const f = files.find((file) => file.filename === fn);
    return sum + (f?.deletions ?? 0);
  }, 0);
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", children: [
    visibleFiles.map((file, i) => {
      const realIndex = scrollOffset + i;
      const isCursor = realIndex === cursor;
      const isSelected = selected.has(file.filename);
      return /* @__PURE__ */ jsxs(Box, { children: [
        /* @__PURE__ */ jsxs(Text, { color: isCursor ? "cyan" : void 0, bold: isCursor, children: [
          isCursor ? ">" : " ",
          " "
        ] }),
        /* @__PURE__ */ jsxs(Text, { color: isSelected ? "green" : "gray", children: [
          isSelected ? "[x]" : "[ ]",
          " "
        ] }),
        /* @__PURE__ */ jsx(Text, { bold: isCursor, children: file.filename }),
        /* @__PURE__ */ jsx(Text, { children: "  " }),
        /* @__PURE__ */ jsxs(Text, { color: "green", children: [
          "+",
          file.additions
        ] }),
        /* @__PURE__ */ jsx(Text, { children: " " }),
        /* @__PURE__ */ jsxs(Text, { color: "red", children: [
          "-",
          file.deletions
        ] }),
        /* @__PURE__ */ jsx(Text, { children: "  " }),
        /* @__PURE__ */ jsx(Text, { color: STATUS_COLORS[file.status] ?? "white", children: STATUS_LABELS[file.status] ?? file.status })
      ] }, file.filename);
    }),
    files.length > maxVisible && /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsxs(Text, { dimColor: true, children: [
      "Showing ",
      scrollOffset + 1,
      "-",
      Math.min(scrollOffset + maxVisible, files.length),
      " of ",
      files.length,
      " files"
    ] }) }),
    /* @__PURE__ */ jsxs(Box, { marginTop: 1, borderStyle: "single", borderColor: "blue", paddingX: 1, children: [
      /* @__PURE__ */ jsx(Text, { bold: true, children: "Cart: " }),
      /* @__PURE__ */ jsx(Text, { color: "green", children: selected.size }),
      /* @__PURE__ */ jsx(Text, { children: " files  " }),
      /* @__PURE__ */ jsxs(Text, { color: "green", children: [
        "+",
        totalAdd
      ] }),
      /* @__PURE__ */ jsx(Text, { children: " " }),
      /* @__PURE__ */ jsxs(Text, { color: "red", children: [
        "-",
        totalDel
      ] })
    ] }),
    /* @__PURE__ */ jsx(Box, { marginTop: 1, children: /* @__PURE__ */ jsx(Text, { dimColor: true, children: "[space] toggle  [a] all  [n] none  [d] diff  [enter] apply  [q] quit" }) })
  ] });
}

// src/components/DiffPreview.tsx
import { Box as Box2, Text as Text2, useInput as useInput2 } from "ink";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function DiffPreview({ file, onBack }) {
  useInput2((input, key) => {
    if (input === "q" || key.escape) {
      onBack();
    }
  });
  const lines = file.patch?.split("\n") ?? ["(no diff available)"];
  return /* @__PURE__ */ jsxs2(Box2, { flexDirection: "column", children: [
    /* @__PURE__ */ jsxs2(Box2, { marginBottom: 1, children: [
      /* @__PURE__ */ jsx2(Text2, { bold: true, color: "cyan", children: file.filename }),
      /* @__PURE__ */ jsx2(Text2, { children: "  " }),
      /* @__PURE__ */ jsxs2(Text2, { color: "green", children: [
        "+",
        file.additions
      ] }),
      /* @__PURE__ */ jsx2(Text2, { children: " " }),
      /* @__PURE__ */ jsxs2(Text2, { color: "red", children: [
        "-",
        file.deletions
      ] }),
      /* @__PURE__ */ jsx2(Text2, { children: "  " }),
      /* @__PURE__ */ jsxs2(Text2, { dimColor: true, children: [
        "(",
        file.status,
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsxs2(Box2, { flexDirection: "column", borderStyle: "single", borderColor: "gray", paddingX: 1, children: [
      lines.slice(0, 40).map((line, i) => {
        let color;
        if (line.startsWith("+")) color = "green";
        else if (line.startsWith("-")) color = "red";
        else if (line.startsWith("@@")) color = "cyan";
        return /* @__PURE__ */ jsx2(Text2, { color, dimColor: !color, children: line }, i);
      }),
      lines.length > 40 && /* @__PURE__ */ jsxs2(Text2, { dimColor: true, children: [
        "... ",
        lines.length - 40,
        " more lines"
      ] })
    ] }),
    /* @__PURE__ */ jsx2(Box2, { marginTop: 1, children: /* @__PURE__ */ jsx2(Text2, { dimColor: true, children: "[q] or [esc] to go back" }) })
  ] });
}

// src/components/ApplyPrompt.tsx
import { Box as Box3, Text as Text3 } from "ink";
import SelectInput from "ink-select-input";
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var items = [
  {
    label: "Apply to current branch",
    value: "cherry-pick",
    description: "Apply selected file changes to your current branch"
  },
  {
    label: "Create new branch",
    value: "branch",
    description: "Create a new branch with only selected changes"
  },
  {
    label: "Download patch file",
    value: "patch",
    description: "Save a .patch file you can apply later"
  }
];
function ApplyPrompt({
  fileCount,
  additions,
  deletions,
  onSelect,
  onCancel
}) {
  const handleSelect = (item) => {
    if (item.value) {
      onSelect(item.value);
    }
  };
  return /* @__PURE__ */ jsxs3(Box3, { flexDirection: "column", children: [
    /* @__PURE__ */ jsxs3(Box3, { marginBottom: 1, children: [
      /* @__PURE__ */ jsxs3(Text3, { bold: true, children: [
        "Apply ",
        fileCount,
        " files "
      ] }),
      /* @__PURE__ */ jsxs3(Text3, { color: "green", children: [
        "(+",
        additions
      ] }),
      /* @__PURE__ */ jsx3(Text3, { children: " " }),
      /* @__PURE__ */ jsxs3(Text3, { color: "red", children: [
        "-",
        deletions,
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsx3(Text3, { dimColor: true, children: "How do you want these changes?" }),
    /* @__PURE__ */ jsx3(Box3, { marginTop: 1, children: /* @__PURE__ */ jsx3(SelectInput, { items, onSelect: handleSelect }) })
  ] });
}

// src/components/BranchInput.tsx
import { useState as useState2 } from "react";
import { Box as Box4, Text as Text4 } from "ink";
import TextInput from "ink-text-input";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function BranchInput({ defaultName, onSubmit, onCancel }) {
  const [value, setValue] = useState2(defaultName);
  return /* @__PURE__ */ jsxs4(Box4, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx4(Text4, { bold: true, children: "Branch name:" }),
    /* @__PURE__ */ jsxs4(Box4, { marginTop: 1, children: [
      /* @__PURE__ */ jsx4(Text4, { color: "cyan", children: "> " }),
      /* @__PURE__ */ jsx4(
        TextInput,
        {
          value,
          onChange: setValue,
          onSubmit: () => {
            const trimmed = value.trim();
            if (trimmed) onSubmit(trimmed);
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsx4(Box4, { marginTop: 1, children: /* @__PURE__ */ jsx4(Text4, { dimColor: true, children: "[enter] confirm  [ctrl+c] cancel" }) })
  ] });
}

// src/github.ts
import { execSync } from "child_process";
function gh(args) {
  return execSync(`gh ${args}`, { encoding: "utf-8" }).trim();
}
function ghApi(endpoint) {
  const raw = gh(`api ${endpoint}`);
  return JSON.parse(raw);
}
function checkAuth() {
  try {
    gh("auth status");
    return true;
  } catch {
    return false;
  }
}
function getRepoInfo() {
  try {
    const raw = gh("repo view --json owner,name");
    const data = JSON.parse(raw);
    return { owner: data.owner.login, repo: data.name };
  } catch {
    return null;
  }
}
function listOpenPRs(owner, repo) {
  const raw = gh(
    `pr list --repo ${owner}/${repo} --state open --json number,title,author,createdAt,headRefName,additions,deletions,changedFiles --limit 20`
  );
  const items2 = JSON.parse(raw);
  return items2.map((item) => ({
    number: item.number,
    title: item.title,
    author: item.author.login,
    createdAt: item.createdAt,
    headBranch: item.headRefName,
    additions: item.additions,
    deletions: item.deletions,
    changedFiles: item.changedFiles
  }));
}
function fetchPR(owner, repo, number) {
  const prRaw = gh(
    `pr view ${number} --repo ${owner}/${repo} --json number,title,baseRefName,headRefName,additions,deletions,state,url`
  );
  const pr = JSON.parse(prRaw);
  const filesRaw = ghApi(
    `/repos/${owner}/${repo}/pulls/${number}/files?per_page=100`
  );
  const files = filesRaw.map((f) => ({
    filename: f.filename,
    status: f.status,
    additions: f.additions,
    deletions: f.deletions,
    changes: f.changes,
    patch: f.patch,
    previousFilename: f.previous_filename
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
    state: pr.state,
    htmlUrl: pr.url
  };
}
function parsePRUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (match) {
    return {
      owner: match[1],
      repo: match[2],
      number: parseInt(match[3], 10)
    };
  }
  return null;
}

// src/git.ts
import { execSync as execSync2 } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";
function isGitRepo() {
  try {
    execSync2("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
function getCurrentBranch() {
  return execSync2("git branch --show-current", { encoding: "utf-8" }).trim();
}
function generatePatch(pr, selectedFiles) {
  const patches = pr.files.filter((f) => selectedFiles.has(f.filename) && f.patch).map((f) => formatFilePatch(f));
  return patches.join("\n");
}
function formatFilePatch(file) {
  const lines = [
    `diff --git a/${file.filename} b/${file.filename}`
  ];
  if (file.status === "added") {
    lines.push("new file mode 100644");
  } else if (file.status === "removed") {
    lines.push("deleted file mode 100644");
  }
  const aPath = file.status === "added" ? "/dev/null" : `a/${file.filename}`;
  const bPath = file.status === "removed" ? "/dev/null" : `b/${file.filename}`;
  lines.push(`--- ${aPath}`);
  lines.push(`+++ ${bPath}`);
  lines.push(file.patch);
  return lines.join("\n");
}
function savePatch(pr, selectedFiles) {
  const patch = generatePatch(pr, selectedFiles);
  const filename = `pr-${pr.number}-cart.patch`;
  const filepath = join(process.cwd(), filename);
  writeFileSync(filepath, patch, "utf-8");
  return filepath;
}
function applyToCurrentBranch(pr, selectedFiles) {
  const patch = generatePatch(pr, selectedFiles);
  const patchFile = `pr-${pr.number}-cart.patch`;
  try {
    execSync2("git apply --check -", { input: patch, stdio: ["pipe", "ignore", "pipe"] });
    execSync2("git apply -", { input: patch });
  } catch {
    const filepath = join(process.cwd(), patchFile);
    writeFileSync(filepath, patch, "utf-8");
    const lines = [
      `Patch failed to apply cleanly.`,
      `Saved patch to: ${filepath}`,
      ``,
      `To retry with 3-way merge:`,
      `  git apply --3way ${patchFile}`,
      ``,
      `Or cherry-pick individual files from the PR branch:`,
      `  git checkout ${pr.headBranch} -- <file>`
    ];
    throw new Error(lines.join("\n"));
  }
}
function applyToNewBranch(pr, selectedFiles, branchName) {
  const previousBranch = getCurrentBranch();
  execSync2(`git checkout -b ${branchName}`);
  try {
    applyToCurrentBranch(pr, selectedFiles);
    execSync2(
      `git add ${[...selectedFiles].map((f) => `"${f}"`).join(" ")}`
    );
    execSync2(
      `git commit -m "Apply selected files from PR #${pr.number}

Files: ${[...selectedFiles].join(", ")}"`
    );
  } catch (err) {
    execSync2(`git checkout ${previousBranch}`);
    execSync2(`git branch -D ${branchName}`);
    throw err;
  }
}

// src/app.tsx
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function App({ prArg: prArg2 }) {
  const [view, setView] = useState3({
    type: "loading",
    message: "Starting..."
  });
  useEffect(() => {
    boot();
  }, []);
  async function boot() {
    if (!isGitRepo()) {
      setView({ type: "error", message: "Not a git repository. Run this from inside a repo." });
      return;
    }
    if (!checkAuth()) {
      setView({ type: "error", message: "GitHub auth required. Run: gh auth login" });
      return;
    }
    const repo = getRepoInfo();
    if (!repo) {
      setView({ type: "error", message: "Could not detect repository. Is a GitHub remote configured?" });
      return;
    }
    if (prArg2) {
      const parsed = parsePRUrl(prArg2);
      if (parsed) {
        loadPR(parsed.owner, parsed.repo, parsed.number);
        return;
      }
      const num = parseInt(prArg2, 10);
      if (!isNaN(num) && num > 0) {
        loadPR(repo.owner, repo.repo, num);
        return;
      }
      setView({ type: "error", message: `Invalid PR reference: "${prArg2}". Use a number or GitHub URL.` });
      return;
    }
    setView({ type: "loading", message: `Loading open PRs for ${repo.owner}/${repo.repo}...` });
    try {
      const prs = listOpenPRs(repo.owner, repo.repo);
      if (prs.length === 0) {
        setView({ type: "error", message: "No open PRs found. Create one with: gh pr create" });
        return;
      }
      setView({ type: "pick-pr", prs });
    } catch (err) {
      setView({ type: "error", message: `Failed to list PRs: ${err}` });
    }
  }
  function loadPR(owner, repo, number) {
    setView({ type: "loading", message: `Loading PR #${number}...` });
    try {
      const pr = fetchPR(owner, repo, number);
      if (pr.files.length === 0) {
        setView({ type: "error", message: `PR #${number} has no file changes.` });
        return;
      }
      setView({ type: "file-picker", pr });
    } catch (err) {
      setView({ type: "error", message: `Failed to load PR #${number}: ${err}` });
    }
  }
  function handleApply(pr, selected, action) {
    try {
      switch (action) {
        case "cherry-pick": {
          applyToCurrentBranch(pr, selected);
          setView({
            type: "done",
            message: `Applied ${selected.size} files from PR #${pr.number} to current branch.`
          });
          break;
        }
        case "patch": {
          const path = savePatch(pr, selected);
          setView({
            type: "done",
            message: `Patch saved to ${path}`
          });
          break;
        }
        case "branch": {
          setView({ type: "branch-input", pr, selected });
          break;
        }
      }
    } catch (err) {
      setView({ type: "error", message: `Apply failed: ${err}` });
    }
  }
  if (view.type === "loading") {
    return /* @__PURE__ */ jsxs5(Box5, { children: [
      /* @__PURE__ */ jsx5(Text5, { color: "cyan", children: /* @__PURE__ */ jsx5(Spinner, { type: "dots" }) }),
      /* @__PURE__ */ jsxs5(Text5, { children: [
        " ",
        view.message
      ] })
    ] });
  }
  if (view.type === "error") {
    return /* @__PURE__ */ jsxs5(Box5, { children: [
      /* @__PURE__ */ jsx5(Text5, { color: "red", bold: true, children: "Error: " }),
      /* @__PURE__ */ jsx5(Text5, { children: view.message })
    ] });
  }
  if (view.type === "done") {
    return /* @__PURE__ */ jsxs5(Box5, { children: [
      /* @__PURE__ */ jsx5(Text5, { color: "green", bold: true, children: "Done: " }),
      /* @__PURE__ */ jsx5(Text5, { children: view.message })
    ] });
  }
  if (view.type === "pick-pr") {
    const repo = getRepoInfo();
    const items2 = view.prs.map((pr) => ({
      label: `#${pr.number} ${pr.title} (${formatTimeAgo(pr.createdAt)})`,
      value: pr.number
    }));
    return /* @__PURE__ */ jsxs5(Box5, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx5(Text5, { bold: true, children: "Select a PR to shop:" }),
      /* @__PURE__ */ jsx5(Box5, { marginTop: 1, children: /* @__PURE__ */ jsx5(
        SelectInput2,
        {
          items: items2,
          onSelect: (item) => loadPR(repo.owner, repo.repo, item.value)
        }
      ) })
    ] });
  }
  if (view.type === "file-picker") {
    const { pr } = view;
    return /* @__PURE__ */ jsxs5(Box5, { flexDirection: "column", children: [
      /* @__PURE__ */ jsxs5(Box5, { marginBottom: 1, children: [
        /* @__PURE__ */ jsxs5(Text5, { bold: true, color: "blue", children: [
          "PR #",
          pr.number,
          ": "
        ] }),
        /* @__PURE__ */ jsx5(Text5, { bold: true, children: pr.title }),
        /* @__PURE__ */ jsxs5(Text5, { dimColor: true, children: [
          "  (",
          pr.files.length,
          " files, "
        ] }),
        /* @__PURE__ */ jsxs5(Text5, { color: "green", children: [
          "+",
          pr.totalAdditions
        ] }),
        /* @__PURE__ */ jsx5(Text5, { dimColor: true, children: " " }),
        /* @__PURE__ */ jsxs5(Text5, { color: "red", children: [
          "-",
          pr.totalDeletions
        ] }),
        /* @__PURE__ */ jsx5(Text5, { dimColor: true, children: ")" })
      ] }),
      /* @__PURE__ */ jsx5(
        FilePicker,
        {
          files: pr.files,
          onDone: (selected) => {
            if (selected.size === 0) {
              setView({ type: "error", message: "No files selected. Nothing to apply." });
              return;
            }
            setView({ type: "apply-prompt", pr, selected });
          },
          onViewDiff: (file) => setView({ type: "diff-preview", pr, file, selected: /* @__PURE__ */ new Set() }),
          onQuit: () => setView({ type: "done", message: "Cancelled." })
        }
      )
    ] });
  }
  if (view.type === "diff-preview") {
    const { pr, file, selected } = view;
    return /* @__PURE__ */ jsx5(
      DiffPreview,
      {
        file,
        onBack: () => setView({ type: "file-picker", pr })
      }
    );
  }
  if (view.type === "apply-prompt") {
    const { pr, selected } = view;
    const additions = pr.files.filter((f) => selected.has(f.filename)).reduce((sum, f) => sum + f.additions, 0);
    const deletions = pr.files.filter((f) => selected.has(f.filename)).reduce((sum, f) => sum + f.deletions, 0);
    return /* @__PURE__ */ jsx5(
      ApplyPrompt,
      {
        fileCount: selected.size,
        additions,
        deletions,
        onSelect: (action) => handleApply(pr, selected, action),
        onCancel: () => setView({ type: "file-picker", pr })
      }
    );
  }
  if (view.type === "branch-input") {
    const { pr, selected } = view;
    const defaultName = `cart/pr-${pr.number}`;
    return /* @__PURE__ */ jsx5(
      BranchInput,
      {
        defaultName,
        onSubmit: (name) => {
          try {
            applyToNewBranch(pr, selected, name);
            setView({
              type: "done",
              message: `Created branch "${name}" with ${selected.size} files from PR #${pr.number}.`
            });
          } catch (err) {
            setView({ type: "error", message: `Failed to create branch: ${err}` });
          }
        },
        onCancel: () => setView({ type: "apply-prompt", pr, selected })
      }
    );
  }
  return null;
}
function formatTimeAgo(dateString) {
  const ms = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(ms / 6e4);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// src/index.tsx
import { jsx as jsx6 } from "react/jsx-runtime";
var cli = meow(
  `
  Usage
    $ gh cart                    List open PRs, pick one, shop files
    $ gh cart <number>           Open a specific PR by number
    $ gh cart <url>              Open a PR by GitHub URL

  Examples
    $ gh cart
    $ gh cart 142
    $ gh cart https://github.com/owner/repo/pull/142
`,
  {
    importMeta: import.meta,
    flags: {}
  }
);
var prArg = cli.input[0];
render(/* @__PURE__ */ jsx6(App, { prArg }));
