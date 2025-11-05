import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Paper,
  FormControlLabel,
  Switch,
  Alert,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as ActionIcon,
  CardGiftcard as RewardIcon,
  Warning as PunishmentIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Leaderboard as ScoreIcon,
} from '@mui/icons-material';
import { theme } from './theme';
import PersonManagement from './components/PersonManagement';
import RewardManagement from './components/RewardManagement';
import PunishmentManagement from './components/PunishmentManagement';
import ActionManagement from './components/ActionManagement';
import AssignmentManagement from './components/AssignmentManagement';
import ScoreView from './components/ScoreView';

type TabType = 'persons' | 'actions' | 'rewards' | 'punishments' | 'assignments' | 'scores';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactElement;
  component: React.ComponentType;
  legacy?: boolean;
}

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('persons');
  const [showLegacyTabs, setShowLegacyTabs] = useState<boolean>(false);

  const allTabs: TabConfig[] = [
    { id: 'persons', label: 'Persons', icon: <PeopleIcon />, component: PersonManagement },
    { id: 'actions', label: 'Actions', icon: <ActionIcon />, component: ActionManagement },
    { id: 'rewards', label: 'Rewards', icon: <RewardIcon />, component: RewardManagement, legacy: true },
    { id: 'punishments', label: 'Punishments', icon: <PunishmentIcon />, component: PunishmentManagement, legacy: true },
    { id: 'assignments', label: 'Assignments', icon: <AssignmentIcon />, component: AssignmentManagement },
    { id: 'scores', label: 'Scoreboard', icon: <ScoreIcon />, component: ScoreView },
  ];

  const visibleTabs = allTabs.filter(tab => !tab.legacy || showLegacyTabs);
  const ActiveComponent = allTabs.find(tab => tab.id === activeTab)?.component || PersonManagement;

  const handleTabChange = (event: React.SyntheticEvent, newValue: TabType) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default' }}>
        {/* App Bar */}
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              🏆 Reward & Punishment System
            </Typography>
            <Chip
              label="Web Interface"
              variant="outlined"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            />
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Legacy System Toggle */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: 'background.paper' }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Manage persons, actions, and track scores with the new unified system
              </Typography>
            </Alert>

            <FormControlLabel
              control={
                <Switch
                  checked={showLegacyTabs}
                  onChange={(e) => setShowLegacyTabs(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    Show legacy Rewards/Punishments tabs
                  </Typography>
                  <Chip
                    label="Migration"
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                </Box>
              }
            />
          </Paper>

          {/* Navigation Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {visibleTabs.map((tab) => (
                <Tab
                  key={tab.id}
                  value={tab.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {tab.icon}
                      {tab.label}
                      {tab.legacy && (
                        <Chip
                          label="Legacy"
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Paper>

          {/* Main Content */}
          <Box sx={{ minHeight: '60vh' }}>
            <ActiveComponent />
          </Box>

          {/* Footer */}
          <Paper sx={{ mt: 4, p: 3, textAlign: 'center', backgroundColor: 'background.paper' }}>
            <Typography variant="body2" color="text.secondary">
              Reward & Punishment System - Web Interface
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Backend API: <code>http://localhost:3000</code>
            </Typography>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
