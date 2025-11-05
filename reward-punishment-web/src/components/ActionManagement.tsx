import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Fab
} from '@mui/material';
import {
  Add,
  Delete,
  Star,
  Warning,
  Edit
} from '@mui/icons-material';
import { actionApi } from '../services/api';
import { Action } from '../types';

const ActionManagement: React.FC = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    value: 0,
    type: 'positive' as 'positive' | 'negative'
  });

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await actionApi.getAll();
      setActions(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch actions');
      console.error('Error fetching actions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (action?: Action) => {
    if (action) {
      setEditingAction(action);
      setFormData({
        name: action.name,
        value: action.value,
        type: action.type
      });
    } else {
      setEditingAction(null);
      setFormData({ name: '', value: 0, type: 'positive' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAction(null);
    setFormData({ name: '', value: 0, type: 'positive' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingAction) {
        await actionApi.update(editingAction.id, formData);
      } else {
        await actionApi.create(formData);
      }
      handleCloseDialog();
      fetchActions();
    } catch (err) {
      setError(`Failed to ${editingAction ? 'update' : 'create'} action`);
      console.error(`Error ${editingAction ? 'updating' : 'creating'} action:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this action?')) {
      return;
    }
    try {
      setLoading(true);
      await actionApi.delete(id);
      fetchActions();
    } catch (err) {
      setError('Failed to delete action');
      console.error('Error deleting action:', err);
    } finally {
      setLoading(false);
    }
  };

  const rewards = actions.filter(action => action.type === 'positive');
  const punishments = actions.filter(action => action.type === 'negative');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Action Management
        </Typography>
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => handleOpenDialog()}
        >
          <Add />
        </Fab>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Rewards Section */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Star color="success" />
          Rewards ({rewards.length})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {rewards.map((action) => (
            <Box key={action.id} sx={{ minWidth: 300, flex: '1 1 300px' }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {action.name}
                  </Typography>
                  <Chip
                    label={`+${action.value} points`}
                    color="success"
                    size="small"
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Created: {action.created_at ? new Date(action.created_at).toLocaleDateString() : 'Unknown'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(action)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(action.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Box>
          ))}
          {rewards.length === 0 && !loading && (
            <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                No rewards found. Create your first reward!
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Punishments Section */}
      <Box>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          Punishments ({punishments.length})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {punishments.map((action) => (
            <Box key={action.id} sx={{ minWidth: 300, flex: '1 1 300px' }}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {action.name}
                  </Typography>
                  <Chip
                    label={`${action.value} points`}
                    color="error"
                    size="small"
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Created: {action.created_at ? new Date(action.created_at).toLocaleDateString() : 'Unknown'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(action)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(action.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Box>
          ))}
          {punishments.length === 0 && !loading && (
            <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                No punishments found. Create your first punishment!
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingAction ? 'Edit Action' : 'Create New Action'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Action Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Point Value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                required
                sx={{ mb: 2 }}
                helperText="Positive values for rewards, negative for punishments"
              />
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'positive' | 'negative' })}
                >
                  <MenuItem value="positive">Reward (Positive)</MenuItem>
                  <MenuItem value="negative">Punishment (Negative)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving...' : (editingAction ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ActionManagement;