import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Punishment } from '../types';

interface PunishmentFormProps {
    punishment?: Punishment | null;
    loading: boolean;
    onSubmit: (name: string, value: number) => void;
    onCancel: () => void;
}

export const PunishmentForm: React.FC<PunishmentFormProps> = ({
    punishment,
    loading,
    onSubmit,
    onCancel,
}) => {
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [nameError, setNameError] = useState('');
    const [valueError, setValueError] = useState('');

    useEffect(() => {
        if (punishment) {
            setName(punishment.name);
            // Convert negative value to positive for display (user enters positive, we make it negative)
            setValue(Math.abs(punishment.value).toString());
        } else {
            setName('');
            setValue('');
        }
        setNameError('');
        setValueError('');
    }, [punishment]);

    const validateName = (inputName: string): boolean => {
        const trimmedName = inputName.trim();

        if (!trimmedName) {
            setNameError('El nombre no puede estar vacío');
            return false;
        }

        setNameError('');
        return true;
    };

    const validateValue = (inputValue: string): boolean => {
        const trimmedValue = inputValue.trim();

        if (!trimmedValue) {
            setValueError('El valor no puede estar vacío');
            return false;
        }

        const numericValue = parseInt(trimmedValue, 10);

        if (isNaN(numericValue)) {
            setValueError('El valor debe ser un número válido');
            return false;
        }

        if (numericValue <= 0) {
            setValueError('El valor debe ser positivo (se convertirá a negativo automáticamente)');
            return false;
        }

        setValueError('');
        return true;
    };

    const handleSubmit = () => {
        const isNameValid = validateName(name);
        const isValueValid = validateValue(value);

        if (isNameValid && isValueValid) {
            // Convert positive input to negative value for punishment
            const negativeValue = -Math.abs(parseInt(value.trim(), 10));
            onSubmit(name.trim(), negativeValue);
        }
    };

    const handleNameChange = (text: string) => {
        setName(text);
        if (nameError) {
            setNameError('');
        }
    };

    const handleValueChange = (text: string) => {
        // Only allow numeric input
        const numericText = text.replace(/[^0-9]/g, '');
        setValue(numericText);
        if (valueError) {
            setValueError('');
        }
    };

    const isFormValid = name.trim().length > 0 && value.trim().length > 0 && !nameError && !valueError;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {punishment ? 'Editar Castigo' : 'Nuevo Castigo'}
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
                    placeholder="Ingresa el nombre del castigo"
                    placeholderTextColor="#999999"
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!loading}
                />
                {nameError ? (
                    <Text style={styles.errorText}>{nameError}</Text>
                ) : null}
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Valor (puntos a descontar)</Text>
                <TextInput
                    style={[
                        styles.input,
                        valueError ? styles.inputError : null,
                    ]}
                    value={value}
                    onChangeText={handleValueChange}
                    onBlur={() => validateValue(value)}
                    placeholder="Ingresa el valor del castigo"
                    placeholderTextColor="#999999"
                    keyboardType="numeric"
                    editable={!loading}
                />
                <Text style={styles.helperText}>
                    Ingresa un valor positivo (se convertirá a negativo automáticamente)
                </Text>
                {valueError ? (
                    <Text style={styles.errorText}>{valueError}</Text>
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
                        {loading ? 'Guardando...' : (punishment ? 'Actualizar' : 'Crear')}
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
    helperText: {
        color: '#666666',
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
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
        backgroundColor: '#FF3B30',
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