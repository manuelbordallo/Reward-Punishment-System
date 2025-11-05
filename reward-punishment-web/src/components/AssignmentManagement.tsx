import React, { useState, useEffect } from 'react';
import { Person, Reward, Punishment, Assignment } from '../types';
import { personApi, rewardApi, punishmentApi, assignmentApi } from '../services/api';

const AssignmentManagement: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [punishments, setPunishments] = useState<Punishment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [selectedPersons, setSelectedPersons] = useState<number[]>([]);
  const [itemType, setItemType] = useState<'reward' | 'punishment'>('reward');
  const [selectedItemId, setSelectedItemId] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [personsRes, rewardsRes, punishmentsRes, assignmentsRes] = await Promise.all([
        personApi.getAll(),
        rewardApi.getAll(),
        punishmentApi.getAll(),
        assignmentApi.getAll()
      ]);

      setPersons(personsRes.data.data || []);
      setRewards(rewardsRes.data.data || []);
      setPunishments(punishmentsRes.data.data || []);
      setAssignments(assignmentsRes.data.data || []);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonToggle = (personId: number) => {
    setSelectedPersons(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPersons.length === 0 || selectedItemId === 0) return;

    try {
      const response = await assignmentApi.create({
        personIds: selectedPersons,
        itemType,
        itemId: selectedItemId
      });

      if (response.data.success) {
        setSelectedPersons([]);
        setSelectedItemId(0);
        setSuccess('Assignment created successfully');
        loadData();
      }
    } catch (err) {
      setError('Failed to create assignment');
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      await assignmentApi.delete(id);
      setSuccess('Assignment deleted successfully');
      loadData();
    } catch (err) {
      setError('Failed to delete assignment');
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const currentItems = itemType === 'reward' ? rewards : punishments;

  return (
    <div className="section">
      <h2>Assignment Management</h2>

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

      <div className="assignment-form">
        <h3>Create New Assignment</h3>
        <form onSubmit={handleAssign}>
          <div className="form-group">
            <label>Select Type:</label>
            <select
              value={itemType}
              onChange={(e) => {
                setItemType(e.target.value as 'reward' | 'punishment');
                setSelectedItemId(0);
              }}
            >
              <option value="reward">Reward</option>
              <option value="punishment">Punishment</option>
            </select>
          </div>

          <div className="form-group">
            <label>Select {itemType}:</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(parseInt(e.target.value))}
              required
            >
              <option value={0}>Choose a {itemType}...</option>
              {currentItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.value > 0 ? '+' : ''}{item.value} points)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Persons:</label>
            <div className="person-selection">
              {(Array.isArray(persons) && persons.map((person) => (
                <label key={person.id} className="person-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedPersons.includes(person.id)}
                    onChange={() => handlePersonToggle(person.id)}
                  />
                  {person.name}
                </label>
              ))) || <p>No persons available</p>}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={selectedPersons.length === 0 || selectedItemId === 0}
          >
            Create Assignment
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Loading assignments...</div>
      ) : (
        <div>
          <h3>Assignment History ({assignments.length})</h3>
          {(Array.isArray(assignments) && assignments.map((assignment) => (
            <div key={assignment.id} className="list-item">
              <div>
                <strong>{assignment.person_name}</strong> - {assignment.item_name}
                <span style={{ color: (assignment.item_value && assignment.item_value > 0) ? 'green' : 'red' }}>
                  ({(assignment.item_value && assignment.item_value > 0) ? '+' : ''}{assignment.item_value} points)
                </span>
                <br />
                <small>{new Date(assignment.assigned_at).toLocaleString()}</small>
              </div>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteAssignment(assignment.id)}
              >
                Delete
              </button>
            </div>
          ))) || <p>No assignments found</p>}
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;