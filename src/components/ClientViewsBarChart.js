import * as React from 'react';
import { useEffect, useState } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { db } from "../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

export default function ClientStatsCard() {
  const theme = useTheme();
  const colorPalette = [
    (theme.vars || theme).palette.primary.dark,
    (theme.vars || theme).palette.primary.main,
    (theme.vars || theme).palette.primary.light,
  ];

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

  return (
    <Card variant="outlined"
      spacing={2}
      columns={12}
      sx={{ width: '100%' }}
    >
      <CardContent>

        <Typography component="h2" variant="subtitle2" gutterBottom >
          Total Clients Overview
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h4" component="p">
            {clients.length}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Registered Clients
          </Typography>
        </Stack>

        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={[{ data: ['Clients'] }]}
          yAxis={[{ width: 50 }]}
          series={[
            {
              id: 'clients',
              label: 'Clients',
              data: [clients.length],
            },
          ]}
          height={250}
          margin={{ left: 0, right: 0, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          hideLegend
        />
      </CardContent>

      {/* <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          Total Transactions
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h4" component="p">
            {allTransactions.length}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Total Transactions
          </Typography>
        </Stack>

        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={[{ data: ['allTransactions'] }]}
          yAxis={[{ width: 50 }]}
          series={[
            {
              id: 'allTransactions',
              label: 'allTransactions',
              data: [allTransactions.length],
            },
          ]}
          height={250}
          margin={{ left: 0, right: 0, top: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          hideLegend
        />
      </CardContent> */}
    </Card>
  );
}
