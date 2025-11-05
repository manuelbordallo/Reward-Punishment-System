import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { apiService } from '../services/api';

interface ConnectionTestProps {
    onConnectionStatusChange?: (isConnected: boolean) => void;
}

export const ConnectionTest: React.FC<ConnectionTestProps> = ({ onConnectionStatusChange }) => {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastTestTime, setLastTestTime] = useState<Date | null>(null);

    const testConnection = async () => {
        setIsLoading(true);
        try {
            const result = await apiService.testConnection();
            const connected = result.success;
            setIsConnected(connected);
            setLastTestTime(new Date());
            
            if (onConnectionStatusChange) {
                onConnectionStatusChange(connected);
            }

            if (connected) {
                Alert.alert(
                    'Conexión Exitosa',
                    `Servidor conectado correctamente\nEstado: ${result.data?.status}\nEntorno: ${result.data?.environment}`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Error de Conexión',
                    result.error?.message || 'No se pudo conectar al servidor',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            setIsConnected(false);
            if (onConnectionStatusChange) {
                onConnectionStatusChange(false);
            }
            Alert.alert(
                'Error',
                'Error inesperado al probar la conexión',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Test connection on component mount
        testConnection();
    }, []);

    const getStatusColor = () => {
        if (isConnected === null) return '#FFA500'; // Orange for unknown
        return isConnected ? '#4CAF50' : '#F44336'; // Green for connected, red for disconnected
    };

    const getStatusText = () => {
        if (isLoading) return 'Probando conexión...';
        if (isConnected === null) return 'Estado desconocido';
        return isConnected ? 'Conectado' : 'Desconectado';
    };

    return (
        <View style={styles.container}>
            <View style={styles.statusContainer}>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
                <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
            
            {lastTestTime && (
                <Text style={styles.lastTestText}>
                    Última prueba: {lastTestTime.toLocaleTimeString()}
                </Text>
            )}
            
            <TouchableOpacity
                style={[styles.testButton, isLoading && styles.testButtonDisabled]}
                onPress={testConnection}
                disabled={isLoading}
            >
                <Text style={styles.testButtonText}>
                    {isLoading ? 'Probando...' : 'Probar Conexión'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        margin: 16,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
    },
    lastTestText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
    },
    testButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    testButtonDisabled: {
        backgroundColor: '#ccc',
    },
    testButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});