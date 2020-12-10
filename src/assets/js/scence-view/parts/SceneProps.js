import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';


export default function(group, element) {

  console.log(element);

  if (element.id === 'xeogl.Scene') {
    // When pickedNothing
    group.entries.push(entryFactory.textField({
      id : 'name',
      label : 'Name',
      modelProperty : 'name',
    }));
    group.entries.push(entryFactory.comboBox({
      id : 'model',
      label : 'Load Model',
      selectOptions : [ 
        {name: '', value: ''},
        {name: 'sportsCar', value: 'models/obj/sportsCar/sportsCar.obj'}, 
        {name: 'male02', value: 'models/obj/male02/male02.obj'}
      ],
      modelProperty : 'modelUrl',
      customName : 'Custom URL',
      customValue : 'http://',
      get: function(element, node) {
        return {};
      },
      set: function(element, values, node) {
        console.log('set modelUrl', this.selectOptions, values, node);
        let option = this.selectOptions.filter(o => o.value == values.modelUrl);
        return { // to commandStack
          cmd: 'model.load',
          context: { name: option[0].name, url: option[0].value, },
        };
      }
    }));
  } else {
    group.entries.push(entryFactory.textField({
      id : 'name',
      label : 'Name',
      modelProperty : 'id',
    }));

    group.entries.push(entryFactory.textField({
      id : 'position',
      label : 'Position',
      modelProperty : 'position',
      get: function(element, node) {
        console.log('get', element, node);
        let s = JSON.stringify(Array.from(element.object.position));
        return {position: s.substring(1, s.length - 1)};
      },
      set: function(element, values, node) {
        console.log('set', element, values, node);
        let position = new Float32Array(JSON.parse('[' + values.position + ']'));
        return cmdHelper.updateProperties(element, { position });
      },
      canClear: function(element, inputNode) {
        //var input = domQuery('input[name=condition]', inputNode);
        return true;
      },
      clear: function(element, inputNode) {
        //domQuery('input[name=condition]', inputNode).value='';
        return true;
      },
      validate: function(element, values, node) {
        console.log('validate', element, values, node);
        var validationResult = {};
        try {
          JSON.parse('[' + values.position + ']');
        } catch {
          validationResult.position = 'Must be a triple of floats';
        }

        return validationResult
      }
    }));
    group.entries.push(entryFactory.textField({
      id : 'rotation',
      label : 'Rotation',
      modelProperty : 'rotation',
    }));
    group.entries.push(entryFactory.textField({
      id : 'scale',
      label : 'Scale',
      modelProperty : 'scale',
    }));

    group.entries.push(entryFactory.checkbox({
      id : 'visible',
      label : 'Visible',
      modelProperty : 'visible',
    }));
    group.entries.push(entryFactory.checkbox({
      id : 'highlighted',
      label : 'Highlighted',
      modelProperty : 'highlighted',
    }));
    group.entries.push(entryFactory.checkbox({
      id : 'ghosted',
      label : 'Ghosted',
      modelProperty : 'ghosted',
    }));
    group.entries.push(entryFactory.checkbox({
      id : 'aabbVisible',
      label : 'Show AABB',
      modelProperty : 'aabbVisible',
    }));
    group.entries.push(entryFactory.checkbox({
      id : 'edges',
      label : 'Show Edges',
      modelProperty : 'edges',
    }));
    group.entries.push(entryFactory.checkbox({
      id : 'outlined',
      label : 'Show Outline',
      modelProperty : 'outlined',
    }));
    group.entries.push(entryFactory.textField({
      id : 'colorize',
      label : 'Colorize',
      modelProperty : 'colorize',
    }));
    group.entries.push(entryFactory.textField({
      id : 'opacity',
      label : 'Opacity',
      modelProperty : 'opacity',
    }));
    group.entries.push(entryFactory.checkbox({
      id : 'castShadow',
      label : 'Cast Shadow',
      modelProperty : 'castShadow',
    }));
    group.entries.push(entryFactory.checkbox({
      id : 'receiveShadow',
      label : 'Receive Shadow',
      modelProperty : 'receiveShadow',
    }));
    group.entries.push(entryFactory.link({
      id : 'modelLink',
      label : 'Parent ' + element.object.parent ? element.object.parent.type : '' + ': ' + element.object.parent ? element.object.parent.id : '',
      // label : 'Parent ' + element.object.parent?.type + ': ' + element.object.parent?.id,
      // label: 'Parent',
      showLink: function() {
        return element.object.parent !== null;
      },
      handleClick: function(element) {
        element.selectParent();
      }
    }));
  }


}