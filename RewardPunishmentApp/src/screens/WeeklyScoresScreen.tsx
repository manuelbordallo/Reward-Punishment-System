import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    Modal,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchWeeklyScores, fetchAssignments } from '../store/slices/assignmentSlice';
import { fetchPersons } from '../store/slices/personSlice';
import { ScoreboardView } from '../components/ScoreboardView';
import { selectCalculatedWeeklyScores } from '../store/selectors';
import { PersonScore, Assignment } from '../types';

interface PersonDetailModalProps {
    visible: boolean;
    personScore: PersonScore | null;
    assignments: Assignment[];
    onClose: () => void;
}

const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
    visible,
    personScore,
    assignments,
    onClose,
}) => {
    if (!personScore) return null;

    const rewardAssignments = assignments.filter(a => a.itemType === 'reward');
    const punishmentAssignments = assignments.filter(a => a.itemType === 'punishment');

    const rewardTotal = rewardAssignments.reduce((sum, a) => sum + a.itemValue, 0);
    const punishmentTotal = punishmentAssignments.reduce((sum, a) => sum + a.itemValue, 0);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Semana Actual - {personScore.personName}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                    <View style={styles.summarySection}>
                        <Text style={styles.sectionTitle}>Resumen Semanal</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Puntuación Semanal:</Text>
                            <Text style={[
                                styles.summaryValue,
                                { color: personScore.weeklyScore >= 0 ? '#34C759' : '#FF3B30' }
                            ]}>
                                {personScore.weeklyScore > 0 ? '+' : ''}{personScore.weeklyScore}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Asignaciones esta Semana:</Text>
                            <Text style={styles.summaryValue}>{personScore.assignmentCount}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Puntuación Total:</Text>
                            <Text style={[
                                styles.summaryValue,
                                { color: personScore.totalScore >= 0 ? '#34C759' : '#FF3B30' }
                            ]}>
                                {personScore.totalScore > 0 ? '+' : ''}{personScore.totalScore}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Premios esta Semana ({rewardAssignments.length})</Text>
                        <View style={styles.categoryTotal}>
                            <Text style={styles.categoryTotalLabel}>Total de Premios:</Text>
                            <Text style={[styles.categoryTotalValue, { color: '#34C759' }]}>
                                +{rewardTotal}
                            </Text>
                        </View>
                        {rewardAssignments.length > 0 ? (
                            rewardAssignments.map((assignment, index) => (
                                <View key={`reward-${index}`} style={styles.assignmentItem}>
                                    <View style={styles.assignmentInfo}>
                                        <Text style={styles.assignmentName}>{assignment.itemName}</Text>
                                        <Text style={styles.assignmentDate}>
                                            {new Date(assignment.assignedAt).toLocaleDateString('es-ES', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Text>
                                    </View>
                                    <Text style={[styles.assignmentValue, { color: '#34C759' }]}>
                                        +{assignment.itemValue}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No hay premios asignados esta semana</Text>
                        )}
                    </View>

                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Castigos esta Semana ({punishmentAssignments.length})</Text>
                        <View style={styles.categoryTotal}>
                            <Text style={styles.categoryTotalLabel}>Total de Castigos:</Text>
                            <Text style={[styles.categoryTotalValue, { color: '#FF3B30' }]}>
                                {punishmentTotal}
                            </Text>
                        </View>
                        {punishmentAssignments.length > 0 ? (
                            punishmentAssignments.map((assignment, index) => (
                                <View key={`punishment-${index}`} style={styles.assignmentItem}>
                                    <View style={styles.assignmentInfo}>
                                        <Text style={styles.assignmentName}>{assignment.itemName}</Text>
                                        <Text style={styles.assignmentDate}>
                                            {new Date(assignment.assignedAt).toLocaleDateString('es-ES', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Text>
                                    </View>
                                    <Text style={[styles.assignmentValue, { color: '#FF3B30' }]}>
                                        {assignment.itemValue}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No hay castigos asignados esta semana</Text>
                        )}
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

export const WeeklyScoresScreen: React.FC = () => {
    const dispatch = useAppDispatch();
    const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Get data from Redux store
    const { loading, error } = useAppSelector(state => state.assignments);
    const calculatedWeeklyScores = useAppSelector(selectCalculatedWeeklyScores);

    // Calculate current week info directly
    const currentWeekInfo = React.useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        endOfWeek.setHours(23, 59, 59, 999);

        // Calculate week number
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

        return {
            startDate: startOfWeek,
            endDate: endOfWeek,
            weekNumber,
        };
    }, []);

    // Get selected person's weekly assignments for detail modal
    const allAssignments = useAppSelector(state => state.assignments.assignments);
    const selectedPersonWeeklyAssignments = React.useMemo(() => {
        if (!selectedPersonId) return [];

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        endOfWeek.setHours(23, 59, 59, 999);

        return allAssignments.filter(assignment => {
            const assignedDate = new Date(assignment.assignedAt);
            return assignment.personId === selectedPersonId &&
                assignedDate >= startOfWeek &&
                assignedDate <= endOfWeek;
        });
    }, [allAssignments, selectedPersonId]);

    const selectedPersonScore = calculatedWeeklyScores.find(score => score.personId === selectedPersonId) || null;

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load persons, assignments, and weekly scores
                await Promise.all([
                    dispatch(fetchPersons()),
                    dispatch(fetchAssignments()),
                    dispatch(fetchWeeklyScores()),
                ]);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();
    }, [dispatch]);

    // Show error if there's an error
    useEffect(() => {
        if (error) {
            Alert.alert(
                'Error',
                `Error al cargar las puntuaciones semanales: ${error}`,
                [{ text: 'OK' }]
            );
        }
    }, [error]);

    const handleRefresh = async () => {
        try {
            await Promise.all([
                dispatch(fetchPersons()),
                dispatch(fetchAssignments()),
                dispatch(fetchWeeklyScores()),
            ]);
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    };

    const handlePersonPress = (personId: number) => {
        setSelectedPersonId(personId);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedPersonId(null);
    };

    const formatDateRange = () => {
        const startDate = currentWeekInfo.startDate.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });
        const endDate = currentWeekInfo.endDate.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });
        return `${startDate} - ${endDate}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.weekHeader}>
                <Text style={styles.weekTitle}>Semana Actual</Text>
                <Text style={styles.weekDates}>{formatDateRange()}</Text>
                <Text style={styles.weekNumber}>Semana {currentWeekInfo.weekNumber} de {currentWeekInfo.startDate.getFullYear()}</Text>
            </View>

            <ScoreboardView
                scores={calculatedWeeklyScores.map(score => ({
                    ...score,
                    totalScore: score.weeklyScore // Use weekly score for display
                }))}
                loading={loading}
                onRefresh={handleRefresh}
                onPersonPress={handlePersonPress}
            />

            <PersonDetailModal
                visible={modalVisible}
                personScore={selectedPersonScore}
                assignments={selectedPersonWeeklyAssignments}
                onClose={handleCloseModal}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    weekHeader: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    weekTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    weekDates: {
        fontSize: 18,
        color: '#007AFF',
        fontWeight: '600',
        marginBottom: 2,
    },
    weekNumber: {
        fontSize: 14,
        color: '#8E8E93',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        flex: 1,
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    summarySection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#000000',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    detailSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    categoryTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    categoryTotalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
    },
    categoryTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    assignmentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    assignmentInfo: {
        flex: 1,
    },
    assignmentName: {
        fontSize: 16,
        color: '#000000',
        marginBottom: 2,
    },
    assignmentDate: {
        fontSize: 12,
        color: '#8E8E93',
    },
    assignmentValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 16,
        color: '#8E8E93',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 16,
    },
});