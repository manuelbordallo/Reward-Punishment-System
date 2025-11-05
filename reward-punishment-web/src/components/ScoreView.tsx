import React, { useState, useEffect } from 'react';
import { Score, WeeklyScore } from '../types';
import { scoreApi } from '../services/api';

const ScoreView: React.FC = () => {
    const [totalScores, setTotalScores] = useState<Score[]>([]);
    const [weeklyScores, setWeeklyScores] = useState<WeeklyScore[]>([]);
    const [viewType, setViewType] = useState<'total' | 'weekly'>('total');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadScores();
    }, [viewType]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadScores = async () => {
        try {
            setLoading(true);
            if (viewType === 'total') {
                const response = await scoreApi.getTotal();
                setTotalScores(response.data.data || []);
            } else {
                const response = await scoreApi.getWeekly();
                setWeeklyScores(response.data.data || []);
            }
        } catch (err) {
            setError('Failed to load scores');
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError('');

    const getScoreClass = (score: number) => {
        if (score > 0) return 'score-positive';
        if (score < 0) return 'score-negative';
        return 'score-zero';
    };

    const getRankEmoji = (index: number) => {
        switch (index) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            default: return `#${index + 1}`;
        }
    };

    return (
        <div className="section">
            <h2>Scoreboard</h2>

            {error && (
                <div className="error">
                    {error}
                    <button onClick={clearError} style={{ float: 'right' }}>×</button>
                </div>
            )}

            <div className="form-group">
                <label>View Type:</label>
                <select
                    value={viewType}
                    onChange={(e) => setViewType(e.target.value as 'total' | 'weekly')}
                >
                    <option value="total">Total Scores</option>
                    <option value="weekly">Weekly Scores</option>
                </select>
            </div>

            <button className="btn btn-primary" onClick={loadScores}>
                Refresh Scores
            </button>

            {loading ? (
                <div className="loading">Loading scores...</div>
            ) : (
                <div>
                    {viewType === 'total' ? (
                        <div>
                            <h3>Total Scores ({totalScores.length} persons)</h3>
                            {totalScores.length === 0 ? (
                                <p>No scores available. Create some assignments first!</p>
                            ) : (
                                totalScores.map((score, index) => (
                                    <div key={score.personId} className={`score-item ${getScoreClass(score.totalScore)}`}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                                                    {getRankEmoji(index)}
                                                </span>
                                                <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>
                                                    {score.personName}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                                                Assignments: {score.assignmentCount} | Average: {score.averageScore}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                fontSize: '1.5em',
                                                fontWeight: 'bold',
                                                color: score.totalScore > 0 ? '#28a745' : score.totalScore < 0 ? '#dc3545' : '#6c757d'
                                            }}>
                                                {score.totalScore > 0 ? '+' : ''}{score.totalScore}
                                            </div>
                                            <div style={{ fontSize: '0.8em', color: '#666' }}>
                                                points
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div>
                            <h3>Weekly Scores ({weeklyScores.length} persons)</h3>
                            {weeklyScores.length === 0 ? (
                                <p>No weekly scores available. Create some assignments first!</p>
                            ) : (
                                weeklyScores.map((score, index) => (
                                    <div key={score.personId} className={`score-item ${getScoreClass(score.weeklyScore)}`}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                                                    {getRankEmoji(index)}
                                                </span>
                                                <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>
                                                    {score.personName}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                                                Weekly assignments: {score.weeklyAssignmentCount} | Average: {score.averageWeeklyScore}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                fontSize: '1.5em',
                                                fontWeight: 'bold',
                                                color: score.weeklyScore > 0 ? '#28a745' : score.weeklyScore < 0 ? '#dc3545' : '#6c757d'
                                            }}>
                                                {score.weeklyScore > 0 ? '+' : ''}{score.weeklyScore}
                                            </div>
                                            <div style={{ fontSize: '0.8em', color: '#666' }}>
                                                points
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ScoreView;