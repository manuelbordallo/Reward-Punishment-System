import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Person } from '../types';
import { personApi } from '../services/api';

const PersonManagement: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);

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

  const handleDeleteClick = (person: Person) => {
    setPersonToDelete(person);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!personToDelete) return;

    try {
      await personApi.delete(personToDelete.id);
      setSuccess('Person deleted successfully');
      loadPersons();
    } catch (err) {
      setError('Failed to delete person');
    } finally {
      setDeleteDialogOpen(false);
      setPersonToDelete(null);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon color="primary" />
        Person Management
      </Typography>

      {/* Snackbar for messages */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={clearMessages}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={clearMessages} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={clearMessages}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={clearMessages} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        {/* Add New Person Form */}
        <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add New Person
              </Typography>
              <Box component="form" onSubmit={handleCreate} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Person Name"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Enter person name"
                  required
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  disabled={!newPersonName.trim()}
                >
                  Add Person
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Edit Person Dialog */}
        <Dialog open={!!editingPerson} onClose={() => setEditingPerson(null)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Edit Person
            <IconButton
              aria-label="close"
              onClick={() => setEditingPerson(null)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleUpdate} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Person Name"
                value={editingPerson?.name || ''}
                onChange={(e) => setEditingPerson(editingPerson ? { ...editingPerson, name: e.target.value } : null)}
                required
                autoFocus
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingPerson(null)}>Cancel</Button>
            <Button onClick={handleUpdate} variant="contained" color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{personToDelete?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Persons List */}
        <Box sx={{ minWidth: 300, flex: '1 1 300px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Persons
                </Typography>
                <Chip
                  label={`${persons.length} total`}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : persons.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No persons found. Add your first person above.
                </Typography>
              ) : (
                <List>
                  {persons.map((person, index) => (
                    <React.Fragment key={person.id}>
                      <ListItem>
                        <ListItemText
                          primary={person.name}
                          secondary={`ID: ${person.id}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => setEditingPerson(person)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteClick(person)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < persons.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default PersonManagement;