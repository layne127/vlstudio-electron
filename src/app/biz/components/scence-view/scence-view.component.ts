import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import PropertiesPanel from 'bpmn-js-properties-panel/lib/PropertiesPanel';
import EventBus from 'diagram-js/lib/core/EventBus';
import * as fs from 'fs';
import $ from 'jquery';
import * as path from 'path';
import * as xeogl from 'xeogl';
import { ScenceViewService } from '../../services/scence-view.service';
const OBJModel: any = require('../../../../assets/js/scence-view/js/models/OBJModel');
const vectorTextGeometry: any = require('../../../../assets/js/scence-view/js/geometry/vectorTextGeometry');
const axisHelper: any = require('../../../../assets/js/scence-view/js/helpers/axisHelper');
// const SceneView: any = require('../../../../assets/js/scence-view/SceneView');
// import SceneView from '../../../../assets/js/scence-view/SceneView';
// const SceneView = require('../../../../assets/js/scence-view/SceneView');
import SceneView from '../../../../assets/js/scence-view/SceneView';
@Component({
  selector: 'app-scence-view',
  templateUrl: './scence-view.component.html',
  styleUrls: ['./scence-view.component.less'],
  styles: [],
})
export class ScenceViewComponent implements OnInit {
  @Input() modelObject: any;
  xeo = xeogl;
  scene: any;
  model: any;
  treeList: any[] = [];

  sceneView: any;
  constructor(private scenceViewService: ScenceViewService, private httpClient: HttpClient) {
    OBJModel(this.xeo);
    vectorTextGeometry(this.xeo);
    axisHelper(this.xeo);
  }

  ngOnInit(): void {
    //  const sceneView = new SceneView('scene-canvas', 'scene-properties');
    //  console.log(sceneView);
    // this.initModel();
    //  this.scenceViewService.scenceView('scene-canvas', 'scene-properties');
    const that = this;
    const nodes = [];
    this.scenceViewService.getModelLibraryUrl().subscribe((model) => {
      if (model) {
        // that.sceneView = that.scenceViewService.senceView('scene-canvas');
        that.scenceViewService.loadModel('OBJ', model);
        console.log(that.scenceViewService.eventBus);
        that.scenceViewService.eventBus.on('model.loaded', function (event) {
          console.log(that.sceneView);
          console.log(event);
          nodes.push(that.toTreeNode(event.model));
          that.treeList = nodes;
          console.log(that.treeList);
          that.scenceViewService.sendModelTreeList(that.treeList);
        });
        // this.loadModel('', model);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    // Add '${implements OnChanges}' to the class.
    if (this.modelObject !== undefined) {
      console.log(this.modelObject);
      this.scenceViewService.selectMesh(this.modelObject.keys);
    }
  }

  /**
   * 转树形结构
   */
  toTreeNode(obj) {
    const that = this;
    const treeList = [];
    let node: any;
    node = {
      id: obj.id,
      type: obj.type,
      title: obj.id,
      key: obj.id,
    };
    if (obj.children !== null && obj.children.length > 0) {
      node.children = obj.children.map((o) => {
        return that.toTreeNode(o);
      });
    } else {
      node.isLeaf = true;
    }
    return node;
  }
}
