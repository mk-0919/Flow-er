import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Typography,
  IconButton,
  Box,
  useTheme,
  Fade,
  Paper,
} from '@mui/material';
import {
  ChevronLeft,
  ExpandLess,
  ExpandMore,
  PlayArrow,
  Stop,
  Functions,
  Loop,
  CallSplit,
  ChevronRight
} from '@mui/icons-material';
import { useDnD } from '../DnDContext';
import '../Nodes.css';
import Draggable, { draggable } from 'react-draggable';
import { use } from 'react';

import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  useDraggable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const DRAWER_WIDTH = 240;
const EXPANDED_HEIGHT = '80vh';
const COLLAPSED_HEIGHT = '40px';

const nodeCategories = [
  {
    name: 'Basic',
    nodes: [
      { 
        type: 'start', 
        label: 'Start Node', 
        icon: <PlayArrow />,
        preview: 'start'
      },
      { 
        type: 'stop', 
        label: 'Stop Node', 
        icon: <Stop />,
        preview: 'stop'
      },
      { 
        type: 'function', 
        label: 'Function Node', 
        icon: <Functions />,
        preview: 'function'
      }
    ]
  },
  {
    name: 'Control Flow',
    nodes: [
      { 
        type: 'condition', 
        label: 'Condition Node', 
        icon: <CallSplit />,
        preview: 'condition'
      },
      { 
        type: 'loop', 
        label: 'Loop Node', 
        icon: <Loop />,
        preview: 'loop'
      },
      { 
        type: 'loopEnd', 
        label: 'Loop End Node', 
        icon: <Loop />,
        preview: 'loopEnd'
      }
    ]
  }
];

const NodePreview = ({ type }) => {
  const theme = useTheme();
  
  return (
    <div 
      className={`DnDpreviewNode ${type} sidebar ${theme.palette.mode}`} 
      style={{ 
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <div className="DnDpreviewNode text">{type}</div>
    </div>
  );
};
/*
const DraggableNode = ({ node, onDragStart }) => {
  const theme = useTheme();
  return (
    <ListItem
      key={node.type}
      sx={{ 
        pl: 4,
        '&:hover': {
          bgcolor: theme.palette.action.hover
        }
      }}
      draggable
      onDragStart={(e) => onDragStart(e, node.type)}
    >
      <ListItemIcon>{node.icon}</ListItemIcon>
      <ListItemText primary={node.label} />
      <NodePreview type={node.preview} />
    </ListItem>
  );
};
*/

const DraggableNode = ({ node }) => {
  const theme = useTheme();
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: node.type,
    data: {
      type: node.type,
      preview: node.preview
    }
  });

  return (
    <ListItem
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{ 
        pl: 4,
        '&:hover': {
          bgcolor: theme.palette.action.hover
        },
        cursor: 'grab'
      }}
    >
      <ListItemIcon>{node.icon}</ListItemIcon>
      <ListItemText primary={node.label} />
      <NodePreview type={node.preview} />
    </ListItem>
  );
};


const DragPreview = ({ type }) => {
  const theme = useTheme();
  
  const previewStyles = {
    width: '150px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: '4px',
    pointerEvents: 'none',
    fontSize: '14px',
    boxShadow: theme.shadows[3]
  };

  console.log('DragPreview type:', type);

  return (
    <div style={previewStyles}>
      {type} Node
    </div>
  );
};

const EnhancedSidebar = () => {
  const theme = useTheme();
  const [_, setType] = useDnD();
  const [isOpen, setIsOpen] = useState(true);
  const [openCategories, setOpenCategories] = useState(
    nodeCategories.map(() => true)
  );
  const [position, setPosition] = useState({ x: 10, y: 5 });
  //const [dragPreview, setDragPreview] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const handleCategoryClick = (index) => {
    const newOpenCategories = [...openCategories];
    newOpenCategories[index] = !newOpenCategories[index];
    setOpenCategories(newOpenCategories);
  };

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    console.log('Drag started:', activeId);
    setType(active.data.current.type);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    console.log('Drag ended:', activeId);
    setType(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setType(null);
  };

  return (
    <Draggable
      bounds="parent"
      handle=".drag-handle"
      position={position}
      onDrag={(e, data) => setPosition({ x: data.x, y: data.y })}
    >
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          //left: 20,
          //top: 80, // TopMenuBarの下に配置
          //width: isOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          width: DRAWER_WIDTH,
          //height: '80vh',
          height: isOpen ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
          //backgroundColor: 'rgba(255, 255, 255, 0.5)', // 半透明化
          backgroundColor: theme.palette.mode == 'dark'
            ?'rgba(50, 50, 50, 0.85)' 
            :'rgba(255, 255, 255, 0.85)',
          //backdropFilter: 'blur(8px)', // 背景のブラー効果
          zIndex: 1000,
          //transition: 'width 0.3s ease-in-out',
          transision: 'height 0.3s ease-in-out',
          //overflowY: 'auto',
          //overflowX: 'hidden',
          overflow: 'hidden',
          //display: 'flex',
          //flexDirection: 'column',
          //border: '1px solid rgba(0, 0, 0, 0.1)',
        }}
      >
      
      <Box 
        className="drag-handle"
        sx={{ 
          //display: 'flex', 
          //justifyContent: isOpen ? 'flex-end' : 'center', 
          //p: 1,
          //borderBottom: `1px solid ${theme.palette.divider}`
          cursor: 'move',
          height: '40px',
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <IconButton onClick={() => setIsOpen(!isOpen)} color="primary">
          {isOpen ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      {isOpen && (
        <>
          <Typography 
            variant="h6" 
            sx={{ 
              p: 2, 
              color: theme.palette.text.primary 
            }}
          >
            Node Types
          </Typography>
          <List>
            {nodeCategories.map((category, categoryIndex) => (
              <React.Fragment key={category.name}>
                <ListItem 
                  button 
                  onClick={() => handleCategoryClick(categoryIndex)}
                  sx={{
                    borderBottom: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <ListItemText primary={category.name} />
                  {openCategories[categoryIndex] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openCategories[categoryIndex]} timeout="auto">
                  <List component="div" disablePadding>
                    {category.nodes.map((node) => (
                      <DraggableNode
                      node={node}
                      onDragStart={onDragStart}
                      />
                      /*<ListItem
                        key={node.type}
                        sx={{ 
                          pl: 4,
                          '&:hover': {
                            bgcolor: theme.palette.action.hover
                          }
                        }}
                        draggable
                        onDragStart={(e) => onDragStart(e, node.type)}
                      >
                        <ListItemIcon>{node.icon}</ListItemIcon>
                        <ListItemText primary={node.label} />
                        <NodePreview type={node.preview} />
                      </ListItem>*/
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        </>
      )}
    </Paper>
    </Draggable>
  );
};

export default EnhancedSidebar;
