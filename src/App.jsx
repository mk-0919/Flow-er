import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  useReactFlow,
  Background,
} from '@xyflow/react';
import ContextMenu from './components/ContextMenu';

import '@xyflow/react/dist/style.css';
import './Nodes.css';

import FunctionNode from './nodes/FunctionNode';
import StartNode from './nodes/StartNode';
import LoopNode from './nodes/LoopNode';
import ConditionNode from './nodes/ConditionNode';
import StopNode from './nodes/StopNode';
import LoopEndNode from './nodes/LoopEndNode';

import useStore from './components/store';
import { useShallow } from 'zustand/react/shallow';
import { ThemeProvider, createTheme, CssBaseline, Box, useTheme } from '@mui/material';
import TopMenuBar from './components/TopMenuBar';
import EnhancedSidebar from './components/EnhancedSidebar';
import NodePropertiesSidebar from './components/NodePropertiesSidebar';

import FloatingEdge from './nodes/FloatingEdge';

import { DndContext, DragOverlay, useSensor } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { DnDProvider, useDnD } from './DnDContext';
import { PointerSensor, useSensors } from '@dnd-kit/core';

import DevTools from './Devtools/Devtools';

const nodeTypes = {
  start: StartNode,
  loop: LoopNode,
  condition: ConditionNode,
  stop: StopNode,
  loopEnd: LoopEndNode,
  function: FunctionNode,
};

const edgeTypes = {
  floating: FloatingEdge,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  startNodeDrag: state.startNodeDrag,
  stopNodeDrag: state.stopNodeDrag,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  undo: state.undo,
  redo: state.redo,
  createGroup: state.createGroup,
  ungroup: state.ungroup,
  selectedNodes: state.selectedNodes,
  adjustGroupSize: state.adjustGroupSize,
});


 
let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const { nodes, edges, startNodeDrag, stopNodeDrag, setNodes, setEdges, 
    onNodesChange, onEdgesChange, onConnect, undo, redo,
    createGroup, ungroup, selectedNodes, adjustGroupSize} = useStore(
    useShallow(selector),
  );
  const { screenToFlowPosition, getZoom } = useReactFlow();
  const [type, setType] = useDnD();
  const [menu, setMenu] = useState(null);
  const { getNode, deleteElements } = useReactFlow();
  const [selectedElement, setSelectedElement] = useState(null);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [themeMode, setThemeMode] = useState('light');
  // 実行結果やログを表示するエリアの状態
  const [resultLog, setResultLog] = useState('');
  const [logMessages, setLogMessages] = useState('');
  // 実行中に環境変数(変数宣言/代入結果など)を保持するオブジェクト
  const [env, setEnv] = useState({});
  // 逐次実行用の状態
  const [stepNodeId, setStepNodeId] = useState(null);
  const [stepEnv, setStepEnv] = useState({});
  const [stepInProgress, setStepInProgress] = useState(false);
  // ループコンテキストを保持するスタック
  const loopStackRef = useRef([]);
  // 逐次実行時次のループでハイライトを消すノード
  const [highlightedNode, setHighlightedNode] = useState(null);
  

  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleNodeClick = (event, node) => {
    event.stopPropagation();
    setSelectedElement({ ...node, type: 'node', nodeType: node.type });
    setRightSidebarOpen(true);
  };

  const handleEdgeClick = (event, edge) => {
    event.stopPropagation();
    setSelectedElement({ ...edge, type: 'edge' });
    setRightSidebarOpen(true);
  };

  const handlePaneClick = () => {
    setMenu(null);
    setSelectedElement(null);
    setRightSidebarOpen(false);
  };

  const handleElementChange = (elementId, changes) => {
    if (selectedElement.type === 'node') {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === elementId) {
            return {
              ...node,
              data: { ...node.data, ...changes },
              style: { ...node.style, backgroundColor: changes.backgroundColor },
            };
          }
          return node;
        })
      );
    } else if (selectedElement.type === 'edge') {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === elementId) {
            return { ...edge, ...changes };
          }
          return edge;
        })
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      //入力中の場合はショートカットキーを無効化
      const tagName = e.target.tagName.toLowerCase();
      if (['input', 'textarea'].includes(tagName) || e.target.isContentEditable) return;

      // ショートカットキーを正規化 (ctrl, shift, alt を小文字で先頭に付加)
      const keys = [];
      if (e.ctrlKey || e.metaKey) keys.push('ctrl');
      if (e.shiftKey) keys.push('shift');
      if (e.altKey) keys.push('alt');
      keys.push(e.key.toLowerCase());
      const keyCombo = keys.join('+');

      // ショートカットキーの組み合わせに対応する処理を実行
      const shortcuts = {
        'ctrl+z': () => {
          e.preventDefault();
          undo();
        },
        'ctrl+shift+z': () => {
          e.preventDefault();
          redo();
        },
      };

      if(shortcuts[keyCombo]) {
        shortcuts[keyCombo]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };

  }, [undo, redo]);

  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      const items = [
        { key: 'copy', label: 'Copy' },
        { key: 'duplicate', label: 'Duplicate' },
        { key: 'cut', label: 'Cut' },
        { key: 'delete', label: 'Delete' },
      ];
      if (node.type === 'group') {
        items.push({ key: 'ungroup', label: 'Ungroup' });
        items.push({ key: 'adjustSize', label: 'Adjust Size' });
      }

      setMenu({
        x: event.clientX,
        y: event.clientY,
        items: items,
        nodeId: node.id,
      });
    },
    []
  );

  const onEdgeContextMenu = useCallback(
    (event, edge) => {
      event.preventDefault();
      setMenu({
        x: event.clientX,
        y: event.clientY,
        items: [
          { key: 'delete', label: 'Delete' },
        ],
        edgeId: edge.id,
      });
    },
    []
  );

  const onPaneContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      const hasClipboard = localStorage.getItem('clipboard');
      const menuItems = [];
      
      if (hasClipboard) {
        menuItems.push({ key: 'paste', label: 'Paste' });
      }

      if (menuItems.length > 0) {
        setMenu({
          x: event.clientX,
          y: event.clientY,
          items: menuItems,
          isPaneMenu: true,
          position: screenToFlowPosition({ x: event.clientX, y: event.clientY })
        });
      }
    },
    [screenToFlowPosition]
  );

  const onSelectionContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      const menuItems = [{ key: 'group', label: 'Group Selected' }];

      setMenu({
        x: event.clientX,
        y: event.clientY,
        items: menuItems,
    })},[]
  );

  const onContextMenuClick = useCallback(
    (action) => {
      if (!menu) return;

      const { nodeId, edgeId, isPaneMenu, position } = menu;

      switch (action) {
        case 'copy': {
          const node = getNode(nodeId);
          localStorage.setItem('clipboard', JSON.stringify(node));
          break;
        }
        case 'cut': {
          const node = getNode(nodeId);
          localStorage.setItem('clipboard', JSON.stringify(node));
          deleteElements({ nodes: [{ id: nodeId }] });
          break;
        }
        case 'duplicate': {
          const node = getNode(nodeId);
          const position = {
            x: node.position.x + 50,
            y: node.position.y + 50,
          };
          const newNode = {
            ...node,
            id: `${node.type}_${Date.now()}`,
            position,
          };
          setNodes((nds) => nds.concat(newNode));
          break;
        }
        case 'delete': {
          if (nodeId) {
            deleteElements({ nodes: [{ id: nodeId }] });
          }
          if (edgeId) {
            deleteElements({ edges: [{ id: edgeId }] });
          }
          break;
        }
        case 'paste': {
          const clipboardContent = JSON.parse(localStorage.getItem('clipboard'));
          if (clipboardContent) {
            const newNode = {
              ...clipboardContent,
              id: `${clipboardContent.type}_${Date.now()}`,
              position: position
            };
            setNodes((nds) => nds.concat(newNode));
          }
          break;
        }
        case 'group': {
          createGroup(selectedNodes.map(n => n.id));
          break;
        }
        case 'ungroup': {
          if (nodeId) {
            ungroup(nodeId);
          }
          break;
        }
        case 'adjustSize': {
          if (nodeId) {
            adjustGroupSize(nodeId);
            console.log('Adjusting group size...');
          }
          break;
        }
      }
      setMenu(null);
    },
    [menu, getNode, setNodes, deleteElements]
  );

  // 指定ノードのIDからノードオブジェクトを取得
  const findNodeById = useCallback(
    (id) => nodes.find((n) => n.id === id),
    [nodes]
  );

  // 指定ノードのIDからエッジオブジェクト一覧を取得(実行順序の決定に必要)
  const getOutgoingEdges = useCallback(
    (nodeId) => edges.filter((edge) => edge.source === nodeId),
    [edges]
  );

  // ログ出力用のユーティリティ関数
  const appendLog = (msg, type = 'info', isResult = false) => {
    const getColoredText = (text, color) => `<span style="color: ${color}">${text}</span>`;
    
    let coloredMsg;
    switch(type) {
      case 'error':
        coloredMsg = getColoredText(msg, '#f44336');
        break;
      case 'success':
        coloredMsg = getColoredText(msg, '#4caf50');
        break;
      case 'warning':
        coloredMsg = getColoredText(msg, '#ff9800');
        break;
      default:
        coloredMsg = msg;
    }

    if (isResult) {
      setResultLog(prev => prev + coloredMsg + '<br/>');
    } else {
      setLogMessages(prev => prev + coloredMsg + '<br/>');
    }
  };

  // エラー発生時、対象ノードをハイライトするためにStyle変更
  const highlightErrorNode = (nodeId) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            style: {
              ...node.style,
              border: '2px solid red',
            },
          };
        }
        return node;
      }))
  };

  // 逐次実行時に現在のノードをハイライトするためにStyle変更
  const highlightNode = (nodeId, color) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            style: {
              ...node.style,
              border: color ? `2px solid ${color}` : '2px solid var(--xy-node-border-color)',
            },
          };
        }
        return node;
      }))
  };

  // ハイライトするノードを変更
  const changeHighlightNode = (currentNodeId, color) => {
    console.log('changeHighlightNode called with currentNodeId:', currentNodeId, 'and color:', color);
    console.log('oldHighlightedNode:', highlightedNode);
    highlightNode(currentNodeId, color);
    if (highlightedNode) highlightNode(highlightedNode, null);
    setHighlightedNode(currentNodeId);
  };

  /*
  * executeNode は各ノードの種類に応じた処理を行う関数
  *・グループ化(childNodesがあればそのブロックを先に実行)
  *・Function: data.code の内容を new Function 経由で実行（環境オブジェクト env を引数として渡す）
  *・Condition: data.condition の評価結果に応じたエッジ選択（エッジ label を "true"/"false" として指定）
  *・Loop: data.iterations の回数だけ、子ノードブロック（data.childNodes）を実行。ループ回数が多い場合は実行前に警告。
  *・LoopEnd: マーカーとして何もしない
  *・Start/Stop: 開始／終了の印
  *※各ノード処理後、出力エッジから次ノードIDを返す（条件分岐の場合は結果に応じたエッジを選択）
  */
  const executeNode = async (node, envObj) => {
    appendLog(`実行中:ノード ${node.id} (${node.type})`);
    try {
      // ノードタイプに応じた処理
      switch (node.type) {
        case 'start':
          //  開始ノードは何もしない
          break;
        case 'stop':
          appendLog('実行終了');
          return null;// 終了ノードなので実行終了
        case 'function':
          // Functionノードの場合、data.code を実行
          if (node.data.code) {
            const func = new Function('env', `"use strict"; ${node.data.code}`);
            func(envObj);
            appendLog(`Function 実行後の環境: ${JSON.stringify(envObj)}`);
          }
          if (node.data.operationType === 'output') {
            const outputValue = new Function('env', `"use strict"; "env.output = env.count";`);
            appendLog(`${JSON.stringify(envObj)}`, 'info', true);
          }
          break;
        case 'condition':
          // Conditionノードの場合、data.condition を評価
          if (node.data.condition) {
            const codeFunc = new Function('env', `"use strict"; return ${node.data.condition}`);
            const result = codeFunc(envObj);
            appendLog(`条件式 ${node.data.condition} の評価結果: ${result}`);
            // 出力エッジの label が評価結果に合致するものを選択 ("true" または "false")
            const outgoingEdges = getOutgoingEdges(node.id);
            const selectedEdge = outgoingEdges.find((edge) => edge.label === String(result));
            if (!selectedEdge) {
              throw new Error(`条件分岐の出力エッジが見つかりません: ${node.id}`);
            }
            return selectedEdge.target;
          }
          break;
        case 'loop':
          // 条件式を評価
          if (node.data.condition) {
            const conditionFunc = new Function('env', `"use strict"; return ${node.data.condition}`);
            const shouldContinue = conditionFunc(envObj);
            
            const outEdges = getOutgoingEdges(node.id);
            if (outEdges.length === 0) {
              throw new Error('ループ開始ノードに出力エッジがありません');
            }
        
            // 現在のループコンテキストを取得または新規作成
            let currentLoop = loopStackRef.current.find(loop => loop.loopNodeId === node.id);
            
            if (shouldContinue) {
              if (!currentLoop) {
                // 新規ループの開始
                currentLoop = {
                  loopNodeId: node.id,
                  startNodeId: outEdges[0].target,
                  iterations: 1,
                  loopEndNextNodeId: null,
                };
                loopStackRef.current.push(currentLoop);
                appendLog(`ループ開始: ${currentLoop.iterations}回目`,'success');
              } else {
                // 既存のループの反復回数を増やす
                currentLoop.iterations++;
                appendLog(`ループ継続: ${currentLoop.iterations}回目`);
              }
              return outEdges[0].target;
            } else {
              // ループ終了時は該当するループコンテキストのみを削除
              loopStackRef.current = loopStackRef.current.filter(loop => loop.loopNodeId !== node.id);
              appendLog(`ループ終了: 条件 ${node.data.condition} = false`);
              if(currentLoop.loopEndNextNodeId)return currentLoop.loopEndNextNodeId;
            }
          }
          break;
        case 'loopEnd':
          // 最も内側のループを取得
          const currentLoop = loopStackRef.current[loopStackRef.current.length - 1];
          if (currentLoop) {
            if (!currentLoop.loopEndNextNodeId) {
              // ループ終了後ノードが設定されていない場合、設定
              const outEdges = getOutgoingEdges(node.id);
              currentLoop.loopEndNextNodeId = outEdges[0].target;
            }
            return currentLoop.loopNodeId;
          } else {
            // ループ終了ノードが見つからない場合、エラー
            throw new Error('ループ終了ノードに対応するループ開始ノードが見つかりません');
          }
          break;
        default:
          throw new Error(`不明なノードタイプ: ${node.type}`);
        }
      } catch (error) {
        highlightErrorNode(node.id);
        appendLog(`エラー: ${error.message}`);
      }
      // 次のノードをエッジから取得(複数ある場合、最初のものを選択)
      const outEdges = getOutgoingEdges(node.id);
      if (outEdges.length > 0) {
        return outEdges[0].target;
      }
      return null;
  };

  // バッチ実行モード
  const runBatch = async () => {
    // 状態リセット
    setResultLog('');
    setNodes((nds) => 
      nds.map((node) => {
        const newStyle = { ...node.style };
        if (newStyle.border && newStyle.border.includes('red')) {
          delete newStyle.border;
        }
        return {
          ...node,
          style: newStyle,
        };
      })
    );
    setEnv({});
    loopStackRef.current = [];
    // 開始ノードから実行開始
    const startNode = nodes.find((node) => node.type === 'start');
    if (!startNode) {
      appendLog('エラー: 開始ノードが見つかりません');
      return;
    }
    let nextNodeId = startNode.id;
    try {
      while (nextNodeId) {
        const node =  findNodeById(nextNodeId);
        if (!node) {
          appendLog(`エラー: ノード ${nextNodeId} が見つかりません`);
          break;
        }
        // stopノードに到達したら終了
        if (node.type === 'stop') {
          await executeNode(node, env);
          break;
        }
        nextNodeId = await executeNode(node, env);
      }
      appendLog(`最終環境: ${JSON.stringify(env)}`);
      // 結果出力用のエリアに、env.output が設定されていれば表示
      if (env.output) {
        appendLog(`結果: ${env.output}`);
      }
    }catch (error) {
      appendLog(`エラーにより実行中断`);
      appendLog(`エラー詳細: ${error.message}`);
    }
  };

  // 逐次実行モード
  const startStepExecution = () => {
    setResultLog('');
    setNodes((nds) =>
      nds.map((node) => {
        const newStyle = { ...node.style };
        if (newStyle.border && newStyle.border.includes('red')) {
          delete newStyle.border;
        }
        return {
          ...node,
          style: newStyle,
        };
      })
    );
    setStepEnv({});
    loopStackRef.current = [];
    const startNode = nodes.find((node) => node.type === 'start');
    if (!startNode) {
      appendLog('エラー: 開始ノードが見つかりません');
      return;
    }
    setStepNodeId(startNode.id);
    setStepInProgress(true);
    appendLog('逐次実行開始');
  };
  const runStep = async () => {
    if (!stepNodeId) {
      appendLog('エラー: 逐次実行中のノードが見つかりません');
      setStepInProgress(false);
      return;
    }
    //実行ノードをハイライト
    changeHighlightNode(stepNodeId, "blue");
    try {
      let nextNodeId = null;
      const node = findNodeById(stepNodeId);
      if (!node) {
        console.log(stepNodeId)
        appendLog(`エラー: ノード ${stepNodeId} が見つかりません`);
        setStepInProgress(false);
        return;
      }
      await executeNode(node, stepEnv).then(value => {
        nextNodeId = value;
      });
      if (nextNodeId) {
        setStepNodeId(nextNodeId);
      } else {
        setStepNodeId(null);
        setStepInProgress(false);
        highlightNode(stepNodeId, "");
        appendLog('逐次実行終了');
      }
    }catch (error) {
      appendLog(`エラーにより実行中断`);
      appendLog(`エラー詳細: ${error.message}`);
      setStepInProgress(false);
    }
  };

  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      }
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    setType(active.data.current.type);
  };

  const handleDragEnd = (event) => {
    setActiveId(null);

    // type に応じてノードを追加
    if (type) {
      const nodeSize = {
        function: { width: 150, height: 50 },
        start: { width: 150, height: 50 },
        stop: { width: 150, height: 50 },
        condition: { width: 100, height: 100 },
        loop: { width: 150, height: 50 },
        loopEnd: { width: 150, height: 50 }
      };
      // マウスの位置を取得
      const position = screenToFlowPosition({
        x: event.activatorEvent.clientX + event.delta.x,
        y: event.activatorEvent.clientY + event.delta.y,
      });

      // ノードの中心位置を計算して調整
      const nodeWidth = nodeSize[type]?.width || 150;
      const nodeHeight = nodeSize[type]?.height || 50;
      
      const centeredPosition = {
        x: position.x - nodeWidth / 2,
        y: position.y - nodeHeight / 2
      };

      const newNode = {
        id: getId(),
        type,
        position: centeredPosition,
        data: { label: `${type} node` },
      };

      setNodes((nds) => [...nds, newNode]);
    }
    
    setType(null);
  };


  const DragPreview = ({ type }) => {
    const theme = useTheme();

    return (
      <div className={`DnDpreviewNode ${type} ${theme.palette.mode}`} style={{cursor: 'none',zoom: `${getZoom()}`}} >
        <div>{type} Node</div>
      </div>
    );
  };
 
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <TopMenuBar toggleTheme={toggleTheme} />
          <Box sx={{ 
            display: 'flex', 
            flexGrow: 1, 
            mt: '48px',
            overflow: 'hidden'
          }}>
            <Box ref={reactFlowWrapper} sx={{ flexGrow: 1, position: 'relative' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeDragStart={startNodeDrag}
                onNodeDragStop={stopNodeDrag}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                onPaneClick={handlePaneClick}
                onNodeContextMenu={onNodeContextMenu}
                onEdgeContextMenu={onEdgeContextMenu}
                onPaneContextMenu={onPaneContextMenu}
                onSelectionContextMenu={onSelectionContextMenu}
                fitView
                style={{ background: theme.palette.background.default }}
                colorMode={ themeMode }
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                connectionMode='loose'
                droppable={true}
              >
                <Controls />
                <Background />
                <EnhancedSidebar />
                
                {menu && (
                  <ContextMenu
                    onClick={onContextMenuClick}
                    position={{ x: menu.x, y: menu.y }}
                    items={menu.items}
                  />
                )}
              </ReactFlow>
            </Box>
            <NodePropertiesSidebar
              selectedElement={selectedElement}
              onClose={() => setRightSidebarOpen(false)}
              onChange={handleElementChange}
              isOpen={rightSidebarOpen}
              setIsOpen={setRightSidebarOpen}
              runBatch={runBatch}
              runStep={runStep}
              stepInProgress={stepInProgress}
              startStepExecution={startStepExecution}
              resultLog={resultLog}
              logMessages={logMessages}
            />
          </Box>
        </Box>
          <DragOverlay dropAnimation={null} modifiers={[
            snapCenterToCursor,
          ]}>
            {activeId && (
              <DragPreview 
                type={type} 
              />
            )}
          </DragOverlay>
      </ThemeProvider>
    </DndContext>
  );
};

export default () => (
  <ReactFlowProvider>
    <DnDProvider>
      <DnDFlow />
    </DnDProvider>
  </ReactFlowProvider>
);
