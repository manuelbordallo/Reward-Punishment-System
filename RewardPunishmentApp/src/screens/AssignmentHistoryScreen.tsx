import React, { useEffect } from 'react';
import {
    View,
    StyleSheet,
    Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAssignments, deleteAssignment } from '../store/slices/assignmentSlice';
import { AssignmentHistory } from '../components/AssignmentHistory';

export const AssignmentHistoryScreen: React.FC = () => {
    const dispatch = useAppDispatch();

    // Get data from Redux store
    const { assignments, loading, error } = useAppSelector(state => state.assignments);

    // Load initial data
    useEffect(() => {
        dispatch(fetchAssignments());
    }, [dispatch]);

    // Show error if there's an error
    useEffect(() => {
        if (error) {
            Alert.alert(
                'Error',
                `Error al cargar el historial: ${error}`,
                [{ text: 'OK' }]
            );
        }
    }, [error]);

    const handleDeleteAssignment = async (assignmentId: number) => {
        try {
            const result = await dispatch(deleteAssignment(assignmentId));

            if (deleteAssignment.fulfilled.match(result)) {
                Alert.alert(
                    'Asignación Eliminada',
                    'La asignación ha sido eliminada exitosamente.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Assignment deletion error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <AssignmentHistory
                assignments={assignments}
                loading={loading}
                onDeleteAssignment={handleDeleteAssignment}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
});