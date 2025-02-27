import {
  useState,
} from 'react';
import { Panel } from '@xyflow/react';
 
import NodeInspector from './NodeInspector';
//import ChangeLogger from './ChangeLogger';
import ViewportLogger from './ViewportLogger';
 
export default function DevTools() {
  const [nodeInspectorActive, setNodeInspectorActive] = useState(true);
  const [changeLoggerActive, setChangeLoggerActive] = useState(true);
  const [viewportLoggerActive, setViewportLoggerActive] = useState(true);
 
  return (
    <div className="react-flow__devtools">
      <Panel position="top-left">
        <DevToolButton
          setActive={setNodeInspectorActive}
          active={nodeInspectorActive}
          title="Toggle Node Inspector"
        >
          Node Inspector
        </DevToolButton>
        <DevToolButton
          setActive={setChangeLoggerActive}
          active={changeLoggerActive}
          title="Toggle Change Logger"
        >
          Change Logger
        </DevToolButton>
        <DevToolButton
          setActive={setViewportLoggerActive}
          active={viewportLoggerActive}
          title="Toggle Viewport Logger"
        >
          Viewport Logger
        </DevToolButton>
      </Panel>
      {nodeInspectorActive && <NodeInspector />}
      {viewportLoggerActive && <ViewportLogger />}
    </div>
  );
}
 
function DevToolButton({
  active,
  setActive,
  children,
  ...rest
}) {
  return (
    <button
      onClick={() => setActive((a) => !a)}
      className={active ? 'active' : ''}
      {...rest}
    >
      {children}
    </button>
  );
}
