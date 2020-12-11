import { Injectable } from '@angular/core';
import $ from 'jquery';

import { Engine } from 'bpmn-engine';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import { EventEmitter } from 'events';

import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
import PaletteProvider from 'bpmn-js/lib/features/palette/PaletteProvider';

const vlsModdleDescriptor = require('../../../assets/js/process-view/descriptors/vls.json');
// import ProcessPropertiesProvider from '../../../assets/js/process-view/ProcessPropertiesProvider';
import ProcessPropertiesProvider from '../providers/ProcessPropertiesProvider';

import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/bpmn';
const camundaModdleDescriptor = require('camunda-bpmn-moddle/resources/camunda.json');
import minimapModule from 'diagram-js-minimap';
import { Observable, Subject } from 'rxjs';
import paletteProvider from '../bpmn-tools';
import customTranslate from '../config/customTranslate';
@Injectable({
  providedIn: 'root',
})
export class ProcessViewService {
  private subject = new Subject<any>();
  private vlssubject = new Subject<any>();
  bpmnModeler: any;
  reset: () => void;
  setColor: (ids: any, color: any) => void;
  eventBus: any;
  save: (callback: any) => void;
  load: (xml: any) => void;
  updateScene: (id: any, state: any) => void;
  process: (id: any, result: any) => void;
  execute: (succ: any, fail: any) => void;
  constructor() {}

  processView(canvasId, propertiesPanelId, diagramXML) {
    const _getPaletteEntries = PaletteProvider.prototype.getPaletteEntries;
    PaletteProvider.prototype.getPaletteEntries = function (element) {
      const entries = _getPaletteEntries.apply(this, [element]);
      delete entries['create.start-event'];
      delete entries['create.intermediate-event'];
      delete entries['create.data-object'];
      delete entries['create.data-store'];
      // delete entries['create.subprocess-expanded'];
      delete entries['create.participant-expanded'];
      entries['play-tool'] = {
        group: 'tools',
        className: 'bpmn-icon-start-event-signal',
        title: /*translate*/ 'Play the process animation',
        action: {
          click(event) {
            reset();
            // TODO: have to properly wait for the stop_anim to complete,
            // since scene-view uses a single anim variable!
            setTimeout(function () {
              bpmnModeler.saveXML().then((result) => {
                eventBus.fire('process.play', {
                  xml: result.xml,
                });
              });
            }, 1000);
          },
        },
      };
      return entries;
    };

    const _getContextPadEntries = ContextPadProvider.prototype.getContextPadEntries;
    ContextPadProvider.prototype.getContextPadEntries = function (element) {
      const entries = _getContextPadEntries.apply(this, [element]);
      delete entries['append.intermediate-event'];
      // delete entries['replace'];
      delete entries['append.text-annotation'];

      console.log('append_action', _getContextPadEntries.appendAction);
      console.log('append-task', entries['append.append-task']);
      return entries;
    };

    const canvas = $(canvasId);
    const customTranslateModule = {
      translate: ['value', customTranslate],
    };
    const options = {
      container: canvas,
      additionalModules: [
        minimapModule,
        customTranslateModule,
        propertiesPanelModule,
        ProcessPropertiesProvider,
        //  paletteProvider
      ],
      moddleExtensions: {
        vls: vlsModdleDescriptor,
        camunda: camundaModdleDescriptor,
      },
      propertiesPanel: null,
    };
    if (propertiesPanelId) {
      options.propertiesPanel = {
        parent: propertiesPanelId,
      };
    }
    const bpmnModeler = new BpmnModeler(options);
    this.bpmnModeler = bpmnModeler;
    $("a[href='http://bpmn.io']").hide();
    const container = $('#process-drop-zone');
    container.removeClass('with-diagram');

    async function openDiagram(xml) {
      if (xml) {
        try {
          await bpmnModeler.importXML(xml);

          container.removeClass('with-error').addClass('with-diagram');

          const minimap = bpmnModeler.get('minimap');
          minimap._parent.style.right = 'auto';
          minimap._parent.style.top = 'auto';
          minimap._parent.style.bottom = '20px';
          minimap._parent.style.left = '20px';
        } catch (err) {
          container.removeClass('with-diagram').addClass('with-error');

          container.find('.error pre').text(err.message);

          console.error(err);
        }
      }
    }

    const modeling = bpmnModeler.get('modeling');
    const registry = bpmnModeler.get('elementRegistry');

    function reset() {
      const selection = bpmnModeler.get('selection');
      const canvas = bpmnModeler.get('canvas');
      canvas.zoom(0.1);
      selection.select(canvas._rootElement);

      modeling.setColor(registry.getAll(), { stroke: 'black', fill: 'none' });
    }
    this.reset = reset;

    this.setColor = function (ids, color) {
      modeling.setColor(
        ids.map((id) => registry.get(id)),
        color,
      );
    };

    const eventBus = bpmnModeler.get('eventBus');
    this.eventBus = eventBus;

    eventBus.on('diagram.init', function (e) {
      console.log('diagram.init', e);
    });
    eventBus.on('root.added', function (e) {
      console.log('root.added', e);
    });
    eventBus.on('diagram.destroy', function (e) {
      console.log('diagram.destroy', e);
    });

    let selectedElement = null;
    let selectedState;

    // Create via drag
    eventBus.on('create.start', function (e) {
      console.log('create.start', e, selectedElement);
    });
    eventBus.on('shape.added', function (e) {
      //  console.log('shape.added', e, selectedElement);
      if (e.element.type === 'bpmn:Task') {
        // Task will be replaced by UserTask in the selection.changed handler
        if (selectedElement.type === 'bpmn:StartEvent' || selectedElement.constructor.name === 'Root') {
          selectedState = undefined;
        } // TODO: better not let scene.fetch_state do the job here
        else {
          selectedState = selectedElement.businessObject.get('state');
        }
      } else if (e.element.type === 'bpmn:UserTask') {
        if (selectedState) {
          // To avoid trashing the states when loading diagram!
          e.element.businessObject.set('state', selectedState);
        }
      }
    });
    eventBus.on('create.end', function (e) {
      console.log('create.end', e, selectedElement);
    });

    eventBus.on('element.changed', function (e) {
      console.log('element.changed', e);
      // TODO: update sceneState when state is modified in the panel
    });

    eventBus.on('selection.changed', function (e) {
      console.log('selection.changed', e);
      let element;
      if (e.newSelection.length == 1) {
        element = e.newSelection[0];
      }

      // Set default selection to the root element (bpmn:Process)
      if (e.newSelection.length == 0) {
        element = bpmnModeler.get('canvas')._rootElement;
      }

      selectedElement = element;

      if (element == undefined) {
        return;
      }

      eventBus.fire('animation.stop', {});

      if (element.type === 'bpmn:StartEvent') {
        element = element.parent; // Should be the root process
      }

      switch (element.type) {
        case 'bpmn:SequenceFlow':
          let sourceElement = element.source;
          if ((sourceElement ? sourceElement.type : '') === 'bpmn:StartEvent') {
            sourceElement = sourceElement.parent;
          }

          while (
            (sourceElement ? sourceElement.type : '') == 'bpmn:ParallelGateway' ||
            (sourceElement ? sourceElement.type : '') == 'bpmn:InclusiveGateway' ||
            (sourceElement ? sourceElement.type : '') == 'bpmn:ExclusiveGateway' ||
            (sourceElement ? sourceElement.type : '') == 'bpmn:ComplexGateway'
          ) {
            if (sourceElement.incoming.length == 1) {
              sourceElement = sourceElement.incoming[0].source;
            } else {
              sourceElement = undefined;
            }
          }

          if (sourceElement) {
            if (sourceElement.sceneState == undefined) {
              const state = sourceElement.businessObject.get('state');
              if (state) {
                sourceElement.sceneState = JSON.parse(state);
              }
            }
          }

          let targetElement = element.target;
          while (
            (targetElement ? targetElement.type : '') == 'bpmn:ParallelGateway' ||
            (targetElement ? targetElement.type : '') == 'bpmn:InclusiveGateway' ||
            (targetElement ? targetElement.type : '') == 'bpmn:ExclusiveGateway' ||
            (targetElement ? targetElement.type : '') == 'bpmn:ComplexGateway'
          ) {
            if (targetElement.outgoing.length == 1) {
              targetElement = targetElement.outgoing[0].target;
            } else {
              targetElement = undefined;
            }
          }

          if (targetElement) {
            if (targetElement.sceneState == undefined) {
              const state = targetElement.businessObject.get('state');
              if (state) {
                targetElement.sceneState = JSON.parse(state);
              }
            }
          }

          // Since the state is only part of the scene,
          // we recursively concatenate all parent scene states.
          function concatSceneState(e) {
            if (e === undefined) {
              return undefined;
            }

            const s = e.parent ? concatSceneState(e.parent) : {};
            return Object.assign(s, e.sceneState);
          }

          const source = concatSceneState(sourceElement);
          const target = concatSceneState(targetElement);
          if (source !== undefined) {
            // Set the state to avoid unexpected placing,
            eventBus.fire('scene.set_state', { state: source });
          }
          if (source !== undefined && target !== undefined) {
            // source/target states are concated full states now,
            // leave the diff to the scene-view, though not as optimized as before.
            const duration = sourceElement.businessObject.get('duration');
            eventBus.fire('animation.play', { source, target, duration });
          }
          break;

        case 'bpmn:Task':
          const replace = bpmnModeler.get('bpmnReplace').replaceElement;
          replace(element, { type: 'bpmn:UserTask' });
          break;

        case 'bpmn:UserTask':
        case 'bpmn:Process':
        case 'bpmn:SubProcess':
          // if (element.sceneState == undefined)
          {
            // TODO: concatenate all parent scene states
            const state = element.businessObject.get('state');
            if (state) {
              element.sceneState = JSON.parse(state);
            }
          }
          // Is element.sceneState about the full scene??
          if (element.sceneState !== undefined) {
            let state = element.sceneState;
            if (element.parent) {
              state = Object.assign({}, element.parent.sceneState, element.sceneState);
            }
            eventBus.fire('scene.set_state', { state });
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
      bpmnModeler.saveXML().then((result) => {
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
        if (element.type === 'bpmn:StartEvent') {
          element = element.parent;
        }

        // Update the root element when new models are loaded
        if (id === '@vls_root_element') {
          const canvas = bpmnModeler.get('canvas');
          element = canvas._rootElement;
        }

        if (element.type === 'bpmn:Process') {
          if (id) {
            // full state
            element.sceneState = state;
          } else {
            Object.assign(element.sceneState, state);
          }
          element.businessObject.set('state', JSON.stringify(element.sceneState));
        }

        if (element.type === 'bpmn:UserTask' || element.type === 'bpmn:SubProcess') {
          if (id) {
            // full state
            // find diff with parent scene
            const parentState = element.parent.sceneState; // TODO: parentScene undefined?
            element.sceneState = {};
            Object.keys(state).forEach((id) => {
              if (JSON.stringify(parentState[id]) !== JSON.stringify(state[id])) {
                element.sceneState[id] = state[id];
              }
            });
          } else {
            Object.assign(element.sceneState, state); // TODO: check against parent?
          }
        }

        if (element.sceneState) {
          const cmd = bpmnModeler.get('commandStack');
          cmd.execute('element.updateProperties', {
            element,
            properties: { state: JSON.stringify(element.sceneState) },
          });
        }
      }
    };

    openDiagram(diagramXML);
  }

  processPlayer(xml, eventBus, setColor) {
    console.log('ProcessPlayer', xml);

    function parseFullSceneState(activity, context) {
      console.log('parseFullSceneState', activity, context);

      const state = activity.behaviour.state === undefined ? {} : JSON.parse(activity.behaviour.state);

      switch (activity.type) {
        case 'bpmn:Process':
          activity.fullSceneState = state;
          break;

        case 'bpmn:ParallelGateway': // Need fullSceneState when combining sourceParallel
        case 'bpmn:SubProcess':
        case 'bpmn:UserTask':
          // Assuming the parent is always involved before its children
          const parent =
            activity.parent.type === 'bpmn:Process'
              ? context.getProcessById(activity.parent.id)
              : context.getActivityById(activity.parent.id);
          activity.fullSceneState = Object.assign({}, parent.fullSceneState, state);
          activity.sceneState = state; // Needed for computing sourceParallel
          break;
      }

      activity.on('enter', (api) => {
        // console.log('parseFullSceneState:activity.onWait', api);
      });

      activity.on('wait', (api) => {
        // console.log('parseFullSceneState:activity.onWait', api);
      });
    }

    const engine = Engine({
      name: 'ProcessPlayer',
      source: xml,
      /* moddleOptions: {
                vls: vlsModdleDescriptor,
                camunda: camundaModdleDescriptor
            }, */
      extensions: {
        parseFullSceneState,
      },
    });

    const listener = new EventEmitter();

    listener.once('process.start', (api) => {
      console.log('process.start', api);
      // No need to fire, because reset() already has root element selected.
      // eventBus.fire('scene.set_state', {state: api.owner.fullSceneState});

      // TODO: variables are not scoped per execution!
      api.environment.variables.source = api;
    });

    listener.once('process.end', (api) => {
      console.log('process.end', api);
    });

    listener.on('flow.take', (flow, scope) => {
      console.log(`flow <${flow.id} was taken`, flow, scope);

      const target = scope.getActivityById(flow.content.targetId);
      if (target?.type === 'bpmn:ParallelGateway' && target.inbound.length > 1) {
        // Don't bother with only 1 incoming flow
        const union = flow.environment.variables.sourceParallel;
        flow.environment.variables.sourceParallel = Object.assign(union ? union : {}, flow.environment.variables.source.owner.sceneState);
        console.log('sourceParallel', union, flow.environment.variables.sourceParallel);
      }

      const old = flow.environment.variables.flow;
      if (old) {
        setColor([old.id], { stroke: 'gray' });
      }
      // TODO: variables are not scoped per execution!
      flow.environment.variables.flow = flow;

      setColor([flow.id], { stroke: '#9f9' });
    });

    listener.on('activity.start', (api) => {
      console.log('activity.start', api);
      setColor([api.id], { stroke: 'green', fill: '#9f9' });
    });

    listener.on('activity.end', (api, engine) => {
      console.log('activity.end', api, engine);
      // or simple check the magic:state property's existence
      if (api.type == 'bpmn:UserTask') {
        // TODO: Needs to scope this to support concurrent executions, e.g. parallel gateway
        api.environment.variables.source = api;
      }
      if (api.content.output) {
        engine.environment.output[api.id] = api.content.output;
        // Set the result for conditional expressions
        api.environment.variables.result = api.content.output;
      }
      if (api.type == 'bpmn:EndEvent') {
        // TODO: wait animation to finish
        const old = api.environment.variables.flow;
        if (old) {
          setColor([old.id], { stroke: 'gray' });
        }
      }
      if (api.type === 'bpmn:ParallelGateway' && api.owner.inbound.length > 1) {
        const state = Object.assign(
          api.owner.fullSceneState, // ParallelGateway's fullSceneState
          api.environment.variables.sourceParallel,
        );
        api.environment.variables.source = {
          owner: {
            behaviour: {
              // TODO: how to combine the duration? or simply use the last one's
              duration: api.environment.variables.source.owner.behaviour.duration,
            },
            fullSceneState: state,
            sourceParallel: api.environment.variables.sourceParallel,
          },
        };
        api.environment.variables.sourceParallel = undefined;
        console.log('Combined source', api.environment.variables.source);
      }
      setColor([api.id], { stroke: 'gray', fill: '#eee' });
    });

    const apiMap = {};
    listener.on('wait', (api, scope) => {
      console.log('wait', api, scope);

      const flow = api.environment.variables.flow;
      if (flow) {
        const source = api.environment.variables.source;
        if (source) {
          const duration = source.owner.behaviour.duration;

          apiMap[api.executionId] = api;
          // vscode.postMessage({cmd: 'scene.stop_anim'});
          if (source.owner.fullSceneState) {
            if (api.owner.fullSceneState) {
              let operate = api.owner.behaviour.operate;
              if (operate) {
                operate = JSON.parse(operate);
              }
              // TODO: disable scene editing, and ignore scene.updated messages

              eventBus.fire('animation.play', {
                id: api.executionId,
                source: source.owner.fullSceneState,
                target: api.owner.fullSceneState,
                duration,
                operate,
              });

              // Wait the animation to stop
              return;
            }
          }
        }
      }

      api.signal({ dummy: 'no animation' });
    });

    this.process = function (id, result) {
      const api = apiMap[id];
      console.log('process.anim_done with api', api);
      if (api) {
        delete apiMap[id]; // safe?
        api.signal({ id, operate: result });
      }
    };

    this.execute = function (succ, fail) {
      function clicked(expected, env) {
        console.log('=====================', env, expected);
        // ${environment.services.clicked('left', environment, )}
        // May need to be properly scoped (by using a name parameter), e.g.
        // return env.variables.result[scope].operate == expected;
        return env.variables.result.operate == expected;
      }

      /* engine.once('end', (execution) => {
                console.log('engine end', execution);
                setTimeout(() => {
                    succ();
                }, 1000);
            }); */

      engine.execute(
        {
          listener,
          variables: {
            apiPath: 'https://example.com/test',
          },
          services: {
            clicked,
          },
        } /* , (err) => {
                    if (fail) {
                        fail(err);
                    }
                    else
                        if (err) { throw err; }
                }*/,
      );
    };
  }
}
