import CustomTools from './customTools';
import bpmnData from './bpmnData';
export default {
  __init__: ['paletteProvider', 'bpmnData'],
  paletteProvider: ['type', CustomTools],
  bpmnData: ['type', bpmnData],
};
