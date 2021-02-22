import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import $ from 'jquery';
import * as path from 'path';
import { ScenceViewService } from '../../services/scence-view.service';
@Component({
  selector: 'app-scence-view',
  templateUrl: './scence-view.component.html',
  styleUrls: ['./scence-view.component.less'],
  styles: [],
})
export class ScenceViewComponent implements OnInit {
  @Input() modelObject: any;
  scene: any;
  model: any;
  treeList: any[] = [];

  sceneView: any;
  isModelFullScreen = false;
  @Output() ModelFullScreenEmitter = new EventEmitter<boolean>();
  constructor(private scenceViewService: ScenceViewService, private httpClient: HttpClient) {}

  ngOnInit(): void {
    //  const sceneView = new SceneView('scene-canvas', 'scene-properties');
    //  console.log(sceneView);
    // this.initModel();
    //  this.scenceViewService.scenceView('scene-canvas', 'scene-properties');
  }
  ngAfterViewInit(): void {
    // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    // Add 'implements AfterViewInit' to the class.
    this.loadScence();
  }

  /**
   * 加载模型
   */
  loadScence() {
    const that = this;
    const nodes = [];
    this.scenceViewService.modelLibraryUrl.subscribe((model) => {
      if (model) {
        // that.sceneView = that.scenceViewService.senceView('scene-canvas');
        console.log('that.scenceViewService.scene', that.scenceViewService.scene);
        that.scenceViewService.loadModel('OBJ', model);
        that.treeList = [];
        that.scenceViewService.eventBus.on('model.loaded', function (event) {
          console.log(that.scenceViewService.scene);
          console.log(event);
          nodes.push(that.toTreeNode(event.model));
          that.treeList = nodes;
          console.log(that.treeList);
          that.scenceViewService.modelTreeList.next(that.treeList);
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

  /**
   * 模型展示全屏功能
   */
  modelFullScreen() {
    const scenceEl = document.querySelector('#scence') as any;
    if (this.isModelFullScreen === true) {
      scenceEl.previousElementSibling.style.width = '20%';
      scenceEl.nextElementSibling.style.width = '20%';
      scenceEl.previousElementSibling.style.display = 'inline-block';
      scenceEl.nextElementSibling.style.display = 'inline-block';
      $('#scence').removeAttr('style');
      this.isModelFullScreen = false;
    } else {
      this.isModelFullScreen = true;
      scenceEl.style.width = '98%';
      scenceEl.style.height = '98%';
      scenceEl.style.position = 'fixed';
      scenceEl.style.zIndex = '9999999';
      scenceEl.style.top = '1%';
      scenceEl.style.bottom = '1%';
      scenceEl.style.left = '1%';
      scenceEl.style.right = '1%';
    }
    this.ModelFullScreenEmitter.emit(this.isModelFullScreen);
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    console.log('组件销毁');
    this.treeList = [];
    this.scenceViewService.clear();
  }
}
