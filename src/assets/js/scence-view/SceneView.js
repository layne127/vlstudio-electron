
import * as xeogl from 'xeogl';
let xeo = xeogl;
const OBJModel = require('./js/models/OBJModel');
const vectorTextGeometry = require('./js/geometry/vectorTextGeometry');
const axisHelper = require('./js/helpers/axisHelper');
// require('./js/animation/cameraPath')(xeogl);
// require('./js/animation/cameraFollowAnimation')(xeogl);
OBJModel(xeo);
vectorTextGeometry(xeo);
axisHelper(xeo);
import EventBus from 'diagram-js/lib/core/EventBus';
import PropertiesPanel from 'bpmn-js-properties-panel/lib/PropertiesPanel';

import ScenePropertiesProvider from './ScenePropertiesProvider';

var Animation = function (scene, duration = 1) {

  var tasks = [];
  var dir = 0;
  var t = 0;
  var ok;

  // TODO: when to remove the handler?
  scene.on("tick", function () {
      if (dir === 0) {
          return;
      }
      if (t < 0) {
          t = 0;
          dir = 0;
      }
      if (t > 1) {
          t = 1;
          dir = 0;
      }
      for (var i = 0, len = tasks.length; i < len; i++) {
          tasks[i](t);
      }
      if (dir !== 0) {
          t += 0.03 * dir / duration;
      } else {
        if (!cancelled)
          if (ok) {
              ok();
          }
      }
  });

  this.xray = function (ids, alpha) {
      for (var i = 0, len = ids.length; i < len; i++) {
          var id = ids [i];
          tasks.push((function () {
              var object = scene.objects[id];
              var startAlpha = object.material.alpha;
              return function (t) {
                  var newAlpha = startAlpha + (t * (alpha - startAlpha));
                  object.material.alpha = newAlpha;
                  object.material.alphaMode = (newAlpha < 1.0) ? "blend" : "opaque"; // Note: breaks alpha maps
              };
          })());
      }
      return this;
  };

  this.translate = function (ids, xyz) {
      for (var i = 0, len = ids.length; i < len; i++) {
          var id = ids [i];
          tasks.push((function () {
              var object = scene.objects[id];
//                    object.transform = new xeogl.Translate({
//                        parent: object.transform
//                    });
              return function (t) {
                  object.position = [xyz[0] * t, xyz[1] * t, xyz[2] * t]
              };
          })());
      }
      return this;
  };

  this.translate2 = function (ids, abc, xyz, prop='position') {
      for (var i = 0, len = ids.length; i < len; i++) {
          var id = ids [i];
          tasks.push((function () {
              var object = scene.objects[id];
//                    object.transform = new xeogl.Translate({
//                        parent: object.transform
//                    });
              return function (t) {
                  object[prop] = [abc[0] + (xyz[0]-abc[0]) * t, abc[1] + (xyz[1]-abc[1]) * t, abc[2] + (xyz[2]-abc[2]) * t]
              };
          })());
      }
      return this;
  };

  this.change1 = function (ids, abc, xyz, prop='opacity') {
    for (var i = 0, len = ids.length; i < len; i++) {
        var id = ids [i];
        tasks.push((function () {
            var object = scene.objects[id];
            return function (t) {
                object[prop] = abc + (xyz-abc) * t;
            };
        })());
    }
    return this;
  };

  this.play = function (_ok) {
      dir = 1.0;
      t = 0.0;
      ok = _ok;
  };

  this.rewind = function () {
      dir = -1.0;
      t = 1.0
  };

  var cancelled;
  this.cancel = function(element) {
      t = 1;
      cancelled = true;
  }
};

export default function (canvasId, propertiesPanelId, transparent = false) {

    console.log('aa', canvasId, document.getElementById(canvasId));
    let scene = new xeogl.Scene({
        canvas: canvasId,
        transparent, 
    });
    scene.clearLights();

    // xeogl.setDefaultScene(scene);
    this.xeogl = xeogl;

    new xeogl.AmbientLight(scene, {
        color: [1.0, 1.0, 1.0]
    });
    new xeogl.PointLight(scene, {
        pos: [-40, 30, 40],
        color: [1.0, 1.0, 1.0],
        space: 'view'
    });
    new xeogl.PointLight(scene, {
        pos: [40, 20, 20],
        color: [1.0, 1.0, 1.0],
        space: 'view'
    });
    new xeogl.PointLight(scene, {
        pos: [-20, 80, -80],
        color: [1.0, 1.0, 1.0],
        space: 'view'
    });

    var camera = scene.camera;
    camera.eye = [-4.98, 1.89, 0.72];
    camera.look = [0, 0.52, -0.05];
    camera.up = [0.26, 0.54, -0.05];
    camera.orbitYaw(200);

    new xeo.AxisHelper({
        camera: scene.camera,
        size: [100, 100],
        visible: true
    });

    scene.input.on('keyup', function (keyCode) {
        if (keyCode == 17) {
            // To workaround xeogl's ctrl key problem
            scene.input.ctrlDown = false;
        }
    });

    // TODO: scene environment settings
    new xeogl.Mesh(
        scene, {
        geometry: new xeogl.PlaneGeometry(scene, {
            xSize: 20, zSize: 20
        }),
        material: new xeogl.PhongMaterial(scene, {
            shininess: 170,
            specular: [0.1, 0.1, 0.3],
            diffuseMap: new xeogl.Texture(scene, {
              //  src: './textures/diffuse/uvGrid2.jpg',
                scale: [-5.0, 5.0]
            }),
            xalpha: 0.99,
            backfaces: false
        }),
        position: [0, -1.1, 0],
        collidable: false,
        pickable: false
    });
    


    this.scene = scene;
    let eventBus = new EventBus();

    this.eventBus = eventBus;
    this.on = eventBus.on;
    this.off = eventBus.off;
    this.once = eventBus.once;
    this.fire = eventBus.fire;

    function dumpState(obj, levels = -1, state = {}) {
        state[obj.id] = {
            position: Array.from(obj.position),
            rotation: Array.from(obj.rotation),
            scale: Array.from(obj.scale),
            colorize: Array.from(obj.colorize),
            opacity: obj.opacity,
        };
        if (levels != 0) {
            if (obj.children !== null) {
                obj.children.forEach(c => {
                    dumpState(c, levels - 1, state);
                });
            }
        }
        return state;
    }

    function loadModel(name, url) {
        console.log('loadModel', this);
        var model = new xeo.OBJModel(scene, {
            id: name,
            src: url
        });                   
        
        model.on("loaded", function () {
            let toTreeNode = function (obj) {
                var node = { id: obj.id, type: obj.type };
                if (obj.children !== null) {
                    node.children = obj.children.map(o => {
                        return toTreeNode(o);
                    });
                }
                return node;
            };
            eventBus.fire('model.loaded', { model: toTreeNode(model) });
        });
        return model;
    };

    this.loadModel = loadModel;
    let canvas = {
        root: {
            id: 'xeogl.Scene',
            name: 'Scene',            
            get: function (name) {
                return this[name];
            }
        },
        getRootElement: function () {
            return this.root;
        }
    };

    if (propertiesPanelId !== undefined) {

        let commandStack = {
            execute: function (cmd, data) {
                console.log('execute: ' + cmd, data);

                switch (cmd) {
                    case 'model.load':
                        loadModel(data.name, data.url);
                        break;

                    case 'element.updateProperties':
                        if (data.element.id === 'xeogl.Scene') {
                            data.element.name = data.properties.name;
                            return;
                        }

                        Object.keys(data.properties).forEach(prop => {
                            if (['rotation', 'scale', 'colorize'].includes(prop)) {
                                data.element.object[prop] = new Float32Array(JSON.parse('[' + data.properties[prop] + ']'));
                            } else { // position, etc.
                                data.element.object[prop] = data.properties[prop];
                            }
                        });

                        let state = dumpState(data.element.object, 0);
                        eventBus.fire('node.updated', {state});                    
                        break;
                }
            }
        };

      var p = new PropertiesPanel(
            { parent: propertiesPanelId ? document.getElementById(propertiesPanelId) : '' },
            this.eventBus,
            {},
            new ScenePropertiesProvider(this.eventBus, canvas, {}, {}, function (text) { return text }),
            commandStack,
            canvas
        );

        this.eventBus.fire('root.added', { element: canvas.getRootElement() });

    }


    let cameraControl = new xeogl.CameraControl(scene);

    // TODO: support multiple concurrent operations
    var operates = [];

    let selectedHits = [];
    cameraControl.on('picked', function (hit) {
        if (scene.input.ctrlDown) {
            if (hit.object.selected) {
                hit.object.selected = false;
                selectedHits = selectedHits.filter(h => h.object.id !== hit.object.id);
            } else {
                hit.object.selected = true;
                selectedHits.push(hit);
            }
        } else {
            selectedHits.forEach(h => {
                h.object.selected = false;
            });
            hit.object.selected = true;
            selectedHits = [hit];
        }

        console.log('operates', operates, hit)
        operates.forEach((op, i, array) => {
            let name = op[hit.object.id];
            if (name) {
                op.callback(name);
                delete op['callback'];
                Object.keys(op).forEach(id => {
                    scene.objects[id].highlighted = false;
                });
                array.splice(i, 1);
            }
        });

        hit.id = hit.object.type;
        hit.get = function (name) {
            return hit.object[name];
        }
        hit.selectParent = function () {
            cameraControl.fire('picked', { mesh: hit.object.parent, object: hit.object.parent });
        }

        // TODO: vscode Treeview will trigger selection.changed again
        eventBus.fire('selection.changed', { newSelection: selectedHits });
    });

    cameraControl.on('pickedNothing', function () {
        if (!scene.input.ctrlDown) {
            selectedHits.forEach(h => {
                h.object.selected = false;
            });
            selectedHits = [];
            eventBus.fire('selection.changed', { newSelection: selectedHits });
        }
    });

    let lastHoveredHit;
    cameraControl.on('hoverEnter', function (hit) {
        if (lastHoveredHit !== undefined) {
            lastHoveredHit.mesh.highlighted = false;
            lastHoveredHit = undefined;
        }

        // TODO: better disable all editing interaction when playing a process.
        if (operates.length > 0)
            return;

        lastHoveredHit = hit;
        hit.mesh.highlighted = true;
    });
    cameraControl.on('hoverOut', function (hit) {
        if (operates.length > 0)
            return;

        if (lastHoveredHit !== undefined) {
            lastHoveredHit.mesh.highlighted = false;
        }
        lastHoveredHit = undefined;
    });

    this.cameraControl = cameraControl;

    this.hoverMesh = function (id) {
        if (id === undefined) {
            cameraControl.fire('hoverOut', {}, true);
        } else {
            cameraControl.fire('hoverEnter', { mesh: scene.meshes[msg.id] }, true);
        }
    };

    this.selectMesh = function (ids) {
        selectedHits.forEach(h => {
            h.object.selected = false;
        });
        selectedHits = ids.map(id => {
            let obj = scene.objects[id];
            obj.selected = true;
            return {
                id: obj.type,
                object: obj,
                get: function (name) {
                    return obj[name];
                }
            };
        });

        eventBus.fire('selection.changed', { newSelection: selectedHits });
    };

    this.setState = function (sceneState) {
        Object.keys(sceneState).forEach(id => {
            var state = sceneState[id];
            var obj = scene.objects[id];
            if (obj === undefined)
                console.log("xxx", id, state, scene);
            obj.position = new Float32Array(state.position);
            obj.rotation = new Float32Array(state.rotation);
            obj.scale = new Float32Array(state.scale);
            obj.colorize = new Float32Array(state.colorize);
            obj.opacity = state.opacity;
        });
        // TODO: find a better way to update the properties panel
        eventBus.fire('selection.changed', { newSelection: selectedHits });

    };

    this.save = function () {
        var data = {
            models: []
        };
        Object.keys(scene.models).forEach(id => {
            var model = scene.models[id];
            data.models.push({
                id: model.id,
                src: model.src,
                position: Array.from(model.position),
                rotation: Array.from(model.rotation),
                scale: Array.from(model.scale),
                colorize: Array.from(model.colorize),
            });
        });

        return data;
    };

    this.load = function (data) {
        //scene.clear();
        data.models.forEach(m => {
            var model = loadModel(m.id, m.src);
            model.position = new Float32Array(m.position);
            model.rotation = new Float32Array(m.rotation);
            model.scale = new Float32Array(m.scale);
            model.colorize = new Float32Array(m.colorize);
            model.opacity = m.opacity;
        });
    };

    this.getState = function () {
        var state = {};
        Object.keys(scene.models).forEach(id => {
            dumpState(scene.models[id], -1, state);
        });
        return state;
    };

    let anim;
    this.playAnim = function (source, target, duration, opId, opArgs, anim_done) {
        // disable scene editing when animating, unless we are using a separate canvas to show it
        anim = new Animation(scene, duration);
        Object.keys(source).forEach(id => {
            var s = source[id];
            var t = target[id];
            if (!(s.position[0] == t.position[0] && s.position[1] == t.position[1] && s.position[2] == t.position[2])) {
                anim.translate2([id], s.position, t.position);
                console.log("anim position", id);
            }
            if (!(s.rotation[0] == t.rotation[0] && s.rotation[1] == t.rotation[1] && s.rotation[2] == t.rotation[2])) {
                anim.translate2([id], s.rotation, t.rotation, 'rotation');
                console.log("anim rotation", id);
            }
            if (!(s.scale[0] == t.scale[0] && s.scale[1] == t.scale[1] && s.scale[2] == t.scale[2])) {
                anim.translate2([id], s.scale, t.scale, 'scale');
                console.log("anim scale", id);
            }
            if (!(s.opacity == t.opacity)) {
                anim.change1([id], s.opacity, t.opacity, 'opacity');
                console.log("anim opacity", id);
            }
        });

        var ok = function () {
            if (opId) {
                if (opArgs) {
                    let op = opArgs;
                    // Highlight or add some hints to the operation
                    Object.keys(op).forEach(id => {
                        scene.objects[id].highlighted = true;
                    });

                    op.callback = function (result) {
                        console.log('callback: ', result);
                        anim_done(result);
                    }
                    operates.push(op);
                } else {
                    // notify animation is completed
                    anim_done();
               }
            } else { // repeat playing otherwise
                setTimeout(function () {
                    if (anim.dir != 0) {
                        anim.play(ok);
                    }
                }, 1000);
            }
        }
        anim.play(ok);
    }

    this.stopAnim = function (animId) {
        if (anim) {
            anim.cancel();
            anim = null;
        }
    };
}