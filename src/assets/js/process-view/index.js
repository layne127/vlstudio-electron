
import $ from 'jquery';

import ProcessView from './ProcessView';
import ProcessPlayer from './ProcessPlayer';

import diagramXML from '../resources/newDiagram.bpmn';

$(function () {

  let processView = new ProcessView('#js-canvas', '#js-properties-panel', diagramXML);
  console.log('processView', processView);

  const vscode = typeof (acquireVsCodeApi) === 'function' ? acquireVsCodeApi() : {
    postMessage: function (msg) {
      console.log('postMessage', msg);
      switch (msg.cmd) {
        case 'scene.play_anim':
          if (player) {
            if (msg.operate) {
              let result = prompt('Operate: ' + JSON.stringify(msg.operate));
              player.process(msg.id, result);
            } else {
              setTimeout(() => {
                player.process(msg.id);
              }, msg.duration * 1000);
            }

          }
          break;
      }
    }
  };

  processView.eventBus.on('scene.set_state', function (event) {
    vscode.postMessage({
      cmd: 'scene.state',
      scene: event.state,
    });
  });

  processView.eventBus.on('scene.get_state', function (event) {
    vscode.postMessage({
      cmd: 'scene.fetch_state',
      id: event.id,
    });
  });

  processView.eventBus.on('animation.play', function (event) {
    vscode.postMessage({
      cmd: 'scene.play_anim',
      ...event,
    });
  });

  processView.eventBus.on('animation.stop', function (event) {
    vscode.postMessage({
      cmd: 'scene.stop_anim'
    });
  });

  let player;
  processView.eventBus.on('process.play', function (event) {
    // scene.set_state, animation.play
    player = new ProcessPlayer(event.xml, processView.eventBus, processView.setColor);
    
    vscode.postMessage({
      cmd: 'scene.start_play'
    });

    player.execute(() => {
      processView.reset();

      vscode.postMessage({
        cmd: 'scene.stop_play'
      });
    });
  });

  window.addEventListener('message', event => {

    const msg = event.data; // The JSON data our extension sent
    console.log(msg);

    switch (msg.cmd) {
      case 'scene.updated':
        processView.updateScene(msg.id, msg.scene);
        break;

      case 'process.anim_done':
        if (player) {
          player?.process(msg.id, msg.operate);
        }
        break;

      case 'save':
        processView.save(xml =>
          vscode.postMessage({
            cmd: 'process.save',
            data: xml,
          })
        );
        break;

      case 'load':
        processView.load(msg.data);
        break;
    }
  });
});
