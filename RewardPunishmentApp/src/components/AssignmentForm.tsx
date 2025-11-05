import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Person, Reward, Punishment } from '../types';

interface AssignmentFormProps {
  persons: Person[];
  rewards: Reward[];
  punishments: Punishment[];
  loading: boolean;
  onSubmit: (data: {
    personIds: number[];
    itemType: 'reward' | 'punishment';
    itemId: number;
    itemName: string;
    itemValue: number;
  }) => void;
  onCancel: () => void;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({
  persons,
  rewards,
  punishments,
  loading,
  onSubmit,
  onCancel,
}) => {
  const [selectedPersons, setSelectedPersons] = useState<Set<number>>(new Set());
  const [selectedItemType, setSelectedItemType] = useState<'reward' | 'punishment' | null>(null);
  const [selectedItem, setSelectedItem] = useState<Reward | Punishment | null>(null);
  const [errors, setErrors] = useState<{
    persons?: string;
    itemType?: string;
    item?: string;
  }>({});

  // Reset form when component mounts or when data changes
  useEffect(() => {
    setSelectedPersons(new Set());
    setSelectedItemType(null);
    setSelectedItem(null);
    setErrors({});
  }, [persons, rewards, punishments]);

  const togglePersonSelection = (personId: number) => {
    const newSelection = new Set(selectedPersons);
    if (newSelection.has(personId)) {
      newSelection.delete(personId);
    } else {
      newSelection.add(personId);
    }
    setSelectedPersons(newSelection);
    
    // Clear person selection error if any person is selected
    if (newSelection.size > 0 && errors.persons) {
      setErrors(prev => ({ ...prev, persons: undefined }));
    }
  };

  const selectItemType = (itemType: 'reward' | 'punishment') => {
    setSelectedItemType(itemType);
    setSelectedItem(null); // Reset item selection when type changes
    
    // Clear item type error
    if (errors.itemType) {
      setErrors(prev => ({ ...prev, itemType: undefined }));
    }
  };

  const selectItem = (item: Reward | Punishment) => {
    setSelectedItem(item);
    
    // Clear item selection error
    if (errors.item) {
      setErrors(prev => ({ ...prev, item: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate person selection
    if (selectedPersons.size === 0) {
      newErrors.persons = 'Debes seleccionar al menos una persona';
    }

    // Validate item type selection
    if (!selectedItemType) {
      newErrors.itemType = 'Debes seleccionar si es un premio o castigo';
    }

    // Validate item selection
    if (!selectedItem) {
      newErrors.item = 'Debes seleccionar un elemento específico';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    if (!selectedItem || !selectedItemType) {
      return;
    }

    // Show confirmation dialog
    const personNames = persons
      .filter(p => selectedPersons.has(p.id))
      .map(p => p.name)
      .join(', ');

    const actionText = selectedItemType === 'reward' ? 'premio' : 'castigo';
    const valueText = selectedItem.value > 0 ? `+${selectedItem.value}` : selectedItem.value.toString();

    Alert.alert(
      'Confirmar Asignación',
      `¿Asignar ${actionText} "${selectedItem.name}" (${valueText} puntos) a: ${personNames}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => {
            onSubmit({
              personIds: Array.from(selectedPersons),
              itemType: selectedItemType,
              itemId: selectedItem.id,
              itemName: selectedItem.name,
              itemValue: selectedItem.value,
            });
          },
        },
      ]
    );
  };

  const isFormValid = selectedPersons.size > 0 && selectedItemType && selectedItem;
  const availableItems = selectedItemType === 'reward' ? rewards : punishments;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Nueva Asignación</Text>

        {/* Person Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seleccionar Personas</Text>
          {errors.persons && (
            <Text style={styles.errorText}>{errors.persons}</Text>
          )}
          <View style={styles.personGrid}>
            {persons.map((person) => (
              <TouchableOpacity
                key={person.id}
                style={[
                  styles.personCard,
                  selectedPersons.has(person.id) ? styles.selectedPersonCard : null,
                ]}
                onPress={() => togglePersonSelection(person.id)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.personName,
                    selectedPersons.has(person.id) ? styles.selectedPersonName : null,
                  ]}
                >
                  {person.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedPersons.size > 0 && (
            <Text style={styles.selectionCount}>
              {selectedPersons.size} persona{selectedPersons.size > 1 ? 's' : ''} seleccionada{selectedPersons.size > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Item Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Elemento</Text>
          {errors.itemType && (
            <Text style={styles.errorText}>{errors.itemType}</Text>
          )}
          <View style={styles.itemTypeContainer}>
            <TouchableOpacity
              style={[
                styles.itemTypeButton,
                styles.rewardButton,
                selectedItemType === 'reward' ? styles.selectedRewardButton : null,
              ]}
              onPress={() => selectItemType('reward')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.itemTypeText,
                  selectedItemType === 'reward' ? styles.selectedItemTypeText : null,
                ]}
              >
                Premio
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.itemTypeButton,
                styles.punishmentButton,
                selectedItemType === 'punishment' ? styles.selectedPunishmentButton : null,
              ]}
              onPress={() => selectItemType('punishment')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.itemTypeText,
                  selectedItemType === 'punishment' ? styles.selectedItemTypeText : null,
                ]}
              >
                Castigo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Item Selection */}
        {selectedItemType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Seleccionar {selectedItemType === 'reward' ? 'Premio' : 'Castigo'}
            </Text>
            {errors.item && (
              <Text style={styles.errorText}>{errors.item}</Text>
            )}
            <View style={styles.itemList}>
              {availableItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.itemCard,
                    selectedItem?.id === item.id ? styles.selectedItemCard : null,
                  ]}
                  onPress={() => selectItem(item)}
                  disabled={loading}
                >
                  <View style={styles.itemInfo}>
                    <Text
                      style={[
                        styles.itemName,
                        selectedItem?.id === item.id ? styles.selectedItemName : null,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.itemValue,
                        selectedItemType === 'reward' ? styles.rewardValue : styles.punishmentValue,
                        selectedItem?.id === item.id ? styles.selectedItemValue : null,
                      ]}
                    >
                      {item.value > 0 ? `+${item.value}` : item.value} puntos
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {availableItems.length === 0 && (
              <Text style={styles.emptyText}>
                No hay {selectedItemType === 'reward' ? 'premios' : 'castigos'} disponibles
              </Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              (!isFormValid || loading) ? styles.disabledButton : null,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || loading}
          >
            <Text
              style={[
                styles.submitButtonText,
                (!isFormValid || loading) ? styles.disabledButtonText : null,
              ]}
            >
              {loading ? 'Asignando...' : 'Asignar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  formContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 8,
  },
  // Person Selection Styles
  personGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  selectedPersonCard: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  personName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
  selectedPersonName: {
    color: '#FFFFFF',
  },
  selectionCount: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  // Item Type Selection Styles
  itemTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  itemTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  rewardButton: {
    backgroundColor: '#F0F9FF',
    borderColor: '#34C759',
  },
  selectedRewardButton: {
    backgroundColor: '#34C759',
  },
  punishmentButton: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FF3B30',
  },
  selectedPunishmentButton: {
    backgroundColor: '#FF3B30',
  },
  itemTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  selectedItemTypeText: {
    color: '#FFFFFF',
  },
  // Item Selection Styles
  itemList: {
    gap: 8,
  },
  itemCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedItemCard: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  selectedItemName: {
    color: '#007AFF',
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  rewardValue: {
    color: '#34C759',
  },
  punishmentValue: {
    color: '#FF3B30',
  },
  selectedItemValue: {
    color: '#007AFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  // Button Styles
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#E1E1E1',
  },
  cancelButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999999',
  },
});