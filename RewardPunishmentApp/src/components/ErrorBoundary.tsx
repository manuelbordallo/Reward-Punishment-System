import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorTitle}>Algo salió mal</Text>
                        <Text style={styles.errorMessage}>
                            Ha ocurrido un error inesperado en la aplicación.
                        </Text>
                        {this.state.error && (
                            <Text style={styles.errorDetails}>
                                {this.state.error.message}
                            </Text>
                        )}
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={this.handleRetry}
                        >
                            <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
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
        marginBottom: 16,
        lineHeight: 22,
    },
    errorDetails: {
        fontSize: 12,
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'monospace',
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});