import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { Punishment } from '../types';

interface PunishmentListProps {
    punishments: Punishment[];
    loading: boolean;
    onEditPunishment: (punishment: Punishment) => void;
    onDeletePunishment: (punishmentId: number) => void;
}

export const PunishmentList: React.FC<PunishmentListProps> = ({
    punishments,
    loading,
    onEditPunishment,
    onDeletePunishment,
}) => {
    const handleDeletePress = (punishment: Punishment) => {
        Alert.alert(
            'Eliminar Castigo',
            `¿Estás seguro de que quieres eliminar "${punishment.name}"?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => onDeletePunishment(punishment.id),
                },
            ]
        );
    };

    const renderPunishmentItem = ({ item }: { item: Punishment }) => (
        <View style={styles.punishmentItem}>
            <View style={styles.punishmentInfo}>
                <Text style={styles.punishmentName}>{item.name}</Text>
                <View style={styles.punishmentDetails}>
                    <Text style={styles.punishmentValue}>{item.value} puntos</Text>
                    <Text style={styles.punishmentDate}>
                        Creado: {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => onEditPunishment(item)}
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
                <Text style={styles.loadingText}>Cargando castigos...</Text>
            </View>
        );
    }

    if (punishments.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No hay castigos registrados</Text>
                <Text style={styles.emptySubtext}>
                    Agrega un nuevo castigo para comenzar
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={punishments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPunishmentItem}
            style={styles.list}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
    punishmentItem: {
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
        borderLeftColor: '#FF3B30',
    },
    punishmentInfo: {
        flex: 1,
    },
    punishmentName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
    },
    punishmentDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    punishmentValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
    },
    punishmentDate: {
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