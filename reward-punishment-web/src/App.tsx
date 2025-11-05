import React, { useState } from 'react';
import './App.css';
import PersonManagement from './components/PersonManagement';
import RewardManagement from './components/RewardManagement';
import PunishmentManagement from './components/PunishmentManagement';
import AssignmentManagement from './components/AssignmentManagement';
import ScoreView from './components/ScoreView';

type TabType = 'persons' | 'rewards' | 'punishments' | 'assignments' | 'scores';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('persons');

  const tabs = [
    { id: 'persons' as TabType, label: 'Persons', component: PersonManagement },
    { id: 'rewards' as TabType, label: 'Rewards', component: RewardManagement },
    { id: 'punishments' as TabType, label: 'Punishments', component: PunishmentManagement },
    { id: 'assignments' as TabType, label: 'Assignments', component: AssignmentManagement },
    { id: 'scores' as TabType, label: 'Scoreboard', component: ScoreView },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || PersonManagement;

  return (
    <div className="App">
      <header style={{ marginBottom: '20px' }}>
        <h1>🏆 Reward & Punishment System</h1>
        <p>Manage persons, rewards, punishments, and track scores</p>
      </header>

      <nav className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main>
        <ActiveComponent />
      </main>

      <footer style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid #ddd', color: '#666' }}>
        <p>Reward & Punishment System - Web Interface</p>
        <p>Backend API: <code>http://localhost:3000</code></p>
      </footer>
    </div>
  );
}

export default App;
