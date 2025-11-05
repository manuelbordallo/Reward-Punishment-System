import React, { useState, useEffect } from 'react';
import { Reward } from '../types';
import { rewardApi } from '../services/api';

const RewardManagement: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [newReward, setNewReward] = useState({ name: '', value: 0 });
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const response = await rewardApi.getAll();
      setRewards(response.data.data || []);
    } catch (err) {
      setError('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReward.name.trim() || newReward.value <= 0) return;

    try {
      const response = await rewardApi.create({
        name: newReward.name.trim(),
        value: newReward.value
      });
      if (response.data.success) {
        setNewReward({ name: '', value: 0 });
        setSuccess('Reward created successfully');
        loadRewards();
      }
    } catch (err) {
      setError('Failed to create reward');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward || !editingReward.name.trim() || editingReward.value <= 0) return;

    try {
      const response = await rewardApi.update(editingReward.id, {
        name: editingReward.name.trim(),
        value: editingReward.value
      });
      if (response.data.success) {
        setEditingReward(null);
        setSuccess('Reward updated successfully');
        loadRewards();
      }
    } catch (err) {
      setError('Failed to update reward');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;

    try {
      await rewardApi.delete(id);
      setSuccess('Reward deleted successfully');
      loadRewards();
    } catch (err) {
      setError('Failed to delete reward');
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="section">
      <h2>Reward Management</h2>

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
          <label>Reward Name:</label>
          <input
            type="text"
            value={newReward.name}
            onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
            placeholder="Enter reward name"
            required
          />
        </div>
        <div className="form-group">
          <label>Points Value (positive):</label>
          <input
            type="number"
            min="1"
            value={newReward.value || ''}
            onChange={(e) => setNewReward({ ...newReward, value: parseInt(e.target.value) || 0 })}
            placeholder="Enter points value"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Add Reward</button>
      </form>

      {editingReward && (
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Edit Reward Name:</label>
            <input
              type="text"
              value={editingReward.name}
              onChange={(e) => setEditingReward({ ...editingReward, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Edit Points Value:</label>
            <input
              type="number"
              min="1"
              value={editingReward.value}
              onChange={(e) => setEditingReward({ ...editingReward, value: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <button type="submit" className="btn btn-success">Update</button>
          <button type="button" className="btn" onClick={() => setEditingReward(null)}>Cancel</button>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading rewards...</div>
      ) : (
        <div>
          <h3>Rewards ({rewards.length})</h3>
          {Array.isArray(rewards) && rewards.map((reward) => (
            <div key={reward.id} className="list-item">
              <span>{reward.name} (+{reward.value} points)</span>
              <div>
                <button
                  className="btn btn-primary"
                  onClick={() => setEditingReward(reward)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(reward.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )) || <p>No rewards found</p>}
        </div>
      )}
    </div>
  );
};

export default RewardManagement;