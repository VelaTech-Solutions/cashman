import * as React from 'react';
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
//import SelectContent from './SelectContent';
import MenuContent from './MenuContent';
//import CardAlert from './CardAlert';
import OptionsMenu from './OptionsMenu';

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function SideMenu({ 
  setActivePage, 
  activePage, 
  setActiveSubPage,
  activeSubPage,
  selectedClientId,  }) {
  const [userEmail, setUserEmail] = useState("Not logged in"); 
  // const [selectedClientId, setSelectedClientId] = useState(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user ? user.email : "Not logged in");
    });
    return () => unsubscribe();
  }, []);


  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
        }}
      >
        {/* <SelectContent /> */}
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
     
      {/* MenuContent */}
      <MenuContent
        setActivePage={setActivePage}
        activePage={activePage}
        setActiveSubPage={setActiveSubPage}
        activeSubPage={activeSubPage}
        selectedClientId={selectedClientId !== null} // or however you determine selection
      />


        {/* <CardAlert /> */}
      </Box>

      {/* depending on what page is rendering there should be different opitions here */}
      <Divider />
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          sizes="small"
          alt="User Avatar"
          src="/static/images/avatar/7.jpg"
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: 'auto' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
            Logged in
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {userEmail}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}
