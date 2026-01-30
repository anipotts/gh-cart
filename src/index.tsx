import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import { App } from './app.js';

const cli = meow(
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
    flags: {},
  }
);

const prArg = cli.input[0];

render(<App prArg={prArg} />);
