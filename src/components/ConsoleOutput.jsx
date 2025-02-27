import React from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  IconButton,
  Collapse,
  Divider
} from '@mui/material';
import { 
  ExpandMore,
  ExpandLess,
  Output,
  Terminal
} from '@mui/icons-material';

const ConsoleOutput = ({ resultLog, logMessages }) => {
  const [showResult, setShowResult] = React.useState(true);
  const [showLog, setShowLog] = React.useState(true);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Results Section */}
      <Box sx={{ mb: 1 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            p: 1
          }}
        >
          <Output sx={{ mr: 1 }} />
          <Typography variant="subtitle2">実行結果</Typography>
          <IconButton 
            size="small" 
            onClick={() => setShowResult(!showResult)}
            sx={{ ml: 'auto', color: 'inherit' }}
          >
            {showResult ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        <Collapse in={showResult}>
          <Paper 
            sx={{ 
              p: 1,
              minHeight: '150px',
              maxHeight: '200px',
              overflow: 'auto',
              bgcolor: 'background.default',
              fontFamily: 'monospace'
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: resultLog }} />
          </Paper>
        </Collapse>
      </Box>

      {/* Logs Section */}
      <Box>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            p: 1
          }}
        >
          <Terminal sx={{ mr: 1 }} />
          <Typography variant="subtitle2">実行ログ</Typography>
          <IconButton 
            size="small" 
            onClick={() => setShowLog(!showLog)}
            sx={{ ml: 'auto', color: 'inherit' }}
          >
            {showLog ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        <Collapse in={showLog}>
          <Paper 
            sx={{ 
              p: 1,
              minHeight: '150px',
              maxHeight: '200px',
              overflow: 'auto',
              bgcolor: 'background.default',
              fontFamily: 'monospace'
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: logMessages }} />
          </Paper>
        </Collapse>
      </Box>
    </Box>
  );
};

export default ConsoleOutput;
