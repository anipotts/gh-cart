import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import type { ApplyAction } from '../types.js';

interface ApplyPromptProps {
  fileCount: number;
  additions: number;
  deletions: number;
  onSelect: (action: ApplyAction) => void;
  onCancel: () => void;
}

const items = [
  {
    label: 'Apply to current branch',
    value: 'cherry-pick' as ApplyAction,
    description: 'Apply selected file changes to your current branch',
  },
  {
    label: 'Create new branch',
    value: 'branch' as ApplyAction,
    description: 'Create a new branch with only selected changes',
  },
  {
    label: 'Download patch file',
    value: 'patch' as ApplyAction,
    description: 'Save a .patch file you can apply later',
  },
];

export function ApplyPrompt({
  fileCount,
  additions,
  deletions,
  onSelect,
  onCancel,
}: ApplyPromptProps) {
  const handleSelect = (item: { value: ApplyAction }) => {
    if (item.value) {
      onSelect(item.value);
    }
  };

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Apply {fileCount} files </Text>
        <Text color="green">(+{additions}</Text>
        <Text> </Text>
        <Text color="red">-{deletions})</Text>
      </Box>

      <Text dimColor>How do you want these changes?</Text>
      <Box marginTop={1}>
        <SelectInput items={items} onSelect={handleSelect} />
      </Box>
    </Box>
  );
}
