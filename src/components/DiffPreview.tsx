import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { PRFile } from '../types.js';

interface DiffPreviewProps {
  file: PRFile;
  onBack: () => void;
}

export function DiffPreview({ file, onBack }: DiffPreviewProps) {
  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      onBack();
    }
  });

  const lines = file.patch?.split('\n') ?? ['(no diff available)'];

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">{file.filename}</Text>
        <Text>  </Text>
        <Text color="green">+{file.additions}</Text>
        <Text> </Text>
        <Text color="red">-{file.deletions}</Text>
        <Text>  </Text>
        <Text dimColor>({file.status})</Text>
      </Box>

      <Box flexDirection="column" borderStyle="single" borderColor="gray" paddingX={1}>
        {lines.slice(0, 40).map((line, i) => {
          let color: string | undefined;
          if (line.startsWith('+')) color = 'green';
          else if (line.startsWith('-')) color = 'red';
          else if (line.startsWith('@@')) color = 'cyan';

          return (
            <Text key={i} color={color} dimColor={!color}>
              {line}
            </Text>
          );
        })}
        {lines.length > 40 && (
          <Text dimColor>... {lines.length - 40} more lines</Text>
        )}
      </Box>

      <Box marginTop={1}>
        <Text dimColor>[q] or [esc] to go back</Text>
      </Box>
    </Box>
  );
}
