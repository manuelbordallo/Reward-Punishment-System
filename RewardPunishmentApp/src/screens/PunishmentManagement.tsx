import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
    fetchPunishments,
    createPunishment,
    updatePunishmentAsync,
    deletePunishment,
    clearError,
} from '../store/slices/punishmentSlice';
import { PunishmentList } from '../components/PunishmentList';
import { PunishmentForm } from '../components/PunishmentForm';
import { Punishment } from '../types';

export const PunishmentManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { punishments, loading, error } = useSelector((state: RootState) => state.punishments);

    const [showForm, setShowForm] = useState(false);
    const [editingPunishment, setEditingPunishment] = useState<Punishment | null>(null);

    useEffect(() => {
        // Load punishments when component mounts
        dispatch(fetchPunishments());
    }, [dispatch]);

    useEffect(() => {
        // Show error alert if there's an error
        if (error) {
            Alert.alert('Error', error, [
                {
                    text: 'OK',
                    onPress: () => dispatch(clearError()),
                },
            ]);
        }
    }, [error, dispatch]);

    const handleAddPunishment = () => {
        setEditingPunishment(null);
        setShowForm(true);
    };

    const handleEditPunishment = (punishment: Punishment) => {
        setEditingPunishment(punishment);
        setShowForm(true);
    };

    const handleDeletePunishment = async (punishmentId: number) => {
        try {
            await dispatch(deletePunishment(punishmentId)).unwrap();
        } catch {
            // Error is handled by the error effect above
        }
    };

    const handleFormSubmit = async (name: string, value: number) => {
        try {
            if (editingPunishment) {
                // Update existing punishment
                await dispatch(updatePunishmentAsync({
                    ...editingPunishment,
                    name,
                    value,
                })).unwrap();
            } else {
                // Create new punishment
                await dispatch(createPunishment({ name, value })).unwrap();
            }

            // Close form on success
            setShowForm(false);
            setEditingPunishment(null);
        } catch {
            // Error is handled by the error effect above
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingPunishment(null);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Gestión de Castigos</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddPunishment}
                    disabled={loading}
                >
                    <Text style={styles.addButtonText}>+ Agregar</Text>
                </TouchableOpacity>
            </View>

            {showForm && (
                <PunishmentForm
                    punishment={editingPunishment}
                    loading={loading}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            )}

            <PunishmentList
                punishments={punishments}
                loading={loading}
                onEditPunishment={handleEditPunishment}
                onDeletePunishment={handleDeletePunishment}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E1E1E1',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333333',
    },
    addButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
});