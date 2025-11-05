import React, { useState, useEffect } from 'react';
import { Punishment } from '../types';
import { punishmentApi } from '../services/api';

const PunishmentManagement: React.FC = () => {
  const [punishments, setPunishments] = useState<Punishment[]>([]);
  const [newPunishment, setNewPunishment] = useState({ name: '', value: 0 });
  const [editingPunishment, setEditingPunishment] = useState<Punishment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPunishments();
  }, []);

  const loadPunishments = async () => {
    try {
      setLoading(true);
      const response = await punishmentApi.getAll();
      setPunishments(response.data.data || []);
    } catch (err) {
      setError('Failed to load punishments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPunishment.name.trim() || newPunishment.value >= 0) return;

    try {
      const response = await punishmentApi.create({
        name: newPunishment.name.trim(),
        value: newPunishment.value
      });
      if (response.data.success) {
        setNewPunishment({ name: '', value: 0 });
        setSuccess('Punishment created successfully');
        loadPunishments();
      }
    } catch (err) {
      setError('Failed to create punishment');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPunishment || !editingPunishment.name.trim() || editingPunishment.value >= 0) return;

    try {
      const response = await punishmentApi.update(editingPunishment.id, {
        name: editingPunishment.name.trim(),
        value: editingPunishment.value
      });
      if (response.data.success) {
        setEditingPunishment(null);
        setSuccess('Punishment updated successfully');
        loadPunishments();
      }
    } catch (err) {
      setError('Failed to update punishment');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this punishment?')) return;

    try {
      await punishmentApi.delete(id);
      setSuccess('Punishment deleted successfully');
      loadPunishments();
    } catch (err) {
      setError('Failed to delete punishment');
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="section">
      <h2>Punishment Management</h2>

      {error && (
        <div className="error">
          {error}
          <button onClick={clearMessages} style={{ float: 'right' }}>×</button>
        </div>
      )}

      {success && (
        <div className="success">
          {success}
          <button onClick={clearMessages} style={{ float: 'right' }}>×</button>
        </div>
      )}

      <form onSubmit={handleCreate}>
        <div className="form-group">
          <label>Punishment Name:</label>
          <input
            type="text"
            value={newPunishment.name}
            onChange={(e) => setNewPunishment({ ...newPunishment, name: e.target.value })}
            placeholder="Enter punishment name"
            required
          />
        </div>
        <div className="form-group">
          <label>Points Value (negative):</label>
          <input
            type="number"
            max="-1"
            value={newPunishment.value || ''}
            onChange={(e) => setNewPunishment({ ...newPunishment, value: parseInt(e.target.value) || 0 })}
            placeholder="Enter negative points value"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Add Punishment</button>
      </form>

      {editingPunishment && (
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Edit Punishment Name:</label>
            <input
              type="text"
              value={editingPunishment.name}
              onChange={(e) => setEditingPunishment({ ...editingPunishment, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Edit Points Value:</label>
            <input
              type="number"
              max="-1"
              value={editingPunishment.value}
              onChange={(e) => setEditingPunishment({ ...editingPunishment, value: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <button type="submit" className="btn btn-success">Update</button>
          <button type="button" className="btn" onClick={() => setEditingPunishment(null)}>Cancel</button>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading punishments...</div>
      ) : (
        <div>
          <h3>Punishments ({punishments.length})</h3>
          {Array.isArray(punishments) && punishments.map((punishment) => (
            <div key={punishment.id} className="list-item">
              <span>{punishment.name} ({punishment.value} points)</span>
              <div>
                <button
                  className="btn btn-primary"
                  onClick={() => setEditingPunishment(punishment)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(punishment.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )) || <p>No punishments found</p>}
        </div>
      )}
    </div>
  );
};

export default PunishmentManagement;