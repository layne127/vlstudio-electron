import { EventEmitter, Injectable } from '@angular/core';
import PropertiesPanel from 'bpmn-js-properties-panel/lib/PropertiesPanel';
import EventBus from 'diagram-js/lib/core/EventBus';
import $ from 'jquery';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as xeogl from 'xeogl';
const xeo = xeogl;
const OBJModel: any = require('../../../assets/js/scence-view/js/models/OBJModel');
const glTFModel: any = require('../../../assets/js/scence-view/js/models/glTFModel');
const vectorTextGeometry: any = require('../../../assets/js/scence-view/js/geometry/vectorTextGeometry');
const axisHelper: any = require('../../../assets/js/scence-view/js/helpers/axisHelper');
const curve: any = require('../../../assets/js/scence-view/js/curves/curve');
const splineCurve: any = require('../../../assets/js/scence-view/js/curves/splineCurve');
const cameraPath: any = require('../../../assets/js/scence-view/js/animation/cameraPath');
const cameraPathAnimation: any = require('../../../assets/js/scence-view/js/animation/cameraPathAnimation');
const cameraFollowAnimation: any = require('../../../assets/js/scence-view/js/animation/cameraFollowAnimation');
OBJModel(xeo);
glTFModel(xeo);
vectorTextGeometry(xeo);
axisHelper(xeo);
curve(xeo);
splineCurve(xeo);
cameraPath(xeo);
cameraPathAnimation(xeo);
cameraFollowAnimation(xeo);
import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';
// Require all properties you need from existing providers.
// In this case all available bpmn relevant properties without camunda extensions.

// import ScenePropertiesProvider from '../../../assets/js/scence-view/ScenePropertiesProvider';
import ScenePropertiesProvider from '../providers/ScenePropertiesProvider';
@Injectable({
  providedIn: 'root',
})
export class ScenceViewService {
  private subject = new Subject<any>();
  private vlssubject = new Subject<any>();
  public modelTreeList = new Subject<any>();
  // modelLibraryUrl: any;
  vlsmodelLibraryUrl: any;
  xeogl: any;
  cancel: (element: any) => void;
  rewind: () => void;
  play: (_ok: any) => void;
  change1: (ids: any, abc: any, xyz: any, prop?: string) => any;
  translate2: (ids: any, abc: any, xyz: any, prop?: string) => any;
  translate: (ids: any, xyz: any) => any;
  xray: (ids: any, alpha: any) => any;
  scene: any;
  eventBus: any;
  on: any;
  off: any;
  once: any;
  fire: any;
  loadModel: (name: any, url: any) => any;
  model: any;
  cameraControl: any;
  ambientLight: any;
  axisHelper: any;
  mesh: any;
  hoverMesh: (id: any) => void;
  selectMesh: (ids: any) => void;
  setState: (sceneState: any) => void;
  save: () => { models: any[] };
  load: (data: any) => void;

  playAnim: (source: any, target: any, duration: any, opId: any, opArgs: any, anim_done: any) => void;
  stopAnim: (animId: any) => void;

  // operates = new EventEmitter<string>();
  public operatesHit = new BehaviorSubject<any>(null);
  public modelLibraryUrl = new BehaviorSubject<any>(null);
  getStates: () => {};
  clearScene: () => void;
  setCamera: (cam: any) => void;
  clear: () => void;
  clearModels: () => void;
  getStats: () => { objects: number; vertices: number; triangles: number };
  constructor() {}

  /**
   * obj模型库地址
   */
  sendModelLibraryUrl(value: any) {
    // this.modelLibraryUrl = null;
    if (value) {
      // this.modelLibraryUrl = value;
      this.subject.next(value);
    }
  }

  /**
   * 获取obj模型库地址
   */
  getModelLibraryUrl(): Observable<any> {
    // return this.modelLibraryUrl;
    return this.subject.asObservable();
  }
  /**
   * 存储模型库树形数据库
   */
  sendModelTreeList(value: any) {
    if (value) {
      this.modelTreeList.next(value);
    }
  }

  getModelTreeList(): Observable<any> {
    return this.modelTreeList.asObservable();
  }

  /**
   * obj模型库地址
   */
  sendVLSModelLibraryUrl(value: any) {
    this.vlsmodelLibraryUrl = null;
    if (value) {
      // this.modelLibraryUrl = value;
      this.vlssubject.next(value);
    }
  }

  /**
   * 获取obj模型库地址
   */
  getVLSModelLibraryUrl(): Observable<any> {
    // return this.modelLibraryUrl;
    return this.vlssubject.asObservable();
  }

  getState1() {
    return this.getStates();
  }

  Animation(scene, duration = 1) {
    const tasks = [];
    let dir = 0;
    let t = 0;
    let ok;

    // TODO: when to remove the handler?
    scene.on('tick', function () {
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
      for (let i = 0, len = tasks.length; i < len; i++) {
        tasks[i](t);
      }
      if (dir !== 0) {
        t += (0.03 * dir) / duration;
      } else {
        if (!cancelled) {
          if (ok) {
            ok();
          }
        }
      }
    });

    this.xray = function (ids, alpha) {
      for (let i = 0, len = ids.length; i < len; i++) {
        const id = ids[i];
        tasks.push(
          (function () {
            const object = scene.objects[id];
            const startAlpha = object.material.alpha;
            return function (t) {
              const newAlpha = startAlpha + t * (alpha - startAlpha);
              object.material.alpha = newAlpha;
              object.material.alphaMode = newAlpha < 1.0 ? 'blend' : 'opaque'; // Note: breaks alpha maps
            };
          })(),
        );
      }
      return this;
    };

    this.translate = function (ids, xyz) {
      for (let i = 0, len = ids.length; i < len; i++) {
        const id = ids[i];
        tasks.push(
          (function () {
            const object = scene.objects[id];
            //                    object.transform = new xeogl.Translate({
            //                        parent: object.transform
            //                    });
            return function (t) {
              object.position = [xyz[0] * t, xyz[1] * t, xyz[2] * t];
            };
          })(),
        );
      }
      return this;
    };

    this.translate2 = function (ids, abc, xyz, prop = 'position') {
      for (let i = 0, len = ids.length; i < len; i++) {
        const id = ids[i];
        tasks.push(
          (function () {
            const object = scene.objects[id];
            //                    object.transform = new xeogl.Translate({
            //                        parent: object.transform
            //                    });
            return function (t) {
              object[prop] = [abc[0] + (xyz[0] - abc[0]) * t, abc[1] + (xyz[1] - abc[1]) * t, abc[2] + (xyz[2] - abc[2]) * t];
            };
          })(),
        );
      }
      return this;
    };

    this.change1 = function (ids, abc, xyz, prop = 'opacity') {
      for (let i = 0, len = ids.length; i < len; i++) {
        const id = ids[i];
        tasks.push(
          (function () {
            const object = scene.objects[id];
            return function (t) {
              object[prop] = abc + (xyz - abc) * t;
            };
          })(),
        );
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
      t = 1.0;
    };

    let cancelled;
    this.cancel = function (element) {
      t = 1;
      cancelled = true;
    };
    return this;
  }

  senceView(canvasId, propertiesPanelId, transparent = false) {
    const that = this;
    const scene = new xeogl.Scene({
      canvas: canvasId,
      transparent,
    });
    console.log('加载模型场景', scene);
    scene.passes = 2;
    scene.clearEachPass = false;
    scene.clearClips();
    scene.clearLights();
    /* scene.clear();
    scene.destroy(); */

    // xeogl.setDefaultScene(scene);
    this.xeogl = xeogl;

    // tslint:disable-next-line: no-unused-expression
    that.ambientLight = new xeogl.AmbientLight(scene, {
      color: [1.0, 1.0, 1.0],
    });
    // tslint:disable-next-line: no-unused-expression
    new xeogl.PointLight(scene, {
      pos: [-40, 30, 40],
      color: [1.0, 1.0, 1.0],
      space: 'view',
    });
    // tslint:disable-next-line: no-unused-expression
    new xeogl.PointLight(scene, {
      pos: [40, 20, 20],
      color: [1.0, 1.0, 1.0],
      space: 'view',
    });
    // tslint:disable-next-line: no-unused-expression
    new xeogl.PointLight(scene, {
      pos: [-20, 80, -80],
      color: [1.0, 1.0, 1.0],
      space: 'view',
    });

    const camera = scene.camera;
    camera.eye = [-4.98, 1.89, 0.72];
    camera.look = [0, 0.52, -0.05];
    camera.up = [0.26, 0.54, -0.05];
    camera.orbitYaw(200);

    // tslint:disable-next-line: no-unused-expression
    that.axisHelper = new xeo.AxisHelper({
      camera: scene.camera,
      size: [100, 100],
      visible: true,
    });

    scene.input.on('keyup', function (keyCode) {
      if (keyCode == 17) {
        // To workaround xeogl's ctrl key problem
        scene.input.ctrlDown = false;
      }
    });

    // TODO: scene environment settings
    // tslint:disable-next-line: no-unused-expression
    that.mesh = new xeogl.Mesh(scene, {
      geometry: new xeogl.PlaneGeometry(scene, {
        xSize: 20,
        zSize: 20,
      }),
      material: new xeogl.PhongMaterial(scene, {
        shininess: 170,
        specular: [0.1, 0.1, 0.3],
        diffuseMap: new xeogl.Texture(scene, {
          //   src: '../../../assets/js/scence-view/textures/diffuse/UVCheckerMap11-1024.png',
          src: 'assets/js/scence-view/textures/diffuse/UVCheckerMap11-1024.png',
          scale: [-5.0, 5.0],
        }),
        xalpha: 0.99,
        backfaces: false,
      }),
      position: [0, -1.1, 0],
      collidable: false,
      pickable: false,
    });

    this.scene = scene;
    const eventBus = new EventBus();

    this.eventBus = eventBus;
    this.on = eventBus.on;
    this.off = eventBus.off;
    this.once = eventBus.once;
    this.fire = eventBus.fire;

    this.setCamera = function (cam) {
      var cameraPath = new xeo.CameraPath(scene, {
        frames: [
          { t: 0, eye: camera.eye, look: camera.look, up: camera.up },
          { t: 1, eye: cam.eye, look: cam.look, up: cam.up },
        ],
      });
      var cameraPathAnimation = new xeo.CameraPathAnimation(scene, {
        cameraPath: cameraPath,
        playingRate: 0.5,
      });
      console.log(cameraPathAnimation);
      cameraPathAnimation.flyToFrame(1);
    };

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
          obj.children.forEach((c) => {
            dumpState(c, levels - 1, state);
          });
        }
      }
      return state;
    }

    function loadModel(name, url) {
      console.log('loadModel', this);
      if (url.endsWith('.gltf')) {
        var model = new xeo.GLTFModel(scene, {
          id: name,
          src: url,
        });
      } else if (url.endsWith('.obj')) {
        var model = new xeo.OBJModel(scene, {
          id: name,
          src: url,
        });
      } else {
        return;
      }

      model.on('loaded', function () {
        const toTreeNode = function (obj) {
          const node = { id: obj.id, type: obj.type, children: null };
          if (obj.children !== null) {
            node.children = obj.children.map((o) => {
              return toTreeNode(o);
            });
          }
          return node;
        };
        eventBus.fire('model.loaded', { model: toTreeNode(model) });
      });
      that.model = model;
      return model;
    }

    function clearScene() {
      console.log(scene);
      console.log(that.xeogl);
      console.log(that.model);
      console.log(that.mesh);
      that.axisHelper.setVisible(false);
      that.cameraControl.destroy();
      that.mesh.destroy();
      //  that.ambientLight.clear();
      that.model.clear();
    }

    that.loadModel = loadModel;
    that.clearScene = clearScene;
    const canvas = {
      root: {
        id: 'xeogl.Scene',
        name: 'Scene',
        get(name) {
          return this[name];
        },
      },
      getRootElement() {
        return this.root;
      },
    };

    if (propertiesPanelId !== undefined) {
      const commandStack = {
        execute(cmd, data) {
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

              Object.keys(data.properties).forEach((prop) => {
                if (['rotation', 'scale', 'colorize'].includes(prop)) {
                  data.element.object[prop] = new Float32Array(JSON.parse('[' + data.properties[prop] + ']'));
                } else {
                  // position, etc.
                  data.element.object[prop] = data.properties[prop];
                }
              });

              const state = dumpState(data.element.object, 0);
              console.log(state);
              eventBus.fire('node.updated', { state });
              eventBus.fire('camera.updated', {
                camera: {
                  eye: Array.from(camera.eye),
                  look: Array.from(camera.look),
                  up: Array.from(camera.up),
                },
              });
              // To disable entry.oldValues check in PropertiesPanel.applyChanges
              eventBus.fire('selection.changed', { newSelection: selectedHits });
              break;
          }
        },
      };
      const p = new PropertiesPanel(
        { parent: propertiesPanelId ? document.getElementById(propertiesPanelId) : '' },
        this.eventBus,
        {},
        new ScenePropertiesProvider(this.eventBus, canvas, {}, {}, function (text) {
          return text;
        }),
        commandStack,
        canvas,
      );

      this.eventBus.fire('root.added', { element: canvas.getRootElement() });
    }

    const cameraControl = new xeogl.CameraControl(scene);

    // TODO: support multiple concurrent operations
    const operates = [];
    let selectedHits = [];
    cameraControl.on('picked', function (hit) {
      if (scene.input.ctrlDown) {
        if (hit.object.selected) {
          hit.object.selected = false;
          selectedHits = selectedHits.filter((h) => h.object.id !== hit.object.id);
        } else {
          hit.object.selected = true;
          selectedHits.push(hit);
        }
      } else {
        selectedHits.forEach((h) => {
          h.object.selected = false;
        });
        hit.object.selected = true;
        selectedHits = [hit];
      }
      console.log('operates', operates, hit);
      that.operatesHit.next({ operates, hit }); // 模型点击传值
      operates.forEach((op, i, array) => {
        const name = op[hit.object.id];
        if (name) {
          op.callback(name);
          delete op.callback;
          Object.keys(op).forEach((id) => {
            scene.objects[id].highlighted = false;
          });
          array.splice(i, 1);
        }
      });

      hit.id = hit.object.type;
      hit.get = function (name) {
        return hit.object[name];
      };
      hit.selectParent = function () {
        cameraControl.fire('picked', { mesh: hit.object.parent, object: hit.object.parent });
      };

      // TODO: vscode Treeview will trigger selection.changed again
      eventBus.fire('selection.changed', { newSelection: selectedHits });
    });

    cameraControl.on('pickedNothing', function () {
      if (!scene.input.ctrlDown) {
        selectedHits.forEach((h) => {
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
      if (operates.length > 0) {
        return;
      }

      lastHoveredHit = hit;
      hit.mesh.highlighted = true;
    });
    cameraControl.on('hoverOut', function (hit) {
      if (operates.length > 0) {
        return;
      }

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
        // cameraControl.fire('hoverEnter', { mesh: scene.meshes[msg.id] }, true);
      }
    };

    this.selectMesh = function (ids) {
      selectedHits.forEach((h) => {
        h.object.selected = false;
      });
      selectedHits = ids.map((id) => {
        const obj = scene.objects[id];
        obj.selected = true;
        return {
          id: obj.type,
          object: obj,
          get(name) {
            return obj[name];
          },
        };
      });

      eventBus.fire('selection.changed', { newSelection: selectedHits });
    };

    this.setState = function (sceneState) {
      Object.keys(sceneState).forEach((id) => {
        const state = sceneState[id];
        const obj = scene.objects[id];
        if (obj === undefined) {
          console.log('xxx', id, state, scene);
        }
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
      const data = {
        models: [],
      };
      Object.keys(scene.models).forEach((id) => {
        const model = scene.models[id];
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
      // scene.clear();
      data.models.forEach((m) => {
        const model = loadModel(m.id, m.src);
        // const model = loadModel(m.id, url + '/' + m.src);
        model.position = new Float32Array(m.position);
        model.rotation = new Float32Array(m.rotation);
        model.scale = new Float32Array(m.scale);
        model.colorize = new Float32Array(m.colorize);
        model.opacity = m.opacity;
      });
    };

    this.getStates = function () {
      const state = {};
      Object.keys(scene.models).forEach((id) => {
        dumpState(scene.models[id], -1, state);
      });
      return state;
    };
    this.getStats = function () {
      var objects = 0;
      var vertices = 0;
      var triangles = 0;
      Object.values(scene.meshes).forEach((m: any) => {
        objects++;
        vertices += m.geometry.positions.length / 3;
        triangles += m.geometry.indices.length / 3;
      });
      return { objects, vertices, triangles };
    };
    let anim;
    this.playAnim = function (source, target, duration, opId, opArgs, anim_done) {
      // disable scene editing when animating, unless we are using a separate canvas to show it
      anim = that.Animation(scene, duration);
      Object.keys(source).forEach((id) => {
        const s = source[id];
        const t = target[id];
        if (!(s.position[0] == t.position[0] && s.position[1] == t.position[1] && s.position[2] == t.position[2])) {
          anim.translate2([id], s.position, t.position);
          console.log('anim position', id);
        }
        if (!(s.rotation[0] == t.rotation[0] && s.rotation[1] == t.rotation[1] && s.rotation[2] == t.rotation[2])) {
          anim.translate2([id], s.rotation, t.rotation, 'rotation');
          console.log('anim rotation', id);
        }
        if (!(s.scale[0] == t.scale[0] && s.scale[1] == t.scale[1] && s.scale[2] == t.scale[2])) {
          anim.translate2([id], s.scale, t.scale, 'scale');
          console.log('anim scale', id);
        }
        if (!(s.opacity == t.opacity)) {
          anim.change1([id], s.opacity, t.opacity, 'opacity');
          console.log('anim opacity', id);
        }
      });

      const ok = function () {
        if (opId) {
          if (opArgs) {
            const op = opArgs;
            // Highlight or add some hints to the operation
            Object.keys(op).forEach((id) => {
              scene.objects[id].highlighted = true;
            });

            op.callback = function (result) {
              console.log('callback: ', result);
              anim_done(result);
            };
            operates.push(op);
          } else {
            // notify animation is completed
            anim_done();
          }
        } else {
          // repeat playing otherwise
          setTimeout(function () {
            if (anim.dir != 0) {
              anim.play(ok);
            }
          }, 1000);
        }
      };
      anim.play(ok);
    };

    this.stopAnim = function (animId) {
      if (anim) {
        anim.cancel();
        anim = null;
      }
    };

    this.clear = function () {
      scene.clear();
    };

    this.clearModels = function () {
      Object.values(scene.models).forEach((m: any) => {
        m.destroy();
      });
    };
  }
}
