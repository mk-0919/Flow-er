import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, MarkerType } from '@xyflow/react';
import { initialNodes } from '../nodes/nodes';
import { initialEdges } from '../nodes/edges';

let id = 0;
const get_groupId = () => `groupNode_${id++}`;

const calculateGroupBounds = (nodes) => {
  if (!nodes.length) return { x: 0, y: 0, width: 200, height: 150 };
  console.log('nodes:', nodes);
  const positions = nodes.map(node => ({
    left: node.position.x,
    right: node.position.x + (node.width || 150),
    top: node.position.y,
    bottom: node.position.y + (node.height || 50)
  }));

  const left = Math.min(...positions.map(p => p.left));
  const right = Math.max(...positions.map(p => p.right));
  const top = Math.min(...positions.map(p => p.top));
  const bottom = Math.max(...positions.map(p => p.bottom));

  // Add padding around the group
  const padding = 50;
  
  return {
    x: left - padding,
    y: top - padding,
    width: right - left + (padding * 2),
    height: bottom - top + (padding * 2)
  };
};

  const useStore = create((set, get) => ({
    // 状態の初期値
    nodes: initialNodes,
    edges: initialEdges,
    undoStack: [],
    redoStack: [],
    dragging: false,
    groups: [],//用途不明、削除予定
    autoGroupingEnabled: true,
    selectedNodes: [],

    // 履歴保存（現在の状態を snapshot として保存。最大件数は50件）
    saveHistory: () => {
      const { nodes, edges, undoStack } = get();
      const snapshot = { nodes, edges };
      const newUndoStack = [...undoStack, snapshot];
      if (newUndoStack.length > 50) {
        newUndoStack.shift(); // 先頭（最も古い状態）を削除
      }
      set({ undoStack: newUndoStack, redoStack: [] });
    },

    // ドラッグ開始時に履歴を保存
    startNodeDrag: () => {
      get().saveHistory();
    },

    // ドラッグ終了時の処理(dragging を false に設定)
    stopNodeDrag: () => {
      set({ dragging: false });
    },

    // ReactFlow の onNodesChange のラッパー
    onNodesChange: (changes) => {
      const { nodes, dragging, } = get();
      const updatedNodes = applyNodeChanges(changes, nodes);
      // selectedNodes を更新
      const selectedNodes = updatedNodes.filter(node => node.selected);
      set({ nodes: updatedNodes,
        selectedNodes: selectedNodes,
       });
    },

    // ReactFlow の onEdgesChange のラッパー
    onEdgesChange: (changes) => {
      const { edges, saveHistory } = get();
      saveHistory();
      const updatedEdges = applyEdgeChanges(changes, edges);
      set({ edges: updatedEdges });
    },

    // ReactFlow の setNodes のラッパー
    setNodes: (nodes) => {
      const { saveHistory } = get();
      saveHistory();
      // 関数を受け取った場合の処理を追加
      if (typeof nodes === 'function') {
        set((state) => ({ nodes: nodes(state.nodes) }));
      } else {
        set({ nodes });
      }
    },

    // 選択状態のノードをセット
    setSelectedNodes: (nodes) => {
      set({ selectedNodes: nodes });
    },

    // ReactFlow の setEdges のラッパー
    setEdges: (edges) => {
      const { saveHistory } = get();
      saveHistory();
      set({ edges: edges });
    },
      // ReactFlow の onConnect のラッパー
      onConnect: (connection) => {
        const { edges, saveHistory, checkAndAutoGroup } = get();
    
        // 自己参照チェック
        if (connection.source === connection.target) {
          return;
        }

        // 循環参照チェック
        const hasCycle = (source, target, visited = new Set()) => {
          if (source === target) return true;
          visited.add(source);
    
          const outgoingEdges = edges.filter(edge => edge.source === source);
          return outgoingEdges.some(edge => {
            if (visited.has(edge.target)) return false;
            return hasCycle(edge.target, target, visited);
          });
        };

        // 循環参照がない場合のみエッジを追加
        if (!hasCycle(connection.target, connection.source)) {
          saveHistory();
          const updatedEdges = addEdge({...connection, type: 'floating', markerEnd: { type: MarkerType.Arrow}}, edges);
          set({ edges: updatedEdges });
          //checkAndAutoGroup();
        }
      },

    // Undo 操作：undoStack から最後の状態に戻し、現在の状態を redoStack に保存
    undo: () => {
      const { undoStack, nodes, edges, redoStack } = get();
      if (undoStack.length === 0) return;
      const previousState = undoStack[undoStack.length - 1];
      const newUndoStack = undoStack.slice(0, undoStack.length - 1);
      const currentSnapshot = { nodes, edges };
      const newRedoStack = [...redoStack, currentSnapshot];
      set({
        nodes: previousState.nodes,
        edges: previousState.edges,
        undoStack: newUndoStack,
        redoStack: newRedoStack,
      });
    },

    // Redo 操作：redoStack から状態を取得し、現在の状態を undoStack に保存
    redo: () => {
      const { redoStack, nodes, edges, undoStack } = get();
      if (redoStack.length === 0) return;
      const nextState = redoStack[redoStack.length - 1];
      const newRedoStack = redoStack.slice(0, redoStack.length - 1);
      const currentSnapshot = { nodes, edges };
      const newUndoStack = [...undoStack, currentSnapshot];
      set({
        nodes: nextState.nodes,
        edges: nextState.edges,
        undoStack: newUndoStack,
        redoStack: newRedoStack,
      });
    },

    createGroup: (nodeIds, label = 'New Group') => {
      const { nodes, edges, saveHistory } = get();
      saveHistory();

      const groupedNodes = nodes.filter(node => nodeIds.includes(node.id));
      const groupBounds = calculateGroupBounds(groupedNodes);
    
      const groupId = get_groupId();
      const groupNode = {
        id: groupId,
        type: 'group',
        position: { x: groupBounds.x, y: groupBounds.y },
        data: {
          label,
          childNodes: nodeIds
        },
        style: {
          width: groupBounds.width,
          height: groupBounds.height,
        }
      };

      const updatedNodes = nodes.map(node => 
        nodeIds.includes(node.id) 
          ? { ...node, 
            position: {x: node.position.x - groupBounds.x, y: node.position.y - groupBounds.y},
            parentId: groupId, extent: 'parent', expandParent: true }
          : node
      );
      set({
        nodes: [groupNode, ...updatedNodes],
        groups: [...get().groups, { id: groupId, nodes: nodeIds }]
      });
      console.log(groupNode)
    },

    ungroup: (groupId) => {
      const { nodes, saveHistory } = get();
      saveHistory();
      const group = get().nodes.find(g => g.id === groupId);

      const updatedNodes = nodes.map(node => 
        node.parentId === groupId 
          ? { ...node, parentId: undefined, extent: undefined, expandParent: false,
            position: {
              x: node.position.x + group.position.x,
              y: node.position.y + group.position.y
            },
           }
          : node
      ).filter(node => node.id !== groupId);
      set({
        nodes: updatedNodes,
        groups: get().groups.filter(g => g.id !== groupId)
      });
    },

    //StartノードとStopノードを自動的にグループ化する関数(未完成)
    checkAndAutoGroup: () => {
      if (!get().autoGroupingEnabled) return;

      const { nodes, edges } = get();
      const startNodes = nodes.filter(n => n.type === 'start');
      const stopNodes = nodes.filter(n => n.type === 'stop');

      startNodes.forEach(startNode => {
        const connectedNodes = findConnectedNodes(startNode.id, edges);
        const hasStopNode = connectedNodes.some(id => 
          nodes.find(n => n.id === id && n.type === 'stop')
        );

        if (hasStopNode) {
          get().createGroup([startNode.id, ...connectedNodes], 'Flow Group');
        }
      });
    },

    toggleAutoGrouping: () => {
      set({ autoGroupingEnabled: !get().autoGroupingEnabled });
    },

    // Groupのサイズを再調整する関数
    adjustGroupSize: (groupId) => {
      const { nodes } = get();
      const group = nodes.find(n => n.id === groupId);
      if (!group) return;
      const childNodes = nodes.filter(n => group.data.childNodes.includes(n.id));
      childNodes.map(n => true ? {...n, position: { x: n.position.x + group.position.x, y: n.position.y + group.position.y }}:n);
      const bounds = calculateGroupBounds(childNodes);
      console.log('group',group);
      console.log('child',childNodes);
      console.log(bounds);
      console.log(groupId)
      console.log(group);
      set({
        nodes: nodes.map(n => n.id === groupId ? { ...n, width:bounds.width, height:bounds.height, position: { x: bounds.x, y: bounds.y }, style: { ...n.style, width: bounds.width, height: bounds.height } } : n)
      })
      console.log(get().nodes);
    },
  }));
export default useStore;
