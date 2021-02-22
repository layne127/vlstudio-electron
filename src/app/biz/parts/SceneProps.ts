import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';

import { is } from 'bpmn-js/lib/util/ModelUtil';

export default function (group, element) {
  console.log(element);

  if (element.id === 'xeogl.Scene') {
    // When pickedNothing
    group.entries.push(
      entryFactory.textField({
        id: 'name',
        label: '名称',
        modelProperty: 'name',
      }),
    );
    group.entries.push(
      entryFactory.comboBox({
        id: 'model',
        // label : 'Load Model',
        label: '加载模型',
        selectOptions: [
          { name: '', value: '' },
          { name: 'sportsCar', value: '../../../assets/sportsCar.obj' },
          { name: 'male02', value: '../../../assets/male02/male02.obj' },
        ],
        modelProperty: 'modelUrl',
        customName: 'Custom URL',
        customValue: 'http://',
        get(element, node) {
          return {};
        },
        set(element, values, node) {
          console.log('set modelUrl', this.selectOptions, values, node);
          const option = this.selectOptions.filter((o) => o.value == values.modelUrl);
          return {
            // to commandStack
            cmd: 'model.load',
            context: { name: option[0].name, url: option[0].value },
          };
        },
      }),
    );
    /*         group.entries.push(entryFactory.textField({
                    id: 'model_scale',
                    label: 'Scale',
                    modelProperty: 'model_scale',
                    get: function (element, node) {
                        var scale = element.model_scale;
                        var s = JSON.stringify(Array.from(scale));
                        return { model_scale: s.substring(1, s.length - 1) };
                    },
                    set: function (element, values, node) {
                        let scale = new Float32Array(JSON.parse('[' + values.model_scale + ']'));
                        element.model_scale = scale;
                    },
                })); */
  } else {
    group.entries.push(
      entryFactory.textField({
        id: 'name',
        label: 'Name',
        modelProperty: 'id',
      }),
    );

    group.entries.push(
      entryFactory.textField({
        id: 'position',
        label: 'Position',
        modelProperty: 'position',
        get(element, node) {
          console.log('get', element, node);
          const s = JSON.stringify(Array.from(element.object.position));
          return { position: s.substring(1, s.length - 1) };
        },
        set(element, values, node) {
          console.log('set', element, values, node);
          const num = getStrCount(values.position, ',');
          let position;
          if (values.position.length % num >= 1) {
            position = new Float32Array(JSON.parse('[' + values.position + ']'));
          }
          return cmdHelper.updateProperties(element, { position });
        },
        canClear(element, inputNode) {
          // var input = domQuery('input[name=condition]', inputNode);
          return true;
        },
        clear(element, inputNode) {
          // domQuery('input[name=condition]', inputNode).value='';
          return true;
        },
        validate(element, values, node) {
          console.log('validate', element, values, node);
          const validationResult = { position: null };
          try {
            JSON.parse('[' + values.position + ']');
          } catch {
            validationResult.position = 'Must be a triple of floats';
          }

          return validationResult;
        },
      }),
    );
    group.entries.push(
      entryFactory.textField({
        id: 'rotation',
        label: 'Rotation',
        modelProperty: 'rotation',
        get: function (element, node) {
          let s = JSON.stringify(Array.from(element.object.rotation));
          return { rotation: s.substring(1, s.length - 1) };
        },
        set: function (element, values, node) {
          let rotation = new Float32Array(JSON.parse('[' + values.rotation + ']'));
          return cmdHelper.updateProperties(element, { rotation });
        },
      }),
    );
    group.entries.push(
      entryFactory.textField({
        id: 'scale',
        label: 'Scale',
        modelProperty: 'scale',
        get: function (element, node) {
          let s = JSON.stringify(Array.from(element.object.scale));
          return { scale: s.substring(1, s.length - 1) };
        },
        set: function (element, values, node) {
          let scale = new Float32Array(JSON.parse('[' + values.scale + ']'));
          return cmdHelper.updateProperties(element, { scale });
        },
      }),
    );

    group.entries.push(
      entryFactory.checkbox({
        id: 'visible',
        label: 'Visible',
        modelProperty: 'visible',
      }),
    );
    group.entries.push(
      entryFactory.checkbox({
        id: 'highlighted',
        label: 'Highlighted',
        modelProperty: 'highlighted',
      }),
    );
    group.entries.push(
      entryFactory.checkbox({
        id: 'ghosted',
        label: 'Ghosted',
        modelProperty: 'ghosted',
      }),
    );
    group.entries.push(
      entryFactory.checkbox({
        id: 'aabbVisible',
        label: 'Show AABB',
        modelProperty: 'aabbVisible',
      }),
    );
    group.entries.push(
      entryFactory.checkbox({
        id: 'edges',
        label: 'Show Edges',
        modelProperty: 'edges',
      }),
    );
    group.entries.push(
      entryFactory.checkbox({
        id: 'outlined',
        label: 'Show Outline',
        modelProperty: 'outlined',
      }),
    );
    group.entries.push(
      entryFactory.textField({
        id: 'colorize',
        label: 'Colorize',
        modelProperty: 'colorize',
        get: function (element, node) {
          let s = JSON.stringify(Array.from(element.object.colorize));
          return { colorize: s.substring(1, s.length - 1) };
        },
        set: function (element, values, node) {
          let colorize = new Float32Array(JSON.parse('[' + values.colorize + ']'));
          return cmdHelper.updateProperties(element, { colorize });
        },
      }),
    );
    group.entries.push(
      entryFactory.textField({
        id: 'opacity',
        label: 'Opacity',
        modelProperty: 'opacity',
        get: function (element, node) {
          let s = JSON.stringify(Array.from([element.object.opacity]));
          return { opacity: s.substring(1, s.length - 1) };
        },
        set: function (element, values, node) {
          let opacity = new Float32Array(JSON.parse('[' + values.opacity + ']'))[0];
          return cmdHelper.updateProperties(element, { opacity });
        },
      }),
    );
    group.entries.push(
      entryFactory.checkbox({
        id: 'castShadow',
        label: 'Cast Shadow',
        modelProperty: 'castShadow',
      }),
    );
    group.entries.push(
      entryFactory.checkbox({
        id: 'receiveShadow',
        label: 'Receive Shadow',
        modelProperty: 'receiveShadow',
      }),
    );
    group.entries.push(
      entryFactory.link({
        id: 'modelLink',
        label:
          'Parent ' + element.object.parent
            ? element.object.parent.type
            : '' + ': ' + element.object.parent
            ? element.object.parent.id
            : '',
        // label : 'Parent ' + element.object.parent?.type + ': ' + element.object.parent?.id,
        // label: 'Parent',
        showLink() {
          return element.object.parent !== null;
        },
        handleClick(element) {
          element.selectParent();
        },
      }),
    );
  }

  function getStrCount(a, b) {
    let count = 0;
    while (a.indexOf(b) !== -1) {
      a = a.replace(b, '');
      count++;
    }
    return count;
  }
}
