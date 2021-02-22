import inherits from 'inherits';

import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';

// Require all properties you need from existing providers.
// In this case all available bpmn relevant properties without camunda extensions.
import documentationProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/DocumentationProps';
import eventProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/EventProps';
import idProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps';
import linkProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/LinkProps';
import nameProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/NameProps';
import processProps from 'bpmn-js-properties-panel/lib/provider/bpmn/parts/ProcessProps';

// Require your custom property entries.
// import sceneProps from '../../../assets/js/scence-view/parts/SceneProps';
import sceneProps from '../parts/SceneProps';

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
  processProps(generalGroup, element, translate);

  const detailsGroup = {
    id: 'details',
    label: 'Details',
    entries: [],
  };
  linkProps(detailsGroup, element, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);

  const documentationGroup = {
    id: 'documentation',
    label: 'Documentation',
    entries: [],
  };

  documentationProps(documentationGroup, element, bpmnFactory, translate);

  return [generalGroup, detailsGroup, documentationGroup];
}

// Create the custom model tab
function createModelTabGroups(element) {
  const modelPropertiesGroup = {
    id: 'model',
    label: '',
    entries: [],
  };

  sceneProps(modelPropertiesGroup, element);

  return [modelPropertiesGroup];
}

export default function ModelPropertiesProvider(eventBus, bpmnFactory, canvas, elementRegistry, translate) {
  PropertiesActivator.call(this, eventBus);

  this.getTabs = function (element) {
    // The "magic" tab
    const modelTab = {
      id: 'model',
      label: 'Properties',
      groups: createModelTabGroups(element),
    };

    return [modelTab];
  };
}

inherits(ModelPropertiesProvider, PropertiesActivator);
