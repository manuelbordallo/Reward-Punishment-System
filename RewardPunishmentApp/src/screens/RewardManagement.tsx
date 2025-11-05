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
    fetchRewards,
    createReward,
    updateRewardAsync,
    deleteReward,
    clearError,
} from '../store/slices/rewardSlice';
import { RewardList } from '../components/RewardList';
import { RewardForm } from '../components/RewardForm';
import { Reward } from '../types';

export const RewardManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { rewards, loading, error } = useSelector((state: RootState) => state.rewards);

    const [showForm, setShowForm] = useState(false);
    const [editingReward, setEditingReward] = useState<Reward | null>(null);

    useEffect(() => {
        // Load rewards when component mounts
        dispatch(fetchRewards());
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

    const handleAddReward = () => {
        setEditingReward(null);
        setShowForm(true);
    };

    const handleEditReward = (reward: Reward) => {
        setEditingReward(reward);
        setShowForm(true);
    };

    const handleDeleteReward = async (rewardId: number) => {
        try {
            await dispatch(deleteReward(rewardId)).unwrap();
        } catch {
            // Error is handled by the error effect above
        }
    };

    const handleFormSubmit = async (name: string, value: number) => {
        try {
            if (editingReward) {
                // Update existing reward
                await dispatch(updateRewardAsync({
                    ...editingReward,
                    name,
                    value,
                })).unwrap();
            } else {
                // Create new reward
                await dispatch(createReward({ name, value })).unwrap();
            }

            // Close form on success
            setShowForm(false);
            setEditingReward(null);
        } catch {
            // Error is handled by the error effect above
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingReward(null);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Gestión de Premios</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddReward}
                    disabled={loading}
                >
                    <Text style={styles.addButtonText}>+ Agregar</Text>
                </TouchableOpacity>
            </View>

            {showForm && (
                <RewardForm
                    reward={editingReward}
                    loading={loading}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            )}

            <RewardList
                rewards={rewards}
                loading={loading}
                onEditReward={handleEditReward}
                onDeleteReward={handleDeleteReward}
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
        backgroundColor: '#34C759',
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