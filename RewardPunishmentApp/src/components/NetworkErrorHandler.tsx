import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { clearError } from '../store/slices/uiSlice';

interface NetworkErrorHandlerProps {
    onRetry?: () => void;
}

export const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({
    onRetry,
}) => {
    const dispatch = useDispatch();
    const { error } = useSelector((state: RootState) => state.ui);

    useEffect(() => {
        if (error && error.includes('Network')) {
            Alert.alert(
                'Error de Conexión',
                'No se pudo conectar al servidor. Verifica tu conexión a internet e intenta de nuevo.',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel',
                        onPress: () => dispatch(clearError()),
                    },
                    {
                        text: 'Reintentar',
                        onPress: () => {
                            dispatch(clearError());
                            onRetry?.();
                        },
                    },
                ]
            );
        }
    }, [error, dispatch, onRetry]);

    if (!error || !error.includes('Network')) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>📡</Text>
                <Text style={styles.errorTitle}>Sin conexión</Text>
                <Text style={styles.errorMessage}>
                    No se pudo conectar al servidor. Verifica tu conexión a internet.
                </Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => dispatch(clearError())}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.retryButton]}
                        onPress={() => {
                            dispatch(clearError());
                            onRetry?.();
                        }}
                    >
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    errorBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        maxWidth: 300,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginBottom: 8,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 80,
    },
    cancelButton: {
        backgroundColor: '#F2F2F7',
    },
    retryButton: {
        backgroundColor: '#007AFF',
    },
    cancelButtonText: {
        color: '#8E8E93',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});