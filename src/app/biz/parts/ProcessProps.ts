import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import { is } from 'bpmn-js/lib/util/ModelUtil';

export default function (group, element) {
  if (is(element, 'bpmn:UserTask') || is(element, 'bpmn:Process') || is(element, 'bpmn:SubProcess')) {
    group.entries.push(
      entryFactory.comboBox({
        id: 'cameraTransit',
        label: 'Camera Transit',
        description: 'How to animate the camera when transiting to the next state',
        selectOptions: [
          { name: 'None', value: 'none' },
          { name: 'Immediate', value: 'immediate' },
          { name: 'Linear Interpolation', value: 'linear' },
          { name: 'Path Animation', value: 'path' },
        ],
        modelProperty: 'cameraTransit',
        customName: 'Custom Script',
        customValue: 'javascript:',
        get: function (element, node) {
          return { cameraTransit: 'none' };
        },
        set: function (element, values, node) {
          console.log('cameraTransit', values, node);
        },
      }),
    );

    group.entries.push(
      entryFactory.textBox({
        id: 'camera',
        label: '[DEV] Camera State',
        modelProperty: 'camera',
        // upon set, update sceneState property
      }),
    );

    group.entries.push(
      entryFactory.comboBox({
        id: 'stateTransit',
        label: 'State Transit',
        description: 'How to animate the scene when transiting to the next state',
        selectOptions: [
          { name: 'Immediate', value: 'immediate' },
          { name: 'Linear Interpolation', value: 'linear' },
          { name: 'Path Animation', value: 'path' },
        ],
        modelProperty: 'stateTransit',
        customName: 'Custom Script',
        customValue: 'javascript:',
        get: function (element, node) {
          return { stateTransit: 'linear' };
        },
        set: function (element, values, node) {
          console.log('stateTransit', values, node);
        },
      }),
    );

    group.entries.push(
      entryFactory.textField({
        id: 'duration',
        description: 'State transition duration to the next state',
        label: 'Duration',
        modelProperty: 'duration',
        // upon set, update animation property
      }),
    );

    group.entries.push(
      entryFactory.textBox({
        id: 'state',
        label: '[DEV]Scene State',
        modelProperty: 'state',
        // upon set, update sceneState property
      }),
    );
  }

  if (is(element, 'bpmn:UserTask')) {
    group.entries.push(
      entryFactory.textBox({
        id: 'operate',
        label: 'Operate',
        modelProperty: 'operate',
        description: 'What operations are expected from the user to transit to the next states',
      }),
    );
  }
}
