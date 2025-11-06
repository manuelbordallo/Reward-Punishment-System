import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Alert,
    CircularProgress,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Avatar,
    Divider,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import {
    Leaderboard,
    TrendingUp,
    TrendingDown,
    EmojiEvents,
    Refresh,
    Person,
    CalendarToday,
    Assessment
} from '@mui/icons-material';
import { Score, WeeklyScore } from '../types/index';
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
            setError('');

            if (viewType === 'total') {
                const response = await scoreApi.getTotal();
                console.log('Total scores response:', response.data);
                setTotalScores(response.data.data || []);
            } else {
                const response = await scoreApi.getWeekly();
                console.log('Weekly scores full response:', response);
                console.log('Weekly scores response.data:', response.data);
                console.log('Weekly scores response.data.data:', response.data.data);
                console.log('Weekly scores response.data.success:', response.data.success);

                const weeklyData = response.data.data || [];
                console.log('Setting weekly scores to:', weeklyData);
                setWeeklyScores(weeklyData);
            }
        } catch (err) {
            console.error('Error loading scores:', err);
            setError(`Failed to load ${viewType} scores: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError('');

    const getRankEmoji = (index: number) => {
        switch (index) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            default: return `#${index + 1}`;
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Leaderboard color="primary" />
                Scoreboard
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
                    {error}
                </Alert>
            )}

            {/* Controls */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <ToggleButtonGroup
                            value={viewType}
                            exclusive
                            onChange={(e, newValue) => newValue && setViewType(newValue)}
                            aria-label="view type"
                        >
                            <ToggleButton value="total" aria-label="total scores">
                                <Assessment sx={{ mr: 1 }} />
                                Total Scores
                            </ToggleButton>
                            <ToggleButton value="weekly" aria-label="weekly scores">
                                <CalendarToday sx={{ mr: 1 }} />
                                Weekly Scores
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Refresh />}
                                onClick={loadScores}
                                disabled={loading}
                            >
                                Refresh
                            </Button>
                            {process.env.NODE_ENV === 'development' && (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={async () => {
                                        try {
                                            const response = await fetch('/api/scores/weekly');
                                            const data = await response.json();
                                            console.log('Raw API Response:', data);
                                            alert(`API Response: ${JSON.stringify(data, null, 2)}`);
                                        } catch (err) {
                                            console.error('API Test Error:', err);
                                            alert(`API Error: ${err}`);
                                        }
                                    }}
                                >
                                    Test API
                                </Button>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <Card>
                    <CardContent>
                        {viewType === 'total' ? (
                            <>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <EmojiEvents color="warning" />
                                    Total Scores ({totalScores.length} persons)
                                </Typography>
                                {totalScores.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Assessment color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                                        <Typography color="textSecondary">
                                            No scores available. Create some assignments first!
                                        </Typography>
                                    </Box>
                                ) : (
                                    <List>
                                        {totalScores.map((score, index) => (
                                            <React.Fragment key={score.personId}>
                                                <ListItem sx={{ py: 2 }}>
                                                    <ListItemIcon>
                                                        <Avatar
                                                            sx={{
                                                                bgcolor: index < 3 ? 'warning.main' : 'primary.main',
                                                                width: 48,
                                                                height: 48,
                                                                fontSize: '1.2rem'
                                                            }}
                                                        >
                                                            {getRankEmoji(index)}
                                                        </Avatar>
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography variant="h6">
                                                                    {score.personName}
                                                                </Typography>
                                                                <Chip
                                                                    icon={score.totalScore > 0 ? <TrendingUp /> : score.totalScore < 0 ? <TrendingDown /> : <Person />}
                                                                    label={`${score.totalScore > 0 ? '+' : ''}${score.totalScore} points`}
                                                                    color={score.totalScore > 0 ? 'success' : score.totalScore < 0 ? 'error' : 'default'}
                                                                    sx={{ fontWeight: 'bold' }}
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box sx={{ mt: 1 }}>
                                                                <Chip
                                                                    label={`${score.assignmentCount} assignments`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{ mr: 1 }}
                                                                />
                                                                <Chip
                                                                    label={`${score.averageScore} avg`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                                {index < totalScores.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                )}
                            </>
                        ) : (
                            <>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarToday color="info" />
                                        Weekly Scores ({weeklyScores.length} persons)
                                    </Typography>
                                    {weeklyScores.length > 0 && weeklyScores.every(s => s.weeklyScore === 0) && (
                                        <Alert severity="info" sx={{ mb: 2 }}>
                                            All persons have 0 points for this week. Create some assignments to see scores!
                                        </Alert>
                                    )}
                                </Box>
                                {weeklyScores.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <CalendarToday color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                                        <Typography color="textSecondary" gutterBottom>
                                            No persons found for weekly scores.
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                            This might indicate an issue with the API or database connection.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <List>
                                        {weeklyScores.map((score, index) => (
                                            <React.Fragment key={score.personId}>
                                                <ListItem sx={{ py: 2 }}>
                                                    <ListItemIcon>
                                                        <Avatar
                                                            sx={{
                                                                bgcolor: index < 3 ? 'info.main' : 'secondary.main',
                                                                width: 48,
                                                                height: 48,
                                                                fontSize: '1.2rem'
                                                            }}
                                                        >
                                                            {getRankEmoji(index)}
                                                        </Avatar>
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography variant="h6">
                                                                    {score.personName}
                                                                </Typography>
                                                                <Chip
                                                                    icon={(score.weeklyScore || 0) > 0 ? <TrendingUp /> : (score.weeklyScore || 0) < 0 ? <TrendingDown /> : <Person />}
                                                                    label={`${(score.weeklyScore || 0) > 0 ? '+' : ''}${score.weeklyScore || 0} points`}
                                                                    color={(score.weeklyScore || 0) > 0 ? 'success' : (score.weeklyScore || 0) < 0 ? 'error' : 'default'}
                                                                    sx={{ fontWeight: 'bold' }}
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box sx={{ mt: 1 }}>
                                                                <Chip
                                                                    label={`${score.weeklyAssignmentCount || 0} weekly assignments`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{ mr: 1 }}
                                                                />
                                                                <Chip
                                                                    label={`${score.averageWeeklyScore || 0} avg`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                                {process.env.NODE_ENV === 'development' && (
                                                                    <Chip
                                                                        label={`Week: ${new Date(score.weekStart).toLocaleDateString()} - ${new Date(score.weekEnd).toLocaleDateString()}`}
                                                                        size="small"
                                                                        color="info"
                                                                        variant="outlined"
                                                                        sx={{ ml: 1 }}
                                                                    />
                                                                )}
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                                {index < weeklyScores.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default ScoreView;