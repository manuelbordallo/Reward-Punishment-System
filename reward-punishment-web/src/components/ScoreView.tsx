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

                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={loadScores}
                            disabled={loading}
                        >
                            Refresh
                        </Button>
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
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CalendarToday color="info" />
                                    Weekly Scores ({weeklyScores.length} persons)
                                </Typography>
                                {weeklyScores.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <CalendarToday color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                                        <Typography color="textSecondary">
                                            No weekly scores available. Create some assignments first!
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
                                                                    icon={score.weeklyScore > 0 ? <TrendingUp /> : score.weeklyScore < 0 ? <TrendingDown /> : <Person />}
                                                                    label={`${score.weeklyScore > 0 ? '+' : ''}${score.weeklyScore} points`}
                                                                    color={score.weeklyScore > 0 ? 'success' : score.weeklyScore < 0 ? 'error' : 'default'}
                                                                    sx={{ fontWeight: 'bold' }}
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box sx={{ mt: 1 }}>
                                                                <Chip
                                                                    label={`${score.weeklyAssignmentCount} weekly assignments`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{ mr: 1 }}
                                                                />
                                                                <Chip
                                                                    label={`${score.averageWeeklyScore} avg`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
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