import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Person } from '../types';

interface PersonListProps {
  persons: Person[];
  loading: boolean;
  onEditPerson: (person: Person) => void;
  onDeletePerson: (personId: number) => void;
}

export const PersonList: React.FC<PersonListProps> = ({
  persons,
  loading,
  onEditPerson,
  onDeletePerson,
}) => {
  const handleDeletePress = (person: Person) => {
    Alert.alert(
      'Eliminar Persona',
      `¿Estás seguro de que quieres eliminar a ${person.name}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDeletePerson(person.id),
        },
      ]
    );
  };

  const renderPersonItem = ({ item }: { item: Person }) => (
    <View style={styles.personItem}>
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{item.name}</Text>
        <Text style={styles.personDate}>
          Creado: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEditPerson(item)}
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
        <Text style={styles.loadingText}>Cargando personas...</Text>
      </View>
    );
  }

  if (persons.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No hay personas registradas</Text>
        <Text style={styles.emptySubtext}>
          Agrega una nueva persona para comenzar
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={persons}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderPersonItem}
      style={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  personItem: {
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
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  personDate: {
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