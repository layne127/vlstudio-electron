import $ from 'jquery';

import BpmnModeler from 'bpmn-js/lib/Modeler';

import PaletteProvider from 'bpmn-js/lib/features/palette/PaletteProvider';
import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';

import ProcessPropertiesProvider from './ProcessPropertiesProvider';
import vlsModdleDescriptor from './descriptors/vls.json';

import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/bpmn';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import minimapModule from 'diagram-js-minimap';
import customTranslate from './customTranslate';

export default function (canvasId, propertiesPanelId, diagramXML) {

    const _getPaletteEntries = PaletteProvider.prototype.getPaletteEntries;
    PaletteProvider.prototype.getPaletteEntries = function (element) {
        let entries = _getPaletteEntries.apply(this, [element]);
        delete entries['create.start-event'];
        delete entries['create.intermediate-event'];
        delete entries['create.data-object'];
        delete entries['create.data-store'];
        //delete entries['create.subprocess-expanded'];
        delete entries['create.participant-expanded'];

        entries['play-tool'] = {
            group: 'tools',
            className: 'bpmn-icon-start-event-signal',
            title: /*translate*/('Play the process animation'),
            action: {
                click: function (event) {
                    reset();
                    // TODO: have to properly wait for the stop_anim to complete,
                    // since scene-view uses a single anim variable!
                    setTimeout(function () {
                        bpmnModeler.saveXML().then(result => {
                            eventBus.fire('process.play', {
                                xml: result.xml,
                            });
                        });
                    }, 1000);
                }
            }
        };
        return entries;
    }

    const _getContextPadEntries = ContextPadProvider.prototype.getContextPadEntries;
    ContextPadProvider.prototype.getContextPadEntries = function (element) {
        let entries = _getContextPadEntries.apply(this, [element]);
        delete entries['append.intermediate-event'];
        //delete entries['replace'];
        delete entries['append.text-annotation'];

        console.log('append_action', _getContextPadEntries.appendAction);
        console.log('append-task', entries['append.append-task']);
        return entries;
    }

    let canvas = $(canvasId);
    var customTranslateModule = {
        translate: [ 'value', customTranslate ]
    }  
    let options = {
        container: canvas,
        additionalModules: [
            minimapModule,
            customTranslateModule,
            propertiesPanelModule,
            ProcessPropertiesProvider,
            propertiesProviderModule
        ],
        moddleExtensions: {
            vls: vlsModdleDescriptor,
            camunda: camundaModdleDescriptor
        }
    };
    if (propertiesPanelId) {
        options.propertiesPanel = {
            parent: propertiesPanelId,
        };
    }
    var bpmnModeler = new BpmnModeler(options);
    this.bpmnModeler = bpmnModeler;
    $("a[href='http://bpmn.io']").hide();
    let container = $('#process-drop-zone');
    container.removeClass('with-diagram');

    async function openDiagram(xml) {
        if (xml) {
        try {

            await bpmnModeler.importXML(xml);

            container
                .removeClass('with-error')
                .addClass('with-diagram');
            
            let minimap = bpmnModeler.get('minimap');
            minimap._parent.style.right = 'auto';
            minimap._parent.style.top = 'auto';
            minimap._parent.style.bottom = '20px';
            minimap._parent.style.left = '20px';
        } catch (err) {

            container
                .removeClass('with-diagram')
                .addClass('with-error');

            container.find('.error pre').text(err.message);

            console.error(err);
        }
    }
    }

    const modeling = bpmnModeler.get('modeling');
    const registry = bpmnModeler.get('elementRegistry');

    function reset() {
        let selection = bpmnModeler.get("selection");
        let canvas = bpmnModeler.get("canvas");
        selection.select(canvas._rootElement);

        modeling.setColor(registry.getAll(), { stroke: 'black', fill: 'none' });
    };
    this.reset = reset;

    this.setColor = function(ids, color) {
       modeling.setColor(ids.map(id => registry.get(id)), color);
    };

    let eventBus = bpmnModeler.get("eventBus");
    this.eventBus = eventBus;

    eventBus.on("diagram.init", function (e) {
        console.log("diagram.init", e);
    });
    eventBus.on("root.added", function (e) {
        console.log("root.added", e);
    });
    eventBus.on("diagram.destroy", function (e) {
        console.log("diagram.destroy", e);
    });

    var selectedElement = null;
    var selectedState;

    // Create via drag
    eventBus.on('create.start', function (e) {
        console.log('create.start', e, selectedElement);
    });
    eventBus.on("shape.added", function (e) {
        console.log("shape.added", e, selectedElement);
        if (e.element.type === 'bpmn:Task') {
            // Task will be replaced by UserTask in the selection.changed handler
            if (selectedElement.type === 'bpmn:StartEvent'
                || selectedElement.constructor.name === 'Root')
                selectedState = undefined; // TODO: better not let scene.fetch_state do the job here
            else
                selectedState = selectedElement.businessObject.get("state");
        } else if (e.element.type === 'bpmn:UserTask') {
            if (selectedState) // To avoid trashing the states when loading diagram!
                e.element.businessObject.set("state", selectedState);
        }
    });
    eventBus.on('create.end', function (e) {
        console.log('create.end', e, selectedElement);
    });

    eventBus.on("element.changed", function (e) {
        console.log("element.changed", e);
        // TODO: update sceneState when state is modified in the panel
    });

    eventBus.on("selection.changed", function (e) {
        console.log("selection.changed", e);
        var element;
        if (e.newSelection.length == 1) {
            element = e.newSelection[0];
        }

        // Set default selection to the root element (bpmn:Process)
        if (e.newSelection.length == 0) {
            element = bpmnModeler.get("canvas")._rootElement;
        }

        selectedElement = element;

        if (element == undefined)
            return;

        eventBus.fire('animation.stop', {});

        if (element.type === 'bpmn:StartEvent') {
            element = element.parent; // Should be the root process
        }

        switch (element.type) {
            case 'bpmn:SequenceFlow':
                let sourceElement = element.source;
                if (sourceElement? sourceElement.type : '' === 'bpmn:StartEvent') {
                    sourceElement = sourceElement.parent;
                }

                while (sourceElement ? sourceElement.type : '' == 'bpmn:ParallelGateway'
                    || sourceElement ? sourceElement.type : '' == 'bpmn:InclusiveGateway'
                    || sourceElement ? sourceElement.type : '' == 'bpmn:ExclusiveGateway'
                    || sourceElement ? sourceElement.type : '' == 'bpmn:ComplexGateway') {
                    if (sourceElement.incoming.length == 1)
                        sourceElement = sourceElement.incoming[0].source;
                    else
                        sourceElement = undefined;
                }

                if (sourceElement) {
                    if (sourceElement.sceneState == undefined) {
                        var state = sourceElement.businessObject.get('state');
                        if (state)
                            sourceElement.sceneState = JSON.parse(state);
                    }
                }

                let targetElement = element.target;
                while (targetElement?targetElement.type : '' == 'bpmn:ParallelGateway'
                    || targetElement?targetElement.type : '' == 'bpmn:InclusiveGateway'
                    || targetElement?targetElement.type : '' == 'bpmn:ExclusiveGateway'
                    || targetElement?targetElement.type : '' == 'bpmn:ComplexGateway') {
                    if (targetElement.outgoing.length == 1)
                        targetElement = targetElement.outgoing[0].target;
                    else
                        targetElement = undefined;
                }

                if (targetElement) {
                    if (targetElement.sceneState == undefined) {
                        var state = targetElement.businessObject.get('state');
                        if (state)
                            targetElement.sceneState = JSON.parse(state);
                    }
                }

                // Since the state is only part of the scene, 
                // we recursively concatenate all parent scene states.
                function concatSceneState(e) {
                    if (e === undefined)
                        return undefined;

                    let s = e.parent ? concatSceneState(e.parent) : {};
                    return Object.assign(s, e.sceneState);
                };

                var source = concatSceneState(sourceElement);
                var target = concatSceneState(targetElement);
                if (source !== undefined) {
                    // Set the state to avoid unexpected placing,
                    eventBus.fire('scene.set_state', { state: source });
                }
                if (source !== undefined && target !== undefined) {
                    // source/target states are concated full states now,
                    // leave the diff to the scene-view, though not as optimized as before.
                    let duration = sourceElement.businessObject.get('duration');
                    eventBus.fire('animation.play', { source, target, duration });
                }
                break;

            case 'bpmn:Task':
                let replace = bpmnModeler.get('bpmnReplace').replaceElement;
                replace(element, { type: 'bpmn:UserTask' });
                break;

            case 'bpmn:UserTask':
            case 'bpmn:Process':
            case 'bpmn:SubProcess':
                //if (element.sceneState == undefined)
                {
                    // TODO: concatenate all parent scene states
                    var state = element.businessObject.get('state');
                    if (state)
                        element.sceneState = JSON.parse(state);
                }
                // Is element.sceneState about the full scene??
                if (element.sceneState !== undefined) {
                    let state = element.sceneState;
                    if (element.parent) {
                        state = Object.assign({}, element.parent.sceneState, element.sceneState);
                    }
                    eventBus.fire('scene.set_state', { state: state });
                } else {
                    eventBus.fire('scene.get_state', { id: element.id });
                }

                break;
            default:
                console.warn('Unimplemented element type: ', element.type);
        }
    });


    this.save = function (callback) {
        // TODO: Serlialize scene states before saving
        bpmnModeler.saveXML().then(result => {
            callback(result.xml);
        });
    };

    this.load = function (xml) {
        // TODO: deserialize scene states after loading
        openDiagram(xml);
    };

    this.updateScene = function (id, state) {
        let element = selectedElement;
        if (element) {
            if (element.type === 'bpmn:StartEvent')
                element = element.parent;

            // Update the root element when new models are loaded
            if (id === '@vls_root_element') {
                let canvas = bpmnModeler.get('canvas');
                element = canvas._rootElement;
            }

            if (element.type === 'bpmn:Process') {
                if (id) { // full state
                    element.sceneState = state;
                } else {
                    Object.assign(element.sceneState, state);
                }
                element.businessObject.set('state', JSON.stringify(element.sceneState));
            }

            if (element.type === 'bpmn:UserTask' || element.type === 'bpmn:SubProcess') {
                if (id) { // full state
                    // find diff with parent scene
                    let parentState = element.parent.sceneState; // TODO: parentScene undefined?
                    element.sceneState = {};
                    Object.keys(state).forEach(id => {
                        if (JSON.stringify(parentState[id]) !== JSON.stringify(state[id])) {
                            element.sceneState[id] = state[id];
                        }
                    });
                } else {
                    Object.assign(element.sceneState, state); // TODO: check against parent?
                }
            }

            if (element.sceneState) {
                let cmd = bpmnModeler.get('commandStack');
                cmd.execute('element.updateProperties', {
                    element,
                    properties: { state: JSON.stringify(element.sceneState) }
                });
            }
        }
    };

    openDiagram(diagramXML);
}