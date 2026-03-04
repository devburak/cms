import React, { useEffect, useState } from 'react';
import { Container, Divider, Grid } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import {
  createWorkGroup,
  deleteWorkGroup,
  getAllPeriods,
  getChambers,
  getWorkGroups,
  updateWorkGroup,
} from '../api';
import { notifyError, notifySuccess } from '../services/notificationBus';
import WorkGroupForm from '../components/workGroup/WorkGroupForm';
import WorkGroupList from '../components/workGroup/WorkGroupList';

export default function WorkGroupsPage() {
  const { hasPermission } = useAuth();
  const [workGroups, setWorkGroups] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [chambers, setChambers] = useState([]);
  const [selectedWorkGroup, setSelectedWorkGroup] = useState(null);

  const fetchWorkGroups = async () => {
    try {
      const data = await getWorkGroups();
      setWorkGroups(data || []);
    } catch (error) {
      console.error('Error fetching work groups:', error);
    }
  };

  const fetchPeriods = async () => {
    try {
      const data = await getAllPeriods();
      setPeriods(data?.periods || []);
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const fetchChambers = async () => {
    try {
      const data = await getChambers({ page: 1, limit: 300 });
      setChambers(data?.data || []);
    } catch (error) {
      console.error('Error fetching chambers:', error);
    }
  };

  useEffect(() => {
    fetchWorkGroups();
    fetchPeriods();
    fetchChambers();
  }, []);

  const handleSave = async (payload) => {
    try {
      if (selectedWorkGroup?._id) {
        await updateWorkGroup(selectedWorkGroup._id, payload);
        notifySuccess('Çalışma grubu güncellendi');
      } else {
        await createWorkGroup(payload);
        notifySuccess('Çalışma grubu oluşturuldu');
      }

      setSelectedWorkGroup(null);
      fetchWorkGroups();
    } catch (error) {
      notifyError(error?.response?.data?.error || 'Çalışma grubu kaydedilemedi');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteWorkGroup(id);
      notifySuccess('Çalışma grubu silindi');
      fetchWorkGroups();
    } catch (error) {
      notifyError(error?.response?.data?.error || 'Çalışma grubu silinemedi');
    }
  };

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <h1>Çalışma Grupları</h1>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <WorkGroupForm
            periods={periods}
            chambers={chambers}
            selectedWorkGroup={selectedWorkGroup}
            onSave={handleSave}
          />
        </Grid>
        <Grid item xs={12}>
          <WorkGroupList
            workGroups={workGroups}
            onEdit={setSelectedWorkGroup}
            onDelete={handleDelete}
            canDelete={hasPermission('deleteWorkGroup')}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
