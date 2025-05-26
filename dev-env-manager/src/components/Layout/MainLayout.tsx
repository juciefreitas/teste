// src/components/Layout/MainLayout.tsx
import React, { ReactNode, useState } from 'react';
import { AppShell, Header, Footer, Text, Group, Button, useMantineTheme } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';

interface MainLayoutProps {
  children: ReactNode;
  consoleSlot: (isExpanded: boolean, toggleExpand: () => void) => ReactNode; // Pass state and toggle
}

const DEFAULT_CONSOLE_HEIGHT = 200;
const EXPANDED_CONSOLE_HEIGHT = 400; // Or a larger portion of viewport

const MainLayout: React.FC<MainLayoutProps> = ({ children, consoleSlot }) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);

  const toggleConsoleExpand = () => setIsConsoleExpanded(prev => !prev);
  
  const currentConsoleHeight = isConsoleExpanded ? EXPANDED_CONSOLE_HEIGHT : DEFAULT_CONSOLE_HEIGHT;

  return (
    <AppShell
      padding="md"
      header={
        <Header height={60} p="md">
          <Group position="apart" sx={{ height: '100%' }}>
            <Text size="xl" weight={700}>Dev Env Manager</Text>
            <Button onClick={() => toggleColorScheme()} variant="outline" size="sm">
              {colorScheme === 'dark' ? 'Light' : 'Dark'} Mode
            </Button>
          </Group>
        </Header>
      }
      footer={
        // Pass isExpanded and toggleConsoleExpand to the consoleSlot renderer
        consoleSlot ? (
          <Footer height={currentConsoleHeight} p={0} style={{ borderTop: `1px solid ${theme.colors.gray[3]}` }}>
            {consoleSlot(isConsoleExpanded, toggleConsoleExpand)}
          </Footer>
        ) : undefined
      }
      styles={(th) => ({
        main: {
          backgroundColor: th.colorScheme === 'dark' ? th.colors.dark[8] : th.colors.gray[0],
          // Adjust main area height based on console visibility and height
          minHeight: `calc(100vh - 60px - ${consoleSlot ? currentConsoleHeight : 0}px)`, 
          paddingBottom: consoleSlot ? currentConsoleHeight + 16 : 0, // Ensure space if footer is present
        },
      })}
    >
      {children}
    </AppShell>
  );
};
export default MainLayout;
