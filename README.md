# gh cart

> Cherry-pick files from pull requests.

A [gh extension](https://cli.github.com/manual/gh_extension) that lets you selectively apply files from a PR to your local branch.

## Installation

```bash
gh extension install anipotts/gh-cart
```

## Usage

```bash
gh cart              # List open PRs, pick one, select files
gh cart 142          # Open PR #142 directly
gh cart <url>        # Open a PR by full GitHub URL
```

### Interactive Mode

```
PR #142: feat: add dark mode support
12 files changed (+456 -123)

  ✓ src/components/Theme.tsx       +45  -12  modified
  ✓ src/styles/dark.css            +120 -0   added
  ✓ src/App.tsx                    +8   -3   modified
    src/tests/theme.test.ts        +89  -23  modified
    src/utils/colors.ts            +34  -5   modified

[space] toggle  [a] all  [n] none  [d] diff  [enter] apply  [q] quit
```

**Keyboard shortcuts:**
- `j/k` or `↑/↓` — navigate
- `space` — toggle file selection
- `a` — select all
- `n` — select none
- `d` — view diff for current file
- `enter` — apply selected files
- `q` — quit

### Apply Options

After selecting files, choose how to apply them:

- **Cherry-pick to current branch** — Apply changes directly
- **Create new branch** — Apply to a new branch
- **Download patch** — Save as `.patch` file

## Why?

AI tools generate massive PRs. You want some of it, not all of it.

`gh cart` lets you pick exactly which files to keep.

## Requirements

- [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated
- Git repository with GitHub remote

## Prefer a visual interface?

Try [prcart.dev](https://prcart.dev) — same concept, browser-based, no install required.

## License

MIT
