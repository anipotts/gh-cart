import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface BranchInputProps {
  defaultName: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function BranchInput({ defaultName, onSubmit, onCancel }: BranchInputProps) {
  const [value, setValue] = useState(defaultName);

  return (
    <Box flexDirection="column">
      <Text bold>Branch name:</Text>
      <Box marginTop={1}>
        <Text color="cyan">{'> '}</Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={() => {
            const trimmed = value.trim();
            if (trimmed) onSubmit(trimmed);
          }}
        />
      </Box>
      <Box marginTop={1}>
        <Text dimColor>[enter] confirm  [ctrl+c] cancel</Text>
      </Box>
    </Box>
  );
}
