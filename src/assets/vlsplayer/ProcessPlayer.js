import { Engine } from 'bpmn-engine';
import { EventEmitter } from 'events';

import vlsModdleDescriptor from './descriptors/vls.json';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';

export default function (xml, eventBus) {

  //  console.log('ProcessPlayer', xml);

    function parseFullSceneState(activity, context) {
        console.log("parseFullSceneState", activity, context);

        let state = (activity.behaviour.state === undefined) ? {}
            : JSON.parse(activity.behaviour.state);
            let camera = (activity.behaviour.camera === undefined) ? undefined : JSON.parse(activity.behaviour.camera);
        switch (activity.type) {
            case 'bpmn:Process':
                activity.fullSceneState = state;
                activity.cameraState = camera;
                break;

            case 'bpmn:ParallelGateway': // Need fullSceneState when combining sourceParallel
            case 'bpmn:SubProcess':
            case 'bpmn:UserTask':
                // Assuming the parent is always involved before its children
                let parent = (activity.parent.type === 'bpmn:Process')
                    ? context.getProcessById(activity.parent.id)
                    : context.getActivityById(activity.parent.id);
                activity.fullSceneState = Object.assign({}, parent.fullSceneState, state);
                activity.sceneState = state; // Needed for computing sourceParallel
                activity.cameraState = camera;
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
        moddleOptions: {
            vls: vlsModdleDescriptor,
            camunda: camundaModdleDescriptor
        },
        extensions: {
            parseFullSceneState
        }
    });
    this.engine = engine;
    const listener = new EventEmitter();

    listener.once('process.start', (api) => {
        console.log('process.start', api);
        // No need to fire, because reset() already has root element selected.
        //eventBus.fire('scene.set_state', {state: api.owner.fullSceneState});

        // TODO: variables are not scoped per execution!
        api.environment.variables.source = api;
    });

    listener.once('process.end', (api) => {
        console.log("process.end", api);
    });

    listener.on('flow.take', (flow, scope) => {
        console.log(`flow <${flow.id} was taken`, flow, scope);

        let target = scope.getActivityById(flow.content.targetId);
        if (target?target.type === 'bpmn:ParallelGateway' : ''
            && target.inbound.length > 1) { // Don't bother with only 1 incoming flow
            let union = flow.environment.variables.sourceParallel;
            flow.environment.variables.sourceParallel =
                Object.assign(union ? union : {}, flow.environment.variables.source.owner.sceneState);
            console.log("sourceParallel", union, flow.environment.variables.sourceParallel);
        }

        let old = flow.environment.variables.flow;
        if (old) {
           // setColor([old.id], { stroke: 'gray' });
        }
        // TODO: variables are not scoped per execution!
        flow.environment.variables.flow = flow;

        // setColor([flow.id], { stroke: '#9f9' });
    });

    listener.on('activity.start', api => {
        console.log('activity.start', api);
       // setColor([api.id], { stroke: 'green', fill: '#9f9' });
       var camera = api.owner.cameraState;
      if (camera) {
        eventBus.fire('scene.set_camera', { camera });
      }
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
            let old = api.environment.variables.flow;
            if (old) {
              //  setColor([old.id], { stroke: 'gray' });;
            }
        }
        if (api.type === "bpmn:ParallelGateway"
            && api.owner.inbound.length > 1) {
            let state = Object.assign(api.owner.fullSceneState, // ParallelGateway's fullSceneState
                api.environment.variables.sourceParallel);
            api.environment.variables.source = {
                owner: {
                    behaviour: {
                        // TODO: how to combine the duration? or simply use the last one's
                        duration: api.environment.variables.source.owner.behaviour.duration
                    },
                    fullSceneState: state,
                    sourceParallel: api.environment.variables.sourceParallel,
                },
            };
            api.environment.variables.sourceParallel = undefined;
            console.log("Combined source", api.environment.variables.source);
        }
        // setColor([api.id], { stroke: 'gray', fill: '#eee' });
    });

    let apiMap = {};
    listener.on('wait', (api, scope) => {
        console.log('wait', api, scope);

        let flow = api.environment.variables.flow;
        if (flow) {
            let source = api.environment.variables.source;
            if (source) {
                let duration = source.owner.behaviour.duration;

                apiMap[api.executionId] = api;
                //vscode.postMessage({cmd: 'scene.stop_anim'});
                if (source.owner.fullSceneState) {
                    if (api.owner.fullSceneState) {
                        let operate = api.owner.behaviour.operate;
                        if (operate)
                            operate = JSON.parse(operate);
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
        let api = apiMap[id];
        console.log('apiMap', apiMap);
        console.log('process.anim_done with api', api);
        if (api) {
            delete apiMap[id]; // safe?
            api.signal({ id: id, operate: result });
        }
    };

    this.execute = function (succ, fail) {

        function clicked(expected, env) {
            console.log("=====================", env, expected);
            // ${environment.services.clicked('left', environment, )}
            // May need to be properly scoped (by using a name parameter), e.g.
            //return env.variables.result[scope].operate == expected;
            return env.variables.result.operate == expected;
        }

        engine.once('end', (execution) => {
            
            console.log('engine end', execution);
            var root = execution.definitions[0].getProcesses()[0];
            var camera = root.cameraState;
            if (camera) {
                eventBus.fire('scene.set_camera', { camera });
            }
            eventBus.fire('scene.set_state', { state: root.fullSceneState });
            setTimeout(() => {
                succ();
            }, 1000);
        });
        engine.once('stop',  (execution) => {
            console.log('engine stop', execution);
            var root = execution.definitions[0].getProcesses()[0];
            var camera = root.cameraState;
            if (camera) {
                eventBus.fire('scene.set_camera', { camera });
            }
                    });
                engine.once('error',  (execution) => {
                console.log('engine error', execution);
                    });
        engine.execute
            ({
                listener,
                variables: {
                    apiPath: 'https://example.com/test'
                },
                services: {
                    clicked,
                }
            }, (err) => {
                if (fail)
                    fail(err);
                else
                    if (err) throw err;
            });
    };


}