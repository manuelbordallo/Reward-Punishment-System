import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Reward } from '../types';

interface RewardListProps {
  rewards: Reward[];
  loading: boolean;
  onEditReward: (reward: Reward) => void;
  onDeleteReward: (rewardId: number) => void;
}

export const RewardList: React.FC<RewardListProps> = ({
  rewards,
  loading,
  onEditReward,
  onDeleteReward,
}) => {
  const handleDeletePress = (reward: Reward) => {
    Alert.alert(
      'Eliminar Premio',
      `¿Estás seguro de que quieres eliminar "${reward.name}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDeleteReward(reward.id),
        },
      ]
    );
  };

  const renderRewardItem = ({ item }: { item: Reward }) => (
    <View style={styles.rewardItem}>
      <View style={styles.rewardInfo}>
        <Text style={styles.rewardName}>{item.name}</Text>
        <View style={styles.rewardDetails}>
          <Text style={styles.rewardValue}>+{item.value} puntos</Text>
          <Text style={styles.rewardDate}>
            Creado: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEditReward(item)}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePress(item)}
        >
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Cargando premios...</Text>
      </View>
    );
  }

  if (rewards.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No hay premios registrados</Text>
        <Text style={styles.emptySubtext}>
          Agrega un nuevo premio para comenzar
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={rewards}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderRewardItem}
      style={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  rewardItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  rewardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  rewardDate: {
    fontSize: 14,
    color: '#666666',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});