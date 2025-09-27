export const initialNodes  = [
  // グラフ全体の流れ： Start → 初期化Function → Loop（子としてインクリメントFunction） → LoopEnd → 結果出力Function → Stop
  { 
    id: '1',
    type: 'start',
    data: { label: 'Start', state: 'active' }, 
    position: { x: 50, y: 50 } 
  },
  { 
    id: '2', 
    type: 'function', 
    data: { code: 'env.count = 0;', label: 'count=0を宣言', operationType: "declare", variableName: "count", value: "0" }, 
    position: { x: 50, y: 150 } 
  },
  // ループ開始。data.condition でループの継続条件を指定します。
  { 
    id: '3', 
    type: 'loop', 
    data: { condition: 'env.count <= 3', label: 'count <= 3' }, 
    position: { x: 50, y: 250 } 
    },
  // ループ内の処理：カウントアップ（env.count に 1 加算）
  { 
    id: '4', 
    type: 'function', 
    data: { code: 'env.count += 1;', label: 'count = count + 1', operationType: "arithmetic", target: "count", operator: "+", operand1: "count", operand2: "1"}, 
    position: { x: 50, y: 350 }, 
  },
  // ループ終了（ここでは処理上のマーカーとして扱い）
  { id: '5', 
    type: 'loopEnd', 
    data: {label: 'loopEnd'}, 
    position: { x: 50, y: 450 } 
  },
  // ループ後の処理：結果の出力用データをセット（例：env.output に結果文字列を設定）
  { 
    id: '6', 
    type: 'function', 
    data: { code: 'env.output = env.count;', label: 'countを出力', operationType: "output", variableName: "count"}, 
    position: { x: 50, y: 550 } 
  },
  { 
    id: '7', 
    type: 'stop', 
    data: { label: 'Stop' }, 
    position: { x: 50, y: 650 } 
  },
];
