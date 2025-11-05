import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    Alert,
    SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
    fetchPersons,
    createPerson,
    updatePersonAsync,
    deletePerson,
    clearError,
} from '../store/slices/personSlice';
import { PersonList } from '../components/PersonList';
import { PersonForm } from '../components/PersonForm';
import { Person } from '../types';

export const PersonManagement: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { persons, loading, error } = useSelector((state: RootState) => state.persons);

    const [showForm, setShowForm] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);

    useEffect(() => {
        // Load persons when component mounts
        dispatch(fetchPersons());
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

    const handleAddPerson = () => {
        setEditingPerson(null);
        setShowForm(true);
    };

    const handleEditPerson = (person: Person) => {
        setEditingPerson(person);
        setShowForm(true);
    };

    const handleDeletePerson = async (personId: number) => {
        try {
            await dispatch(deletePerson(personId)).unwrap();
        } catch {
            // Error is handled by the error effect above
        }
    };

    const handleFormSubmit = async (name: string) => {
        try {
            if (editingPerson) {
                // Update existing person
                await dispatch(updatePersonAsync({
                    ...editingPerson,
                    name,
                })).unwrap();
            } else {
                // Create new person
                await dispatch(createPerson({ name })).unwrap();
            }

            // Close form on success
            setShowForm(false);
            setEditingPerson(null);
        } catch {
            // Error is handled by the error effect above
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingPerson(null);
    };

    // Get existing names for validation (excluding current person when editing)
    const existingNames = persons.map(person => person.name);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Gestión de Personas</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddPerson}
                    disabled={loading}
                >
                    <Text style={styles.addButtonText}>+ Agregar</Text>
                </TouchableOpacity>
            </View>

            {showForm && (
                <PersonForm
                    person={editingPerson}
                    existingNames={existingNames}
                    loading={loading}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            )}

            <PersonList
                persons={persons}
                loading={loading}
                onEditPerson={handleEditPerson}
                onDeletePerson={handleDeletePerson}
            />
        </SafeAreaView>
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
        backgroundColor: '#007AFF',
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