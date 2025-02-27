import { MarkerType } from "@xyflow/react";

export const initialEdges = [
  // 各エッジでノード間の実行順序を決定
  { id: 'e1-2', 
    source: '1', 
    target: '2',
    type: 'floating',
    markerEnd: { type: MarkerType.ArrowClosed }
  },
  { id: 'e2-3', 
    source: '2', 
    target: '3',
    type: 'floating',
    markerEnd: { type: MarkerType.ArrowClosed }
  },
  { id: 'e3-4',
    source: '3',
    target: '4',
    type: 'floating',
    markerEnd: { type: MarkerType.ArrowClosed }
  },
  { id: 'e4-5',
    source: '4',
    target: '5',
    type: 'floating',
    markerEnd: { type: MarkerType.ArrowClosed }
  },
  { id: 'e5-6', 
    source: '5', 
    target: '6',
    type: 'floating',
    markerEnd: { type: MarkerType.ArrowClosed }
  },
  { id: 'e6-7', 
    source: '6', 
    target: '7',
    type: 'floating',
    markerEnd: { type: MarkerType.ArrowClosed }
  },
];
