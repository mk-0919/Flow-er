export const nodeConfig = {
  start: {
    states: [
      { value: 'active', label: '有効' },
      { value: 'inactive', label: '無効' }
    ]
  },
  stop: {
    states: [
      { value: 'active', label: '有効' },
      { value: 'inactive', label: '無効' }
    ]
  },
  condition: {
    operators: [
      { value: '>', label: '大なり (>)' },
      { value: '<', label: '小なり (<)' },
      { value: '>=', label: '以上 (>=)' },
      { value: '<=', label: '以下 (<=)' },
      { value: '===', label: '等しい (===)' },
      { value: '!==', label: '等しくない (!==)' }
    ]
  },
  loop: {
    types: [
      { value: 'infinite', label: '無限ループ' },
      { value: 'conditional', label: '条件付きループ',
        additionalFields: ['leftOperand', 'operator', 'rightOperand'] }
    ],
    operators: [
      { value: '>', label: '大なり (>)' },
      { value: '<', label: '小なり (<)' },
      { value: '>=', label: '以上 (>=)' },
      { value: '<=', label: '以下 (<=)' },
      { value: '===', label: '等しい (===)' },
      { value: '!==', label: '等しくない (!==)' }
    ],
  },
  function: {
    operations: [
      { value: 'declare', label: '変数宣言', 
        additionalFields: ['variableName', 'value'] },
      { value: 'assign', label: '変数代入',
        additionalFields: ['variableName', 'value'] },
      { value: 'arithmetic', label: '四則演算',
        additionalFields: ['target','operand1', 'operator', 'operand2'],
        hideAdditionalFields: ['result'],},//サイドバーに表示されないFields
      { value: 'output', label: '出力',
        additionalFields: ['variableName'] }
    ],
    arithmeticOperators: [
      { value: '+', label: '加算' },
      { value: '-', label: '減算' },
      { value: '*', label: '乗算' },
      { value: '/', label: '除算' }
    ]
  }
};
