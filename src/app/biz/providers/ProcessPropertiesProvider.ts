import inherits from 'inherits';

import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';

// Require all properties you need from existing providers.
// In this case all available bpmn relevant properties without camunda extensions.
import documentationProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps';
import eventProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/EventProps';
import idProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps';
import linkProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps';
import nameProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps';

import conditionalProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/conditionalProps';
import userTaskProps from 'bpmn-js-properties-panel/lib/provider/camunda/parts/UserTaskProps';

// Require your custom property entries.
import processProps from '../../../assets/js/process-view/parts/ProcessProps';

// The general tab contains all bpmn relevant properties.
// The properties are organized in groups.
function createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate) {
  const generalGroup = {
    id: 'general',
    label: 'General',
    entries: [],
  };
  idProps(generalGroup, element, translate);
  nameProps(generalGroup, element, bpmnFactory, canvas, translate);
  // processProps(generalGroup, element, translate);

  const detailsGroup = {
    id: 'details',
    label: 'Details',
    entries: [],
  };
  linkProps(detailsGroup, element, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);
  conditionalProps(detailsGroup, element, bpmnFactory, translate);

  //  processProps(detailsGroup, element, translate);
  console.log('detailsGroup, element', detailsGroup, element);
  processProps(detailsGroup, element);

  const documentationGroup = {
    id: 'documentation',
    label: 'Documentation',
    entries: [],
  };

  documentationProps(documentationGroup, element, bpmnFactory, translate);

  return [generalGroup, detailsGroup, documentationGroup];
}

// Create the custom magic tab
function createMagicTabGroups(element, bpmnFactory, canvas, elementRegistry, translate) {
  // Create a group called "Black Magic".
  const blackMagicGroup = {
    id: 'black-magic',
    label: element.type,
    entries: [],
  };

  console.log(element);
  nameProps(blackMagicGroup, element, bpmnFactory, canvas, translate);
  // Add the spell props to the black magic group.
  processProps(blackMagicGroup, element);
  userTaskProps(blackMagicGroup, element, translate);

  return [blackMagicGroup];
}

function MagicPropertiesProvider(eventBus, bpmnFactory, canvas, elementRegistry, translate) {
  console.log('MagicPropertiesProvider', {
    eventBus,
    bpmnFactory,
    canvas,
    elementRegistry,
    translate,
  });
  PropertiesActivator.call(this, eventBus);

  this.getTabs = function (element) {
    const generalTab = {
      id: 'general',
      label: 'General',
      groups: createGeneralTabGroups(element, bpmnFactory, canvas, elementRegistry, translate),
    };

    const magicTab = {
      id: 'magic',
      label: 'Properties',
      groups: createMagicTabGroups(element, bpmnFactory, canvas, elementRegistry, translate),
    };

    return [generalTab];
  };
}

inherits(MagicPropertiesProvider, PropertiesActivator);

export default {
  __init__: ['propertiesProvider'],
  propertiesProvider: ['type', MagicPropertiesProvider],
};
