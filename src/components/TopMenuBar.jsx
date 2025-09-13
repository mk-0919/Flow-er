import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Button, 
  Divider,
  useTheme,
  Box
} from '@mui/material';
import {
  Undo,
  Redo,
  Save,
  FolderOpen,
  Settings,
  Brightness4,
  Brightness7,
  Group
} from '@mui/icons-material';
import useStore from './store';
import { useShallow } from 'zustand/react/shallow';

const TopMenuBar = ({ toggleTheme }) => {
  const theme = useTheme();
  const { undo, redo, createGroup, selectedNodes } = useStore(
    useShallow(state => ({
      undo: state.undo,
      redo: state.redo,
      createGroup: state.createGroup,
      selectedNodes: state.selectedNodes,
    }))
  );

  // グループ化が可能かどうかの判定ロジック
  // 1. 複数のノードが選択されている
  // 2. かつ、選択されたノードのすべてが、どのグループにも属していない (parentIdがない)
  const isGroupable = selectedNodes.length > 1 && selectedNodes.every(node => !node.parentId);

  const handleGroup = () => {
    if (isGroupable) {
      createGroup(selectedNodes.map(n => n.id));
    }
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={1}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Toolbar variant="dense">
        <Box display="flex" gap={1} alignItems="center">
          <Button
            variant="contained"
            startIcon={<Undo />}
            onClick={undo}
            size="small"
            color="primary"
          >
            Undo
          </Button>
          <Button
            variant="contained"
            startIcon={<Redo />}
            onClick={redo}
            size="small"
            color="primary"
          >
            Redo
          </Button>
          <Divider orientation="vertical" flexItem />
          
          <Button
            variant="contained"
            startIcon={<Group />}
            onClick={handleGroup}
            disabled={!isGroupable}
            size="small"
            color="primary"
          >
            Group
          </Button>
          
          <Divider orientation="vertical" flexItem />
          <Button
            variant="contained"
            startIcon={<Save />}
            size="small"
            color="primary"
          >
            Save
          </Button>
          <Button
            variant="contained"
            startIcon={<FolderOpen />}
            size="small"
            color="primary"
          >
            Open
          </Button>
          <Divider orientation="vertical" flexItem />
          <Button
            variant="contained"
            startIcon={<Settings />}
            size="small"
            color="primary"
          >
            Settings
          </Button>
        </Box>
        <Box flexGrow={1} />
        <IconButton 
          onClick={toggleTheme} 
          color="primary"
          sx={{ ml: 1 }}
        >
          {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default TopMenuBar;
