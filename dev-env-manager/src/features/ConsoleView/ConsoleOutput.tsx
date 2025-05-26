// src/features/ConsoleView/ConsoleOutput.tsx
import React, { useEffect, useRef } from 'react'; // Removed useState as messages come from props
import { Box, Text, Button, Group, ScrollArea, useMantineTheme, Code, Tooltip } from '@mantine/core'; // Added Code, Tooltip
import { IconX, IconArrowsMaximize, IconArrowsMinimize } from '@tabler/icons-react';

// Re-using AppConsoleMessage structure from App.tsx for messages prop
interface AppConsoleMessage {
  id: string;
  timestamp: Date;
  text: string;
  type: 'stdout' | 'stderr' | 'system' | 'git';
  projectId?: string;
  processId?: string;
}

interface ConsoleOutputProps {
  messages: AppConsoleMessage[]; // Messages now come from props
  height?: string | number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onClearConsole: () => void; // Add prop for clearing messages in parent state
}

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ messages, height = '100%', isExpanded, onToggleExpand, onClearConsole }) => {
  const theme = useMantineTheme();
  const scrollAreaViewport = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaViewport.current) {
      scrollAreaViewport.current.scrollTo({ top: scrollAreaViewport.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  const getMessageColor = (type: AppConsoleMessage['type']) => {
    if (type === 'stderr') return theme.colors.red[7];
    if (type === 'system') return theme.colors.blue[6];
    if (type === 'git') return theme.colors.grape[6]; // Example color for Git messages
    // stdout and other types
    return theme.colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.dark[7];
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: height }}>
      <Group position="apart" p="xs" sx={(th) => ({ backgroundColor: th.colorScheme === 'dark' ? th.colors.dark[6] : th.colors.gray[1], borderBottom: `1px solid ${th.colorScheme === 'dark' ? th.colors.dark[4] : th.colors.gray[3]}` })}>
        <Text size="sm" weight={500}>Console</Text>
        <Group spacing="xs">
          {onToggleExpand && (
            <Tooltip label={isExpanded ? "Minimize Console" : "Maximize Console"}>
              <Button variant="default" size="xs" onClick={onToggleExpand} px={6}>
                {isExpanded ? <IconArrowsMinimize size={16}/> : <IconArrowsMaximize size={16} />}
              </Button>
            </Tooltip>
          )}
          <Tooltip label="Clear Console">
            <Button variant="default" size="xs" onClick={onClearConsole} px={6}>
              <IconX size={16} />
            </Button>
          </Tooltip>
        </Group>
      </Group>
      <ScrollArea viewportRef={scrollAreaViewport} style={{ flexGrow: 1 }} p="xs" bg={theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white}>
        {messages.length === 0 && <Text size="xs" color="dimmed" align="center" mt="md">Console is empty. Output from commands will appear here.</Text>}
        {messages.map(msg => (
          <Box key={msg.id} mb={4}>
            <Text size="xs" ff="monospace" color={getMessageColor(msg.type)}>
              <Text span color={theme.colors.gray[6]} mr={5}>[{formatTimestamp(msg.timestamp)}]</Text>
              {msg.projectId && <Text span color={theme.colors.violet[5]} mr={5}>[{msg.projectId.substring(0,6)}]</Text>}
              {msg.processId && <Text span color={theme.colors.cyan[5]} mr={5}>[pid:{msg.processId.split('-').pop()}]</Text>}
              {msg.text}
            </Text>
          </Box>
        ))}
      </ScrollArea>
    </Box>
  );
};
export default ConsoleOutput;
