import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import AddIcon from '@mui/icons-material/Add';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import SummarizeIcon from '@mui/icons-material/Summarize';
import PaidIcon from '@mui/icons-material/Paid';
import SourceIcon from '@mui/icons-material/Source';
import CodeIcon from '@mui/icons-material/Code';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon /> },
  { text: 'Analytics', icon: <AnalyticsRoundedIcon /> },
  { text: 'Add Client', icon: <AddIcon />},
  { text: 'Clients', icon: <PeopleRoundedIcon />}, 
  { text: 'Development Notes', icon: <CodeIcon />},
  { text: 'Instructions', icon: <AutoStoriesIcon/>},
  { text: 'Tasks', icon: <AssignmentRoundedIcon /> },
];

const secondaryListItems = [
  { text: 'Budget Report', icon: <SummarizeIcon /> },
  { text: 'Transactions', icon: <PaidIcon /> },
  { text: 'Archive Data', icon: <SourceIcon /> },
];

const thirdListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon /> },
  { text: 'About', icon: <InfoRoundedIcon /> },
  { text: 'Feedback', icon: <HelpRoundedIcon /> },
];

const helpListItems = [
  { text: 'Help Add Client', icon: <QuestionMarkIcon /> },
  { text: 'Help Budget', icon: <QuestionMarkIcon /> },
  { text: 'Help Transactions', icon: <QuestionMarkIcon /> },
  { text: 'Help Archive', icon: <QuestionMarkIcon /> },
];

export default function MenuContent({
    setActivePage, 
    activePage, 
    setActiveSubPage, 
    activeSubPage,
    selectedClientId }) {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      {/* Main navigation */}
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={() => setActivePage(item.text)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

            {/* Only show these if a client is selected */}
      {selectedClientId && (
        <>

      {/* Always show these 3 sections */}
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={() => setActivePage(item.text)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Budget Sub-pages */}
      {activePage === "Budget Report" && (
        <List dense>
          {["View", "Insurance", "Summary", "Help"].map((text, index) => (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <ListItemButton onClick={() => setActiveSubPage(text)}>
                <ListItemIcon><SummarizeIcon /></ListItemIcon>
                <ListItemText primary={`${text} Budget`} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      {/* Transactions Sub-pages */}
      {activePage === "Transactions" && (
        <List dense>
          {["View", "Edit", "Categorize", "Extract", "Help"].map((text, index) => (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <ListItemButton onClick={() => setActiveSubPage(text)}>
                <ListItemIcon><PaidIcon /></ListItemIcon>
                <ListItemText primary={`${text} Transactions`} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      {/* Archive Data Sub-pages */}
      {activePage === "Archive Data" && (
        <List dense>
          {["View", "Extract", "Help"].map((text, index) => (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <ListItemButton onClick={() => setActiveSubPage(text)}>
                <ListItemIcon><SourceIcon /></ListItemIcon>
                <ListItemText primary={`${text} Archive Data`} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

         <Divider />
        </>
      )}

      {/* Always visible: Settings, About, Feedback */}
      <List dense>
        {thirdListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={() => setActivePage(item.text)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
