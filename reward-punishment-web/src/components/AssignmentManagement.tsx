import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  TrendingUp,
  TrendingDown,
  Assignment as AssignmentIcon,
  Delete,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { Person, Reward, Punishment, Action, Assignment } from '../types';
import { personApi, rewardApi, punishmentApi, actionApi, assignmentApi } from '../services/api';

const AssignmentManagement: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  // Legacy support for existing rewards/punishments
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [punishments, setPunishments] = useState<Punishment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [selectedPersons, setSelectedPersons] = useState<number[]>([]);
  const [useActions, setUseActions] = useState<boolean>(true); // Default to new actions system
  const [itemType, setItemType] = useState<'reward' | 'punishment' | 'action'>('action');
  const [selectedItemId, setSelectedItemId] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [useActions]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);

      if (useActions) {
        // Load using new actions system
        const [personsRes, actionsRes, assignmentsRes] = await Promise.all([
          personApi.getAll(),
          actionApi.getAll(),
          assignmentApi.getAll()
        ]);

        setPersons(personsRes.data.data || []);
        setActions(actionsRes.data.data || []);
        setAssignments(assignmentsRes.data.data || []);
      } else {
        // Load using legacy system
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
      }
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
      // Convert action type to legacy format for API compatibility
      let apiItemType: 'reward' | 'punishment' = 'reward';

      if (useActions) {
        if (itemType === 'action') {
          // Find the selected action to determine its type
          const selectedAction = actions.find(action => action.id === selectedItemId);
          apiItemType = selectedAction?.type === 'positive' ? 'reward' : 'punishment';
        } else {
          apiItemType = itemType as 'reward' | 'punishment';
        }
      } else {
        apiItemType = itemType as 'reward' | 'punishment';
      }

      const response = await assignmentApi.create({
        personIds: selectedPersons,
        itemType: apiItemType,
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

  const getCurrentItems = () => {
    if (useActions) {
      if (itemType === 'action') return actions;
      return actions.filter(action =>
        itemType === 'reward' ? action.type === 'positive' : action.type === 'negative'
      );
    } else {
      return itemType === 'reward' ? rewards : punishments;
    }
  };

  const currentItems = getCurrentItems();

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssignmentIcon color="primary" />
        Assignment Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearMessages}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={clearMessages}>
          {success}
        </Alert>
      )}

      {/* System Toggle */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControlLabel
            control={
              <Switch
                checked={useActions}
                onChange={(e) => {
                  setUseActions(e.target.checked);
                  setItemType(e.target.checked ? 'action' : 'reward');
                  setSelectedItemId(0);
                }}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1">
                  Use new Actions system (recommended)
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {useActions
                    ? 'Using unified actions system - manage rewards and punishments together'
                    : 'Using legacy system - separate rewards and punishments'}
                </Typography>
              </Box>
            }
          />
        </CardContent>
      </Card>

      {/* Create Assignment Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Create New Assignment
          </Typography>

          <Box component="form" onSubmit={handleAssign} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              {/* Type Selection */}
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={itemType}
                  label="Type"
                  onChange={(e) => {
                    setItemType(e.target.value as 'reward' | 'punishment' | 'action');
                    setSelectedItemId(0);
                  }}
                >
                  {useActions ? (
                    <>
                      <MenuItem value="action">All Actions</MenuItem>
                      <MenuItem value="reward">Rewards Only</MenuItem>
                      <MenuItem value="punishment">Punishments Only</MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem value="reward">Reward</MenuItem>
                      <MenuItem value="punishment">Punishment</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>

              {/* Item Selection */}
              <FormControl sx={{ minWidth: 300, flex: 1 }}>
                <InputLabel>
                  {useActions ? (itemType === 'action' ? 'Action' : itemType) : itemType}
                </InputLabel>
                <Select
                  value={selectedItemId}
                  label={useActions ? (itemType === 'action' ? 'Action' : itemType) : itemType}
                  onChange={(e) => setSelectedItemId(Number(e.target.value))}
                  required
                >
                  <MenuItem value={0}>
                    Choose {useActions ? (itemType === 'action' ? 'an action' : `a ${itemType}`) : `a ${itemType}`}...
                  </MenuItem>
                  {currentItems.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        {useActions && 'type' in item && (
                          item.type === 'positive' ? <TrendingUp color="success" /> : <TrendingDown color="error" />
                        )}
                        <Box sx={{ flex: 1 }}>
                          {item.name}
                          <Chip
                            label={`${item.value > 0 ? '+' : ''}${item.value} points`}
                            size="small"
                            color={item.value > 0 ? 'success' : 'error'}
                            sx={{ ml: 1 }}
                          />
                          {useActions && 'type' in item && (
                            <Chip
                              label={item.type === 'positive' ? 'Reward' : 'Punishment'}
                              size="small"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Person Selection */}
            <Typography variant="subtitle1" gutterBottom>
              Select Persons:
            </Typography>
            <Card variant="outlined" sx={{ mb: 3, maxHeight: 200, overflow: 'auto' }}>
              <List dense>
                {Array.isArray(persons) && persons.length > 0 ? (
                  persons.map((person) => (
                    <ListItem key={person.id} dense>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selectedPersons.includes(person.id)}
                          onChange={() => handlePersonToggle(person.id)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={person.name}
                        secondary={`ID: ${person.id}`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No persons available" />
                  </ListItem>
                )}
              </List>
            </Card>

            <Button
              type="submit"
              variant="contained"
              startIcon={<CheckCircle />}
              disabled={selectedPersons.length === 0 || selectedItemId === 0}
              size="large"
            >
              Create Assignment
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Assignment History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon />
            Assignment History ({assignments.length})
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : Array.isArray(assignments) && assignments.length > 0 ? (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Person</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Points</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" />
                          {assignment.person_name}
                        </Box>
                      </TableCell>
                      <TableCell>{assignment.item_name}</TableCell>
                      <TableCell>
                        <Chip
                          icon={assignment.item_value && assignment.item_value > 0 ? <TrendingUp /> : <TrendingDown />}
                          label={`${assignment.item_value && assignment.item_value > 0 ? '+' : ''}${assignment.item_value} points`}
                          color={assignment.item_value && assignment.item_value > 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Warning color="disabled" sx={{ fontSize: 48, mb: 2 }} />
              <Typography color="textSecondary">
                No assignments found. Create your first assignment above.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AssignmentManagement;