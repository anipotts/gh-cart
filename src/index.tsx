import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import { App } from './app.js';

const cli = meow(
  `
  Usage
    $ gh cart                    Auto-detect repo, list open PRs, pick files
    $ gh cart <number>           Open a specific PR by number
    $ gh cart <url>              Open a PR by full GitHub URL

  Quick Start
    $ cd your-repo
    $ gh cart

  Examples
    $ gh cart
    $ gh cart 142
    $ gh cart https://github.com/owner/repo/pull/142
`,
  {
    importMeta: import.meta,
    flags: {},
  }
);

const prArg = cli.input[0];

render(<App prArg={prArg} />);
