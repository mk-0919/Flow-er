import React from 'react';
import {
  Drawer,
  Typography,
  TextField,
  Box,
  IconButton,
  Tabs,
  Tab,
  ButtonGroup,
  Button,
  Paper,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Close,
  ChevronRight, 
  PlayArrow,
  PlayCircleOutline,
  SkipNext,} from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import ConsoleOutput from './ConsoleOutput';
import '../Nodes.css';
import { nodeConfig } from '../config/nodeConfig';

const DRAWER_WIDTH = 300;

const NodePropertiesSidebar = ({ 
  selectedElement, 
  onClose, 
  onChange,
  isOpen,
  setIsOpen,
  runBatch,
  stepInProgress,
  startStepExecution,
  runStep,
  resultLog,
  nodes,
  executionStartGroupId,
  setExecutionStartGroupId,
  logMessages,
}) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const theme = useTheme();
  const logBoxRef = React.useRef(null);

  React.useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [resultLog, logMessages]);

  const groupNodes = React.useMemo(() => 
    nodes.filter(node => node.type === 'group'), [nodes]
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

/*<TextField
                  fullWidth
                  label="Label"
                  value={selectedElement.data?.label || ''}
                  onChange={(e) => onChange(selectedElement.id, { label: e.target.value })}
                  margin="normal"
                />
 */

  if (!selectedElement) return null;

  const renderProperties = () => {
    switch (selectedElement.type) {
      case 'node':
        if (activeTab === 0) { // Data tab (formerly index 1)
          return (
            <>
              {renderNodeTypeSpecificControls()}
              <Box mt={2}>
                <Typography variant="subtitle1">Background Color</Typography>
                <ChromePicker
                  color={selectedElement.style?.backgroundColor || '#fff'}
                  onChange={(color) => onChange(selectedElement.id, { backgroundColor: color.hex })}
                />
              </Box>
            </>
          );
        } else if (activeTab === 1) { // Console tab (formerly index 2)
          return (
              <Box sx={{ 
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}>
                <Typography variant="h6">実行操作</Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel>開始グループ</InputLabel>
                  <Select
                    value={executionStartGroupId}
                    label="開始グループ"
                    onChange={(e) => setExecutionStartGroupId(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>先頭から実行</em>
                    </MenuItem>
                    {groupNodes.map(group => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.data?.label || group.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <ButtonGroup 
                  variant="contained" 
                  fullWidth 
                  orientation="vertical"
                  sx={{ gap: 1 }}
                >
                  <Button 
                    onClick={runBatch}
                    disabled={stepInProgress}
                    startIcon={<PlayArrow />}
                  >
                    Run All
                  </Button>
                  <Button
                    onClick={startStepExecution}
                    disabled={stepInProgress}
                    startIcon={<PlayCircleOutline />}
                  >
                    Start Step Execution
                  </Button>
                  <Button
                    onClick={runStep}
                    disabled={!stepInProgress}
                    startIcon={<SkipNext />}
                  >
                    Run Step
                  </Button>
                </ButtonGroup>

                <Typography variant="h6">出力結果</Typography>
                <Box
                  ref={logBoxRef}
                  sx={{
                    height: '200px',
                    overflowY: 'auto',
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    '& span': {
                      display: 'block',
                      wordBreak: 'break-all'
                    }
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: resultLog 
                  }}
                />

                <Typography variant="h6">ログ出力</Typography>
                <Box
                  ref={logBoxRef}
                  sx={{
                    height: '200px',
                    overflowY: 'auto',
                    bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    '& span': {
                      display: 'block',
                      wordBreak: 'break-all'
                    }
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: logMessages 
                  }}
                />
            </Box>
          );
        }
        return null; // Should not happen with current tab setup
      case 'edge':
        return (
          <TextField
            fullWidth
            label="Label"
            value={selectedElement.label || ''}
            onChange={(e) => onChange(selectedElement.id, { label: e.target.value })}
            margin="normal"
          />
        );
      default:
        return null;
    }
  };

  const renderNodeTypeSpecificControls = () => {
    const nodeType = selectedElement.nodeType;
    const nodeData = selectedElement.data || {};

    switch (nodeType) {
      case 'start':
      case 'stop':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>状態</InputLabel>
            <Select
              defaultValue={nodeData.state || 'active'}
              onChange={(e) => {
                const newState = e.target.value;
                onChange(selectedElement.id, {
                  state: newState,
                  style: {
                    ...selectedElement.style,
                    opacity: newState === 'inactive' ? 0.5 : 1
                  }
                });
              }}
            >
              {nodeConfig[nodeType].states.map(state => (
                <MenuItem key={state.value} value={state.value}>
                  {state.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'condition':
        return (
          <Box>
            <FormControl fullWidth margin="normal">
              <InputLabel>演算子</InputLabel>
              <Select
                DefaultValue={nodeData.operator || '>'}
                onChange={(e) => onChange(selectedElement.id, { operator: e.target.value })}
              >
                {nodeConfig.condition.operators.map(op => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="左辺"
              DefaultValue={nodeData.leftOperand || ''}
              onChange={(e) => onChange(selectedElement.id, { leftOperand: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="右辺"
              DefaultValue={nodeData.rightOperand || ''}
              onChange={(e) => onChange(selectedElement.id, { rightOperand: e.target.value })}
              margin="normal"
            />
          </Box>
        );

      case 'loop':
        return (
          <Box>
            <FormControl fullWidth margin="normal">
              <InputLabel>ループタイプ</InputLabel>
              <Select
                value={nodeData.loopType || 'infinite'}
                onChange={(e) => handleLoopTypeChange(e.target.value)}
              >
                {nodeConfig.loop.types.map(op => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {renderLoopAdditionalFields()}
          </Box>
        );

      case 'function':
        return (
          <Box>
            <FormControl fullWidth margin="normal">
              <InputLabel>操作タイプ</InputLabel>
              <Select
                defaultValue={nodeData.operationType || ''}
                onChange={(e) => handleFunctionTypeChange(e.target.value)}
              >
                {nodeConfig.function.operations.map(op => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {renderFunctionAdditionalFields()}
          </Box>
        );

      case 'group':
        return (
          <TextField
            fullWidth
            label="Group Name"
            value={nodeData.label || ''}
            onChange={(e) => onChange(selectedElement.id, { label: e.target.value })}
            margin="normal"
          />
        );
      // ... 他のケース
    }
  };

  const handleLoopTypeChange = (loopType) => {
    const loopConfig = nodeConfig.loop.types.find(t => t.value === loopType);
    const newData = { loopType };
    const nodeData = selectedElement.data || {};

    if (loopType === 'conditional') {
      if (loopConfig.additionalFields) {
        loopConfig.additionalFields.forEach(field => {
          newData[field] = nodeData[field] || '';
        });
      }
    }
    
    onChange(selectedElement.id, newData);
  };

  const handleFunctionTypeChange = (operationType) => {
    const operation = nodeConfig.function.operations.find(op => op.value === operationType);
    const newData = { operationType };
    const nodeData = selectedElement.data || {};
    
    // 操作タイプに応じた初期値設定
    if (operation.additionalFields) {
      operation.additionalFields.forEach(field => {
        newData[field] = nodeData[field] || '';//変更前に同名のデータが有れば引き継ぐ
      });
    }

    if (operation.hideAdditionalFields) {
      operation.hideAdditionalFields.forEach(field => {
        newData[field] = nodeData[field] || '';
      });
    }
    
    onChange(selectedElement.id, newData);
  };

  const handleLoopConditionalChange = (fieldName, value) => {
    const nodeData = { ...selectedElement.data, [fieldName]: value };
 
    onChange(selectedElement.id, { 
      [fieldName]: value,
    });
  };

  const renderLoopAdditionalFields = () => {
    const nodeData = selectedElement.data || {};
    if (nodeData.loopType !== 'conditional') {
      return null;
    }

    const loopTypeConfig = nodeConfig.loop.types.find(t => t.value === 'conditional');
    if (!loopTypeConfig || !loopTypeConfig.additionalFields) {
      return null;
    }

    return loopTypeConfig.additionalFields.map(field => {
      if (field === 'operator') {
        return (
          <FormControl key={field} fullWidth margin="normal">
            <InputLabel>演算子</InputLabel>
            <Select
              value={nodeData[field] || ''}
              onChange={(e) => handleLoopConditionalChange(field, e.target.value)}
            >
              {nodeConfig.loop.operators.map(op => (
                <MenuItem key={op.value} value={op.value}>
                  {op.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      }

      return (
        <TextField
          key={field}
          fullWidth
          label={field}
          value={nodeData[field] || ''}
          onChange={(e) => handleLoopConditionalChange(field, e.target.value)}
          margin="normal"
        />
      );
    });
  };

  const renderFunctionAdditionalFields = () => {
    const nodeData = selectedElement.data || {};
    const operation = nodeConfig.function.operations.find(
      op => op.value === nodeData.operationType
    );

    if (!operation) return null;

    return operation.additionalFields.map(field => {
      if (field === 'operator' && nodeData.operationType === 'arithmetic') {
        return (
          <FormControl key={field} fullWidth margin="normal">
            <InputLabel>演算子</InputLabel>
            <Select
              value={nodeData[field] || ''}
              onChange={(e) => onChange(selectedElement.id, { [field]: e.target.value })}
            >
              {nodeConfig.function.arithmeticOperators.map(op => (
                <MenuItem key={op.value} value={op.value}>
                  {op.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      }

      return (
        <TextField
          key={field}
          fullWidth
          label={field}
          value={nodeData[field] || ''}
          onChange={(e) => onChange(selectedElement.id, { [field]: e.target.value })}
          margin="normal"
        />
      );
    });
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      variant="persistent"
      sx={{
        width: isOpen ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          transition: 'width 0.3s ease-in-out',
          mt: '48px', // TopMenuBarの高さ分
          bgcolor: theme.palette.background.default,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Properties</Typography>
          <IconButton onClick={() => setIsOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Node properties tabs">
          {/* <Tab label="Style" /> Removed as per request */}
          <Tab label="Data" />
          <Tab label="Console" />
        </Tabs>
        <Box mt={2}>
          {renderProperties()}
        </Box>
      </Box>
    </Drawer>
  );
};

export default NodePropertiesSidebar;
