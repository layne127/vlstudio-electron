import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { _HttpClient } from '@delon/theme';
import PropertiesPanel from 'bpmn-js-properties-panel/lib/PropertiesPanel';
import EventBus from 'diagram-js/lib/core/EventBus';
import $ from 'jquery';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { debounce, debounceTime, filter } from 'rxjs/operators';
import { ProcessViewService } from 'src/app/biz/services/process-view.service';
import { ScenceViewService } from '../../biz/services/scence-view.service';
/* require('../../../../node_modules/xeogl/examples/js/animation/cameraPath')(xeogl);
require('../../../../node_modules/xeogl/examples/js/animation/cameraFollowAnimation')(xeogl); */
/* require('../../../assets/scene-view/js/models/OBJModel')(xeogl);
require('../../../../node_modules/xeogl/examples/js/geometry/vectorTextGeometry')(xeogl);
require('../../../../node_modules/xeogl/examples/js/helpers/axisHelper')(xeogl); */

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
})
export class DashboardComponent implements OnInit {
  treeList: any[] = [];
  vlsTreeList: any[] = [];
  uploadFile: NzUploadFile;
  modelObject: any;
  operatesHit: any;
  sceneView: any;
  diagramXML: any;
  isFullScreen = false;
  fullSreenText = '全屏';
  @ViewChild('studioView') studioView: any;
  @ViewChild('scenceLeft') scenceLeft: any;
  @ViewChild('bottomLeft') bottomLeft: any;
  vlsVirtualHeight = '100px';
  modelsVirtualHeight = '100px';
  constructor(
    private http: _HttpClient,
    private scenceViewService: ScenceViewService,
    private processViewService: ProcessViewService,
    private httpClient: HttpClient,
  ) {
    this.scenceViewService.operatesHit.subscribe((res) => {
      this.operatesHit = res;
      //  console.log(res);
    });
    this.scenceViewService.getModelTreeList().subscribe((data) => {
      console.log('接收到模型库数据', data);
      this.treeList = data;
    });
  }

  /**
   * 在 Angular 第一次显示数据绑定和设置指令/组件的输入属性之后，初始化指令/组件。
   */
  ngOnInit() {
    /* const c = document.getElementById('scene-canvas') as HTMLCanvasElement;
    const cxt = c.getContext('2d');
    cxt.clearRect(0, 0, c.width, c.height); */
  }

  /**
   * 当 Angular 初始化完组件视图及其子视图或包含该指令的视图之后调用
   */
  ngAfterViewInit() {
    this.httpClient
      .get('../../../../assets/newDiagram.bpmn', { headers: { observe: 'response' }, responseType: 'text' })
      .subscribe((res: any) => {
        this.diagramXML = res;
        this.processViewService.processView('#process-canvas', '#process-properties-panel', this.diagramXML);
        this.sceneView = this.scenceViewService.senceView('scene-canvas', 'scene-properties-panel');

        this.processViewService.eventBus.on('scene.get_state', (event) => {
          console.log(event);
          console.log(this.scenceViewService.getState1());
          this.processViewService.updateScene(event.id, this.scenceViewService.getState1());
        });
        this.scenceViewService.eventBus.on('node.updated', (event) => {
          console.log(event);
          this.processViewService.updateScene(event.id, event.state);
        });
        this.processViewService.eventBus.on('scene.set_state', (event) => {
          this.scenceViewService.setState(event.state);
        });
        this.processViewService.eventBus.on('animation.play', (event) => {
          // this.scenceViewService.setState(event.state);

          this.scenceViewService.playAnim(event.source, event.target, event.duration, event.id, event.operate, (result) => {
            /*  if (player) {
               player?.process(result.id, result.operate);
             } */
          });
        });

        this.processViewService.eventBus.on('animation.stop', (event) => {
          this.scenceViewService.stopAnim(event.id);
        });
        this.vlsVirtualHeight = this.scenceLeft.nativeElement.clientHeight - 50 + 'px';
        this.modelsVirtualHeight = this.bottomLeft.nativeElement.clientHeight - 50 + 'px';
      });

    /**
     * 设置模型树结构虚拟滚动高度
     * .pipe(debounceTime(300))
     */
    fromEvent(document.querySelector('#scence-left'), 'mouseup').subscribe((event) => {
      // 这里处理div大小变化时的操作
      console.log('come on ..', this.scenceLeft.nativeElement.clientHeight);
      this.vlsVirtualHeight = this.scenceLeft.nativeElement.clientHeight - 50 + 'px';
      this.modelsVirtualHeight = this.bottomLeft.nativeElement.clientHeight - 50 + 'px';
    });
  }

  /**
   * 选择obj模型
   */
  beforeUpload = (file: NzUploadFile): boolean => {
    this.uploadFile = file;
    console.log(this.uploadFile);
    this.scenceViewService.sendModelLibraryUrl('../../../../assets/sportsCar.obj');
    return false;
  };

  /**
   * 选择vls模型
   */
  beforeUploadForVls = (file: NzUploadFile): boolean => {
    this.uploadFile = file;
    console.log(this.uploadFile);
    //
    this.httpClient.get('../../../../assets/sample.vls').subscribe((res: any) => {
      console.log(res);
      // this.scenceViewService.sendVLSModelLibraryUrl(res.process.xml);
      // this.scenceViewService.sendModelTreeList(res.scene.models);
      this.processViewService.load(res.progress);
      this.scenceViewService.load(res.scene);
    });
    return false;
  };

  /**
   * 模型对象
   */
  nzEvent(evt) {
    this.modelObject = evt;
    console.log(evt);
  }

  saveVlS(event) {
    console.log(this.scenceViewService.save());
  }

  fullScreen() {
    if (this.isFullScreen === false) {
      this.isFullScreen = true;
      this.fullSreenText = '退出全屏';
      // this.studioView.nativeElement.style.height = '98%';
    } else {
      this.isFullScreen = false;
      this.fullSreenText = '全屏';
      // this.studioView.nativeElement.style.height = '700px';
    }
  }

  @HostListener('resize', ['$event'])
  onResize(event) {
    console.log(event);
  }
}
