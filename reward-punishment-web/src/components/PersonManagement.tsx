import React, { useState, useEffect } from 'react';
import { Person } from '../types';
import { personApi } from '../services/api';

const PersonManagement: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = async () => {
    try {
      setLoading(true);
      const response = await personApi.getAll();
      // Handle API response structure {success: boolean, data: Person[]}
      const personsData = response.data.data || [];
      setPersons(personsData);
    } catch (err) {
      setError('Failed to load persons');
      console.error('Error loading persons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    try {
      const response = await personApi.create({ name: newPersonName.trim() });
      if (response.data.success) {
        setNewPersonName('');
        setSuccess('Person created successfully');
        loadPersons();
      }
    } catch (err) {
      setError('Failed to create person');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerson || !editingPerson.name.trim()) return;

    try {
      const response = await personApi.update(editingPerson.id, { name: editingPerson.name.trim() });
      if (response.data.success) {
        setEditingPerson(null);
        setSuccess('Person updated successfully');
        loadPersons();
      }
    } catch (err) {
      setError('Failed to update person');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this person?')) return;

    try {
      await personApi.delete(id);
      setSuccess('Person deleted successfully');
      loadPersons();
    } catch (err) {
      setError('Failed to delete person');
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="section">
      <h2>Person Management</h2>
      
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
          <label>Add New Person:</label>
          <input
            type="text"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="Enter person name"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Add Person</button>
      </form>

      {editingPerson && (
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Edit Person:</label>
            <input
              type="text"
              value={editingPerson.name}
              onChange={(e) => setEditingPerson({ ...editingPerson, name: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-success">Update</button>
          <button type="button" className="btn" onClick={() => setEditingPerson(null)}>Cancel</button>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading persons...</div>
      ) : (
        <div>
          <h3>Persons ({persons.length})</h3>
          {Array.isArray(persons) && persons.map((person) => (
            <div key={person.id} className="list-item">
              <span>{person.name}</span>
              <div>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setEditingPerson(person)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDelete(person.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )) || <p>No persons found</p>}
        </div>
      )}
    </div>
  );
};

export default PersonManagement;