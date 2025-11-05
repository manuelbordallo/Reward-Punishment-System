import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPersons } from '../store/slices/personSlice';
import { fetchRewards } from '../store/slices/rewardSlice';
import { fetchPunishments } from '../store/slices/punishmentSlice';
import { createAssignment } from '../store/slices/assignmentSlice';
import { AssignmentForm } from '../components/AssignmentForm';

export const AssignmentManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const [showForm, setShowForm] = useState(true);

    // Get data from Redux store
    const { persons, loading: personsLoading } = useAppSelector(state => state.persons);
    const { rewards, loading: rewardsLoading } = useAppSelector(state => state.rewards);
    const { punishments, loading: punishmentsLoading } = useAppSelector(state => state.punishments);
    const { loading: assignmentLoading, error: assignmentError } = useAppSelector(state => state.assignments);

    // Load initial data
    useEffect(() => {
        dispatch(fetchPersons());
        dispatch(fetchRewards());
        dispatch(fetchPunishments());
    }, [dispatch]);

    // Show error if assignment creation fails
    useEffect(() => {
        if (assignmentError) {
            Alert.alert(
                'Error',
                `No se pudo crear la asignación: ${assignmentError}`,
                [{ text: 'OK' }]
            );
        }
    }, [assignmentError]);

    const handleSubmit = async (data: {
        personIds: number[];
        itemType: 'reward' | 'punishment';
        itemId: number;
        itemName: string;
        itemValue: number;
    }) => {
        try {
            const result = await dispatch(createAssignment(data));

            if (createAssignment.fulfilled.match(result)) {
                // Success - show confirmation and reset form
                const personNames = persons
                    .filter(p => data.personIds.includes(p.id))
                    .map(p => p.name)
                    .join(', ');

                const actionText = data.itemType === 'reward' ? 'premio' : 'castigo';
                const valueText = data.itemValue > 0 ? `+${data.itemValue}` : data.itemValue.toString();

                Alert.alert(
                    'Asignación Exitosa',
                    `Se asignó ${actionText} "${data.itemName}" (${valueText} puntos) a: ${personNames}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Reset form by toggling showForm
                                setShowForm(false);
                                setTimeout(() => setShowForm(true), 100);
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            // Error handling is done through Redux state and useEffect above
            console.error('Assignment creation error:', error);
        }
    };

    const handleCancel = () => {
        // Reset form
        setShowForm(false);
        setTimeout(() => setShowForm(true), 100);
    };

    const isLoading = personsLoading || rewardsLoading || punishmentsLoading;

    // Show loading state while fetching initial data
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando datos...</Text>
            </View>
        );
    }

    // Show message if no data is available
    if (persons.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No hay personas registradas</Text>
                <Text style={styles.emptyMessage}>
                    Primero debes crear personas en la sección "Personas" para poder asignar premios y castigos.
                </Text>
            </View>
        );
    }

    if (rewards.length === 0 && punishments.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No hay premios ni castigos</Text>
                <Text style={styles.emptyMessage}>
                    Primero debes crear premios y/o castigos en sus respectivas secciones para poder hacer asignaciones.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {showForm && (
                <AssignmentForm
                    persons={persons}
                    rewards={rewards}
                    punishments={punishments}
                    loading={assignmentLoading}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            )}
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
        color: '#666666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyMessage: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
    },
});