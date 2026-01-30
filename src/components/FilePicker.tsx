import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { PRFile } from '../types.js';

interface FilePickerProps {
  files: PRFile[];
  onDone: (selected: Set<string>) => void;
  onViewDiff: (file: PRFile) => void;
  onQuit: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  added: 'green',
  modified: 'yellow',
  removed: 'red',
  renamed: 'cyan',
};

const STATUS_LABELS: Record<string, string> = {
  added: 'added',
  modified: 'modified',
  removed: 'removed',
  renamed: 'renamed',
};

export function FilePicker({ files, onDone, onViewDiff, onQuit }: FilePickerProps) {
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [scrollOffset, setScrollOffset] = useState(0);

  const maxVisible = 15;

  useInput((input, key) => {
    if (input === 'q') {
      onQuit();
      return;
    }

    if (input === ' ') {
      // Toggle current file
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

    if (input === 'a') {
      // Select all
      setSelected(new Set(files.map((f) => f.filename)));
      return;
    }

    if (input === 'n') {
      // Select none
      setSelected(new Set());
      return;
    }

    if (input === 'd') {
      // View diff
      onViewDiff(files[cursor]);
      return;
    }

    if (key.return) {
      onDone(selected);
      return;
    }

    if (key.upArrow || input === 'k') {
      setCursor((prev) => {
        const next = Math.max(0, prev - 1);
        if (next < scrollOffset) setScrollOffset(next);
        return next;
      });
      return;
    }

    if (key.downArrow || input === 'j') {
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

  return (
    <Box flexDirection="column">
      {/* File list */}
      {visibleFiles.map((file, i) => {
        const realIndex = scrollOffset + i;
        const isCursor = realIndex === cursor;
        const isSelected = selected.has(file.filename);

        return (
          <Box key={file.filename}>
            <Text color={isCursor ? 'cyan' : undefined} bold={isCursor}>
              {isCursor ? '>' : ' '}{' '}
            </Text>
            <Text color={isSelected ? 'green' : 'gray'}>
              {isSelected ? '[x]' : '[ ]'}{' '}
            </Text>
            <Text bold={isCursor}>
              {file.filename}
            </Text>
            <Text>{'  '}</Text>
            <Text color="green">+{file.additions}</Text>
            <Text> </Text>
            <Text color="red">-{file.deletions}</Text>
            <Text>{'  '}</Text>
            <Text color={STATUS_COLORS[file.status] ?? 'white'}>
              {STATUS_LABELS[file.status] ?? file.status}
            </Text>
          </Box>
        );
      })}

      {/* Scroll indicator */}
      {files.length > maxVisible && (
        <Box marginTop={1}>
          <Text dimColor>
            Showing {scrollOffset + 1}-{Math.min(scrollOffset + maxVisible, files.length)} of {files.length} files
          </Text>
        </Box>
      )}

      {/* Cart summary */}
      <Box marginTop={1} borderStyle="single" borderColor="blue" paddingX={1}>
        <Text bold>Cart: </Text>
        <Text color="green">{selected.size}</Text>
        <Text> files  </Text>
        <Text color="green">+{totalAdd}</Text>
        <Text> </Text>
        <Text color="red">-{totalDel}</Text>
      </Box>

      {/* Keybindings */}
      <Box marginTop={1}>
        <Text dimColor>
          [space] toggle  [a] all  [n] none  [d] diff  [enter] apply  [q] quit
        </Text>
      </Box>
    </Box>
  );
}
