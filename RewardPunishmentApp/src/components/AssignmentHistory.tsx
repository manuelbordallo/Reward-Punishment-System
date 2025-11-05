import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { Assignment } from '../types';

interface AssignmentHistoryProps {
    assignments: Assignment[];
    loading: boolean;
    onDeleteAssignment: (assignmentId: number) => void;
}

export const AssignmentHistory: React.FC<AssignmentHistoryProps> = ({
    assignments,
    loading,
    onDeleteAssignment,
}) => {
    const handleDeletePress = (assignment: Assignment) => {
        const itemTypeText = assignment.itemType === 'reward' ? 'premio' : 'castigo';
        const valueText = assignment.itemValue > 0 ? `+${assignment.itemValue}` : assignment.itemValue.toString();

        Alert.alert(
            'Eliminar Asignación',
            `¿Estás seguro de que quieres eliminar la asignación de ${itemTypeText} "${assignment.itemName}" (${valueText} puntos)?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => onDeleteAssignment(assignment.id),
                },
            ]
        );
    };

    const formatDate = (date: Date) => {
        const assignmentDate = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - assignmentDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return `Hoy, ${assignmentDate.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            })}`;
        } else if (diffDays === 2) {
            return `Ayer, ${assignmentDate.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            })}`;
        } else {
            return assignmentDate.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        }
    };

    const renderAssignmentItem = ({ item }: { item: Assignment }) => {
        const isReward = item.itemType === 'reward';
        const valueText = item.itemValue > 0 ? `+${item.itemValue}` : item.itemValue.toString();

        return (
            <View style={[
                styles.assignmentItem,
                { borderLeftColor: isReward ? '#34C759' : '#FF3B30' }
            ]}>
                <View style={styles.assignmentInfo}>
                    <View style={styles.assignmentHeader}>
                        <Text style={styles.itemName}>{item.itemName}</Text>
                        <Text style={[
                            styles.itemValue,
                            { color: isReward ? '#34C759' : '#FF3B30' }
                        ]}>
                            {valueText} puntos
                        </Text>
                    </View>
                    <Text style={styles.personInfo}>
                        Asignado a: {item.personName || `Persona ID ${item.personId}`}
                    </Text>
                    <Text style={styles.assignmentDate}>
                        {formatDate(item.assignedAt)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeletePress(item)}
                >
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
        );
    }

    if (assignments.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No hay asignaciones registradas</Text>
                <Text style={styles.emptySubtext}>
                    Las asignaciones aparecerán aquí una vez que comiences a asignar premios y castigos
                </Text>
            </View>
        );
    }

    // Sort assignments by date (most recent first)
    const sortedAssignments = [...assignments].sort((a, b) =>
        new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
    );

    return (
        <FlatList
            data={sortedAssignments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderAssignmentItem}
            style={styles.list}
            showsVerticalScrollIndicator={false}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
    assignmentItem: {
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
    },
    assignmentInfo: {
        flex: 1,
    },
    assignmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        flex: 1,
    },
    itemValue: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    personInfo: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
    },
    assignmentDate: {
        fontSize: 14,
        color: '#666666',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        minWidth: 60,
        alignItems: 'center',
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
        lineHeight: 20,
    },
});