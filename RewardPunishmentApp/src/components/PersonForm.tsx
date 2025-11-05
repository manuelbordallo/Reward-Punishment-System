import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Person } from '../types';

interface PersonFormProps {
  person?: Person | null;
  existingNames: string[];
  loading: boolean;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export const PersonForm: React.FC<PersonFormProps> = ({
  person,
  existingNames,
  loading,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (person) {
      setName(person.name);
    } else {
      setName('');
    }
    setNameError('');
  }, [person]);

  const validateName = (inputName: string): boolean => {
    const trimmedName = inputName.trim();
    
    // Check if name is empty
    if (!trimmedName) {
      setNameError('El nombre no puede estar vacío');
      return false;
    }

    // Check if name already exists (excluding current person when editing)
    const normalizedInput = trimmedName.toLowerCase();
    const isDuplicate = existingNames.some(existingName => {
      const normalizedExisting = existingName.toLowerCase();
      // When editing, exclude the current person's name from duplicate check
      if (person && person.name.toLowerCase() === normalizedExisting) {
        return false;
      }
      return normalizedExisting === normalizedInput;
    });

    if (isDuplicate) {
      setNameError('Ya existe una persona con este nombre');
      return false;
    }

    setNameError('');
    return true;
  };

  const handleSubmit = () => {
    if (validateName(name)) {
      onSubmit(name.trim());
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
    // Clear error when user starts typing
    if (nameError) {
      setNameError('');
    }
  };

  const isFormValid = name.trim().length > 0 && !nameError;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {person ? 'Editar Persona' : 'Nueva Persona'}
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={[
            styles.input,
            nameError ? styles.inputError : null,
          ]}
          value={name}
          onChangeText={handleNameChange}
          onBlur={() => validateName(name)}
          placeholder="Ingresa el nombre de la persona"
          placeholderTextColor="#999999"
          autoCapitalize="words"
          autoCorrect={false}
          editable={!loading}
        />
        {nameError ? (
          <Text style={styles.errorText}>{nameError}</Text>
        ) : null}
      </View>

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
          <Text style={[
            styles.submitButtonText,
            (!isFormValid || loading) ? styles.disabledButtonText : null,
          ]}>
            {loading ? 'Guardando...' : (person ? 'Actualizar' : 'Crear')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
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