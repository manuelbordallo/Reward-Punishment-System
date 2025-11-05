import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { PersonScore } from '../types';

interface ScoreboardViewProps {
    scores: PersonScore[];
    loading: boolean;
    onRefresh: () => void;
    onPersonPress?: (personId: number) => void;
}

interface ScoreItemProps {
    score: PersonScore;
    rank: number;
    onPress?: () => void;
}

const ScoreItem: React.FC<ScoreItemProps> = ({ score, rank, onPress }) => {
    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return '#FFD700'; // Gold
            case 2:
                return '#C0C0C0'; // Silver
            case 3:
                return '#CD7F32'; // Bronze
            default:
                return '#8E8E93'; // Gray
        }
    };

    const getRankEmoji = (rank: number) => {
        switch (rank) {
            case 1:
                return '🥇';
            case 2:
                return '🥈';
            case 3:
                return '🥉';
            default:
                return `${rank}`;
        }
    };

    const getScoreColor = (score: number) => {
        if (score > 0) return '#34C759'; // Green for positive
        if (score < 0) return '#FF3B30'; // Red for negative
        return '#8E8E93'; // Gray for zero
    };

    return (
        <TouchableOpacity
            style={styles.scoreItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.rankContainer}>
                <View style={[styles.rankBadge, { backgroundColor: getRankColor(rank) }]}>
                    <Text style={styles.rankText}>
                        {typeof getRankEmoji(rank) === 'string' && getRankEmoji(rank).includes('🥇') ? getRankEmoji(rank) : getRankEmoji(rank)}
                    </Text>
                </View>
            </View>

            <View style={styles.personInfo}>
                <Text style={styles.personName}>{score.personName}</Text>
                <Text style={styles.assignmentCount}>
                    {score.assignmentCount} asignación{score.assignmentCount !== 1 ? 'es' : ''}
                </Text>
            </View>

            <View style={styles.scoreContainer}>
                <Text style={[styles.totalScore, { color: getScoreColor(score.totalScore) }]}>
                    {score.totalScore > 0 ? '+' : ''}{score.totalScore}
                </Text>
                <Text style={styles.scoreLabel}>puntos</Text>
            </View>
        </TouchableOpacity>
    );
};

export const ScoreboardView: React.FC<ScoreboardViewProps> = ({
    scores,
    loading,
    onRefresh,
    onPersonPress,
}) => {
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
    };

    const renderScoreItem = ({ item, index }: { item: PersonScore; index: number }) => (
        <ScoreItem
            score={item}
            rank={index + 1}
            onPress={() => onPersonPress?.(item.personId)}
        />
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No hay puntuaciones</Text>
            <Text style={styles.emptyStateSubtitle}>
                Las puntuaciones aparecerán aquí cuando se asignen premios o castigos
            </Text>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Ranking de Puntuaciones</Text>
            <Text style={styles.headerSubtitle}>
                Puntuaciones totales ordenadas de mayor a menor
            </Text>
        </View>
    );

    if (loading && scores.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando puntuaciones...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={scores}
                renderItem={renderScoreItem}
                keyExtractor={(item) => item.personId.toString()}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#007AFF']}
                        tintColor="#007AFF"
                    />
                }
                contentContainerStyle={scores.length === 0 ? styles.emptyContainer : styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#8E8E93',
    },
    listContainer: {
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
    },
    scoreItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    rankContainer: {
        marginRight: 16,
    },
    rankBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    personInfo: {
        flex: 1,
        marginRight: 16,
    },
    personName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 2,
    },
    assignmentCount: {
        fontSize: 14,
        color: '#8E8E93',
    },
    scoreContainer: {
        alignItems: 'flex-end',
    },
    totalScore: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    scoreLabel: {
        fontSize: 12,
        color: '#8E8E93',
        textTransform: 'uppercase',
    },
});