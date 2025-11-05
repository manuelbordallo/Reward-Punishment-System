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
import { fetchTotalScores, fetchAssignments } from '../store/slices/assignmentSlice';
import { fetchPersons } from '../store/slices/personSlice';
import { ScoreboardView } from '../components/ScoreboardView';
import { selectCalculatedTotalScores, selectAssignmentsByPersonId } from '../store/selectors';
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
                    <Text style={styles.modalTitle}>Desglose de {personScore.personName}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                    <View style={styles.summarySection}>
                        <Text style={styles.sectionTitle}>Resumen</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Puntuación Total:</Text>
                            <Text style={[
                                styles.summaryValue,
                                { color: personScore.totalScore >= 0 ? '#34C759' : '#FF3B30' }
                            ]}>
                                {personScore.totalScore > 0 ? '+' : ''}{personScore.totalScore}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total de Asignaciones:</Text>
                            <Text style={styles.summaryValue}>{personScore.assignmentCount}</Text>
                        </View>
                    </View>

                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Premios ({rewardAssignments.length})</Text>
                        <View style={styles.categoryTotal}>
                            <Text style={styles.categoryTotalLabel}>Total de Premios:</Text>
                            <Text style={[styles.categoryTotalValue, { color: '#34C759' }]}>
                                +{rewardTotal}
                            </Text>
                        </View>
                        {rewardAssignments.length > 0 ? (
                            rewardAssignments.map((assignment, index) => (
                                <View key={`reward-${index}`} style={styles.assignmentItem}>
                                    <Text style={styles.assignmentName}>{assignment.itemName}</Text>
                                    <Text style={[styles.assignmentValue, { color: '#34C759' }]}>
                                        +{assignment.itemValue}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No hay premios asignados</Text>
                        )}
                    </View>

                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Castigos ({punishmentAssignments.length})</Text>
                        <View style={styles.categoryTotal}>
                            <Text style={styles.categoryTotalLabel}>Total de Castigos:</Text>
                            <Text style={[styles.categoryTotalValue, { color: '#FF3B30' }]}>
                                {punishmentTotal}
                            </Text>
                        </View>
                        {punishmentAssignments.length > 0 ? (
                            punishmentAssignments.map((assignment, index) => (
                                <View key={`punishment-${index}`} style={styles.assignmentItem}>
                                    <Text style={styles.assignmentName}>{assignment.itemName}</Text>
                                    <Text style={[styles.assignmentValue, { color: '#FF3B30' }]}>
                                        {assignment.itemValue}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No hay castigos asignados</Text>
                        )}
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

export const TotalScoresScreen: React.FC = () => {
    const dispatch = useAppDispatch();
    const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Get data from Redux store
    const { loading, error } = useAppSelector(state => state.assignments);
    const calculatedScores = useAppSelector(selectCalculatedTotalScores);

    // Get selected person's assignments for detail modal
    const selectedPersonAssignments = useAppSelector(state =>
        selectedPersonId ? selectAssignmentsByPersonId(state, selectedPersonId) : []
    );

    const selectedPersonScore = calculatedScores.find(score => score.personId === selectedPersonId) || null;

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load persons, assignments, and scores
                await Promise.all([
                    dispatch(fetchPersons()),
                    dispatch(fetchAssignments()),
                    dispatch(fetchTotalScores()),
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
                `Error al cargar las puntuaciones: ${error}`,
                [{ text: 'OK' }]
            );
        }
    }, [error]);

    const handleRefresh = async () => {
        try {
            await Promise.all([
                dispatch(fetchPersons()),
                dispatch(fetchAssignments()),
                dispatch(fetchTotalScores()),
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

    return (
        <View style={styles.container}>
            <ScoreboardView
                scores={calculatedScores}
                loading={loading}
                onRefresh={handleRefresh}
                onPersonPress={handlePersonPress}
            />

            <PersonDetailModal
                visible={modalVisible}
                personScore={selectedPersonScore}
                assignments={selectedPersonAssignments}
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
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
    assignmentName: {
        fontSize: 16,
        color: '#000000',
        flex: 1,
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