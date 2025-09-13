import React from 'react';
import { Panel } from '@xyflow/react';

const GroupNode = ({ data }) => {
  const label = data.label;

  // サイドバーからの変更に対応するため、data.label を表示します。
  // Panelコンポーネントを使い、右上に配置します。
  return (
    <>
      {/* 
        このコンポーネントはグループノードのコンテナとして機能します。
        子ノードはReact Flowによってこのコンポーネント内に自動的にレンダリングされます。
        ラベルはPanelコンポーネントを使って右上に表示します。
      */}
      {label && (
        <Panel position="top-right" className="group-node-label-panel">
          <div className="group-node-label">{label}</div>
        </Panel>
      )}
    </>
  );
};

export default GroupNode;
