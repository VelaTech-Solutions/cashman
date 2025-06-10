import * as React from 'react';
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Copyright from '../pages/internals/components/Copyright';
import ClientViewsBarChart from './ClientViewsBarChart';
import StatCard from './StatCard';

export default function MainGrid2() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        const clientData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClients(clientData);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };

    fetchClients();
  }, []);

  // === Derived Stats ===
  const reportsCompleted = clients.filter(c => c.reportCompleted === true).length;

  const awaitingReview = clients.filter(c => c.status === 'awaiting-review').length;

  const missingData = clients.filter(
    c => !c.name || !c.idNumber || !c.email // customize these fields as per your actual schema
  ).length;

  const placeholderSparkData = new Array(12).fill(0).map((_, i) => (Math.random() * 100).toFixed(0));

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>

      <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
        <Grid xs={12} sm={6} lg={3}>
          <StatCard label="Total Clients" value={clients.length} data={placeholderSparkData} />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <StatCard label="Reports Completed" value={reportsCompleted} data={placeholderSparkData} />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <StatCard label="Awaiting Review" value={awaitingReview} data={placeholderSparkData} />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <StatCard label="Missing Data" value={missingData} data={placeholderSparkData} />
        </Grid>

        <Grid xs={12} md={6}>
          <ClientViewsBarChart />
        </Grid>
      </Grid>

      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}
