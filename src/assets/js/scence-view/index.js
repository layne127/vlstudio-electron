import $ from 'jquery';

import SceneView from './SceneView';

$(function() {
  
  let sceneView = new SceneView('scene-canvas', 'scene-properties');
  console.log(sceneView);

  const vscode = typeof(acquireVsCodeApi) === 'function' ? acquireVsCodeApi(): {
    postMessage: function(msg) {
      console.log('postMessage', msg);
    }
  };

  sceneView.eventBus.on('model.loaded', function(event) {
    // Update tree view
    vscode.postMessage({
      cmd: 'model.loaded',
      model: event.model,
    });

    // Update process view
    vscode.postMessage({
      cmd: 'scene.updated',
      // TODO: use the model state instead of full states
      scene: sceneView.getState(),
      id: '@vls_root_element',
    })
  });

  sceneView.eventBus.on('node.updated', function(event) {
    vscode.postMessage({
        cmd: 'scene.updated',
        scene: event.state,
    });
  });

  sceneView.eventBus.on('selection.changed', function(event) {
    vscode.postMessage({
      cmd: 'select', 
      ids: event.newSelection.map(h => h.object.id),
    });
  });

  window.addEventListener('message', event => {

    const msg = event.data; // The JSON data our extension sent
    console.log(msg);

    switch (msg.cmd) {
        case 'hover':
          sceneView.hoverMesh(msg.id);          
          break;
        case 'select':
          sceneView.selectMesh(msg.ids);          
          break;

        case 'scene.state':
          sceneView.setState(msg.scene);
          break;

        case 'save':
          vscode.postMessage({
            cmd: 'scene.save', 
            data:  sceneView.save(),
          });
          break;

        case 'load':
          sceneView.load(msg.data);
          break;
        
        case 'scene.fetch_state':
          vscode.postMessage({
            cmd: 'scene.updated',
            scene: sceneView.getState(),
            id: msg.id,
          })
          break;

        case 'scene.play_anim':
          sceneView.playAnim(
            msg.source, msg.target, msg.duration,
            msg.id, msg.operate, function(result) {
              vscode.postMessage({
                cmd: 'process.anim_done',
                id: msg.id, // opId
                operate: result,
              });
            });
          break;

        case 'scene.stop_anim':
          // TODO: Should stop all animations?
          sceneView.stopAnim(msg.id);
          break;
    }
  });
});
