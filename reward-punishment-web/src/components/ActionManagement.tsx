import React, { useState, useEffect } from 'react';
import { Action } from '../types';
import { actionApi } from '../services/api';

const ActionManagement: React.FC = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [newAction, setNewAction] = useState({ name: '', value: 0, type: 'positive' as 'positive' | 'negative' });
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadActions();
  }, [filterType]);

  const loadActions = async () => {
    try {
      setLoading(true);
      let response;
      
      if (searchTerm.trim()) {
        response = await actionApi.search(searchTerm.trim());
      } else if (filterType === 'all') {
        response = await actionApi.getAll();
      } else {
        response = await actionApi.getAll({ type: filterType });
      }
      
      setActions(response.data.data || []);
    } catch (err) {
      setError('Failed to load actions');
      console.error('Error loading actions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction.name.trim() || newAction.value === 0) return;

    try {
      // Ensure value matches type
      const actionValue = newAction.type === 'positive' ? Math.abs(newAction.value) : -Math.abs(newAction.value);
      
      const response = await actionApi.create({
        name: newAction.name.trim(),
        value: actionValue,
        type: newAction.type
      });
      
      if (response.data.success) {
        setNewAction({ name: '', value: 0, type: 'positive' });
        setSuccess('Action created successfully');
        loadActions();
      }
    } catch (err) {
      setError('Failed to create action');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction || !editingAction.name.trim() || editingAction.value === 0) return;

    try {
      // Ensure value matches type
      const actionValue = editingAction.type === 'positive' ? Math.abs(editingAction.value) : -Math.abs(editingAction.value);
      
      const response = await actionApi.update(editingAction.id, {
        name: editingAction.name.trim(),
        value: actionValue,
        type: editingAction.type
      });
      
      if (response.data.success) {
        setEditingAction(null);
        setSuccess('Action updated successfully');
        loadActions();
      }
    } catch (err) {
      setError('Failed to update action');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this action?')) return;

    try {
      await actionApi.delete(id);
      setSuccess('Action deleted successfully');
      loadActions();
    } catch (err) {
      setError('Failed to delete action');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    loadActions();
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const getActionTypeColor = (type: string) => {
    return type === 'positive' ? '#28a745' : '#dc3545';
  };

  const getActionTypeLabel = (type: string) => {
    return type === 'positive' ? 'Reward' : 'Punishment';
  };

  const filteredActions = actions.filter(action => {
    if (filterType === 'all') return true;
    return action.type === filterType;
  });

  return (
    <div className="section">
      <h2>Action Management</h2>
      <p>Manage both positive actions (rewards) and negative actions (punishments) in one place.</p>
      
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

      {/* Search and Filter */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: 1 }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search actions..."
            style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button type="submit" className="btn btn-primary">Search</button>
          {searchTerm && (
            <button 
              type="button" 
              className="btn" 
              onClick={() => { setSearchTerm(''); loadActions(); }}
            >
              Clear
            </button>
          )}
        </form>
        
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value as 'all' | 'positive' | 'negative')}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="all">All Actions</option>
          <option value="positive">Rewards Only</option>
          <option value="negative">Punishments Only</option>
        </select>
      </div>

      {/* Create Form */}
      <form onSubmit={handleCreate} style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Create New Action</h3>
        <div className="two-column">
          <div className="form-group">
            <label>Action Name:</label>
            <input
              type="text"
              value={newAction.name}
              onChange={(e) => setNewAction({ ...newAction, name: e.target.value })}
              placeholder="Enter action name"
              required
            />
          </div>
          <div className="form-group">
            <label>Action Type:</label>
            <select
              value={newAction.type}
              onChange={(e) => setNewAction({ ...newAction, type: e.target.value as 'positive' | 'negative' })}
            >
              <option value="positive">Reward (Positive)</option>
              <option value="negative">Punishment (Negative)</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Points Value:</label>
          <input
            type="number"
            value={newAction.value || ''}
            onChange={(e) => setNewAction({ ...newAction, value: parseInt(e.target.value) || 0 })}
            placeholder={newAction.type === 'positive' ? 'Enter positive value' : 'Enter positive value (will be made negative)'}
            min="1"
            required
          />
          <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
            {newAction.type === 'positive' 
              ? 'Enter a positive number for reward points' 
              : 'Enter a positive number (it will be automatically made negative for punishments)'}
          </small>
        </div>
        <button type="submit" className="btn btn-primary">Create Action</button>
      </form>

      {/* Edit Form */}
      {editingAction && (
        <form onSubmit={handleUpdate} style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
          <h3>Edit Action</h3>
          <div className="two-column">
            <div className="form-group">
              <label>Action Name:</label>
              <input
                type="text"
                value={editingAction.name}
                onChange={(e) => setEditingAction({ ...editingAction, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Action Type:</label>
              <select
                value={editingAction.type}
                onChange={(e) => setEditingAction({ ...editingAction, type: e.target.value as 'positive' | 'negative' })}
              >
                <option value="positive">Reward (Positive)</option>
                <option value="negative">Punishment (Negative)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Points Value:</label>
            <input
              type="number"
              value={Math.abs(editingAction.value)}
              onChange={(e) => setEditingAction({ ...editingAction, value: parseInt(e.target.value) || 0 })}
              min="1"
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-success">Update Action</button>
            <button type="button" className="btn" onClick={() => setEditingAction(null)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Actions List */}
      {loading ? (
        <div className="loading">Loading actions...</div>
      ) : (
        <div>
          <h3>
            Actions ({filteredActions.length})
            {filterType !== 'all' && (
              <span style={{ fontSize: '0.8em', color: '#666' }}>
                {' '}• Showing {filterType} actions only
              </span>
            )}
          </h3>
          
          {filteredActions.length === 0 ? (
            <p>No actions found. {searchTerm ? 'Try a different search term.' : 'Create your first action above!'}</p>
          ) : (
            filteredActions.map((action) => (
              <div key={action.id} className="list-item">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>{action.name}</span>
                    <span 
                      style={{ 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.8em',
                        backgroundColor: getActionTypeColor(action.type),
                        color: 'white'
                      }}
                    >
                      {getActionTypeLabel(action.type)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                    <span style={{ 
                      color: getActionTypeColor(action.type), 
                      fontWeight: 'bold' 
                    }}>
                      {action.value > 0 ? '+' : ''}{action.value} points
                    </span>
                    {action.created_at && (
                      <span style={{ marginLeft: '10px' }}>
                        Created: {new Date(action.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setEditingAction(action)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDelete(action.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ActionManagement;