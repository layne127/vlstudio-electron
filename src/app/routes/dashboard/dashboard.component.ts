import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  HostListener,
  Input,
  NgZone,
  OnInit,
  SimpleChanges,
  ViewChild,
  ɵConsole,
} from '@angular/core';
import { FullContentService } from '@delon/abc/full-content';
import { OnboardingService } from '@delon/abc/onboarding';
import { _HttpClient } from '@delon/theme';
import PropertiesPanel from 'bpmn-js-properties-panel/lib/PropertiesPanel';
import { Console } from 'console';
import EventBus from 'diagram-js/lib/core/EventBus';
import $ from 'jquery';
import dayjs from 'dayjs';
import JsZip from 'jszip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { fromEvent, Observable } from 'rxjs';
import { debounce, debounceTime, filter } from 'rxjs/operators';
import { ProcessViewComponent } from 'src/app/biz/components/process-view/process-view.component';
import { ScenceViewComponent } from 'src/app/biz/components/scence-view/scence-view.component';
import { ProcessViewService } from 'src/app/biz/services/process-view.service';
import { ScenceViewService } from '../../biz/services/scence-view.service';
import { IpcService } from '../../services/ipc.service';

import VlsPlayer from '../../../assets/vlsplayer/vlsPlayer';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
})
export class DashboardComponent implements OnInit {
  vlsplayer: any;
  logger: any;
  // @Input() ModelFullScreenEmitter: any;
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
  @ViewChild('scenceView') scenceView: any;
  @ViewChild('scenePropertiesPanel') scenePropertiesPanel: any;
  @ViewChild('processPropertiesPanel') processPropertiesPanel: any;
  @ViewChild('processView') processView: ProcessViewComponent;

  vlsVirtualHeight = '100px';
  modelsVirtualHeight = '100px';

  isModelEnlargeRight = false;
  isModelEnlargeLeft = false;
  isProcessEnlargeRight = false;
  isProcessEnlargeLeft = false;
  modelSearchValue = '';
  isProcessFullScreen = false;
  player: any;
  modelUrlList: any[] = [];
  FileSaver = require('file-saver');
  zip: JsZip;
  isSpinning = false;
  tipTitle = '加载中';
  isPreview = false;
  constructor(
    private http: _HttpClient,
    private scenceViewService: ScenceViewService,
    private processViewService: ProcessViewService,
    private httpClient: HttpClient,
    private fullContentService: FullContentService,
    private onboardingService: OnboardingService,
    private zone: NgZone,
    private ipcService: IpcService,
    private messageService: NzMessageService,
  ) {
    this.zip = new JsZip();
    this.scenceViewService.operatesHit.subscribe((res) => {
      this.operatesHit = res;
      //  console.log(res);
    });
    this.scenceViewService.modelTreeList.subscribe((data) => {
      this.treeList = [];
      console.log('接收到模型库数据', data);
      this.vlsVirtualHeight = this.scenceLeft.nativeElement.clientHeight - 88 + 'px';
      this.modelsVirtualHeight = this.bottomLeft.nativeElement.clientHeight - 88 + 'px';
      this.treeList = this.treeList.concat(data);
      // Array.from(new Set(this.treeList));
      console.log(this.treeList);
    });
  }

  /**
   * 在 Angular 第一次显示数据绑定和设置指令/组件的输入属性之后，初始化指令/组件。
   */
  ngOnInit() {
    /* const c = document.getElementById('scene-canvas') as HTMLCanvasElement;
    const cxt = c.getContext('2d');
    cxt.clearRect(0, 0, c.width, c.height); */
    // this.studioView.nativeElement.style.height = document.querySelector('.full-screen').clientHeight - 32 + 'px';
    //  this.loadVls();
  }

  /**
   * 当 Angular 初始化完组件视图及其子视图或包含该指令的视图之后调用
   */
  ngAfterViewInit() {
    this.loadVls();
  }

  loadVls() {
    this.httpClient.get('assets/newDiagram.bpmn', { headers: { observe: 'response' }, responseType: 'text' }).subscribe((res: any) => {
      this.diagramXML = res;
      this.processViewService.processView('#process-canvas', '#process-properties-panel', this.diagramXML);
      this.sceneView = this.scenceViewService.senceView('scene-canvas', 'scene-properties-panel');
      this.scenceViewService.modelLibraryUrl.next('assets/models/sportsCar.obj');
      this.modelUrlList.push('/Users/layne127/projects/bsti/vls/vlstudio-electron/src/assets/models/');
      // this.scenceViewService.sendModelLibraryUrl('../../../../assets/male02/male02.obj');
      this.processViewService.eventBus.on('scene.get_state', (event) => {
        console.log(event);
        if (event) {
          this.processViewService.updateScene(event.id, this.scenceViewService.getState1());
        } else {
        }
      });
      this.processViewService.eventBus.on('camera.updated', function (event) {
        this.processViewService.updateCamera(event.id, event.camera);
      });
      this.scenceViewService.eventBus.on('node.updated', (event) => {
        this.processViewService.updateScene(event.id, event.state);
      });
      this.processViewService.eventBus.on('scene.set_state', (event) => {
        this.scenceViewService.setState(event.state);
      });
      this.processViewService.eventBus.on('animation.play', (event) => {
        // this.scenceViewService.setState(event.state);
        console.log('流程播放', event);
        this.scenceViewService.playAnim(event.source, event.target, event.duration, event.id, event.operate, (result) => {
          if (this.player) {
            this.player.process(result.id, result.operate);
          }
        });
      });
      this.processViewService.eventBus.on('process.play', (event) => {
        console.log('动画播放', event);
        this.player = this.processViewService.processPlayer(event.xml, this.processViewService.eventBus, this.processViewService.setColor);
      });

      this.processViewService.eventBus.on('scene.set_camera', (event) => {
        console.log('scene.set_camera', event);
        this.scenceViewService.setCamera(event.camera);
      });

      this.processViewService.eventBus.on('animation.stop', (event) => {
        this.scenceViewService.stopAnim(event.id);
      });
      this.studioView.nativeElement.style.height = document.querySelector('.full-screen').clientHeight - 32 + 'px';
      this.vlsVirtualHeight = this.scenceLeft.nativeElement.clientHeight - 88 + 'px';
      this.modelsVirtualHeight = this.bottomLeft.nativeElement.clientHeight - 88 + 'px';
    });

    /**
     * 设置模型树结构虚拟滚动高度
     * .pipe(debounceTime(300))
     */
    fromEvent(document.querySelector('#scence-left'), 'mouseup').subscribe((event) => {
      // 处理div大小变化时的操作
      this.vlsVirtualHeight = this.scenceLeft.nativeElement.clientHeight - 88 + 'px';
      this.modelsVirtualHeight = this.bottomLeft.nativeElement.clientHeight - 88 + 'px';
    });
    fromEvent(document.querySelector('#scence'), 'mouseup').subscribe((event) => {
      // 处理div大小变化时的操作
      this.vlsVirtualHeight = this.scenceLeft.nativeElement.clientHeight - 88 + 'px';
      this.modelsVirtualHeight = this.bottomLeft.nativeElement.clientHeight - 88 + 'px';
    });
  }

  /**
   * 选择模式包上传  zip格式
   */
  onClick() {
    this.ipcService.send('openDownLoadDialog', true);
    this.ipcService.on('uploadModelProcess', (event, arg: any) => {
      console.log(arg);
      if (arg.code === 0) {
        this.isSpinning = true;
        this.tipTitle = '上传模型中';
      } else if (arg.code === 1) {
        this.isSpinning = false;
        this.messageService.success(arg.msg);
      } else if (arg.code === -1) {
        this.isSpinning = false;
        this.messageService.warning(arg.msg);
      }
    });
  }
  /**
   * 选择obj模型   选择模型文件夹还是模型文件
   */
  beforeUpload = (file: NzUploadFile): boolean => {
    this.uploadFile = file;
    console.log(this.uploadFile.path);
    // this.scenceViewService.modelLibraryUrl.next('../../../../assets/sportsCar.obj');

    this.ipcService.send('uploadFile', this.uploadFile.path.toString());
    // 前端监听后台Node进程发过来的消息：
    this.ipcService.on('uploadFileSuccess', (event, arg: any) => {
      console.log(arg);
    });
    this.scenceViewService.modelLibraryUrl.next(this.uploadFile.path.toString());
    // this.scenceViewService.modelLibraryUrl.next('assets/male02/male02.obj');
    this.modelUrlList.push('/Users/layne127/projects/bsti/vls/vlstudio-electron/src/assets/male02/');
    return false;
  };

  /**
   * 选择vls模型
   */
  beforeUploadForVls = (file: NzUploadFile): boolean => {
    this.uploadFile = file;
    //
    this.httpClient.get('../../../../assets/sample.vls').subscribe((res: any) => {
      console.log(res);
      // this.scenceViewService.sendVLSModelLibraryUrl(res.process.xml);
      // this.scenceViewService.sendModelTreeList(res.scene.models);
      this.processViewService.load(res.progress);
      //  this.scenceViewService.load(res.scene);
    });
    return false;
  };

  /**
   * 模型对象
   */
  nzEvent(evt) {
    this.modelObject = evt;
    // console.log(this.scenceViewService.scene.clear());
  }

  /**
   * 保存
   * @param event
   */
  saveVlS(event) {
    this.processViewService.bpmnModeler.saveXML().then((result) => {
      let vlsData = { name: '', path: '', scene: null, process: null };
      let fileName = dayjs(
        dayjs().get('year') +
          '-' +
          (dayjs().get('month') + 1) +
          '-' +
          dayjs().get('date') +
          '-' +
          dayjs().get('hour') +
          '-' +
          dayjs().get('minute'),
      ).format('YYYY-MM-DD HH:mm');
      let filePath = fileName + '.vls';
      vlsData.name = fileName;
      vlsData.path = filePath;
      vlsData.scene = this.scenceViewService.save();
      vlsData.process = result.xml;
      console.log(vlsData);
      // 传递主进程下载消息
      this.ipcService.send('downloadFile', { modelUrlList: this.modelUrlList, vlsData: JSON.stringify(vlsData), vlsName: filePath });

      // 接收压缩打包状态
      this.ipcService.on('downloadProcess', (event, arg: any) => {
        if (arg.code === 1) {
          this.isSpinning = false;
        } else {
          this.isSpinning = true;
          this.tipTitle = '打包中...';
        }
      });
    });

    // console.log(this.processViewService.save(this.processViewService.bpmnModeler.));
  }

  /**
   * 全屏操作
   */
  fullScreen() {
    if (this.isFullScreen === false) {
      this.isFullScreen = true;
      this.processView.zoomOut();
      this.processView.rollBack();
      this.fullSreenText = '退出全屏';
    } else {
      this.isFullScreen = false;
      this.processView.zoomOut();
      this.processView.rollBack();
      this.fullSreenText = '全屏';
    }
  }

  /**
   * xeogl模型展示左右收缩按钮功能
   * @param direction
   */
  modelEnlarge(direction) {
    if (direction === 'left') {
      if (this.isModelEnlargeLeft === true) {
        this.scenceLeft.nativeElement.style.width = '20%';
        this.scenceLeft.nativeElement.style.display = 'inline-block';
        (document.querySelector('#scence') as any).style.width = '60%';
        this.scenePropertiesPanel.nativeElement.style.width = '20%';
        this.isModelEnlargeLeft = false;
      } else {
        this.scenceLeft.nativeElement.style.display = 'none';
        let rightWidth2 = '';
        if (this.scenePropertiesPanel.nativeElement.scrollHeight > this.scenePropertiesPanel.nativeElement.clientHeight) {
          // is scroll
          rightWidth2 = Number(
            ((this.scenePropertiesPanel.nativeElement.clientWidth + 10) * 100.0) / this.scenceLeft.nativeElement.parentNode.clientWidth,
          ).toFixed(0);
        } else {
          // no scroll
          rightWidth2 = Number(
            (this.scenePropertiesPanel.nativeElement.clientWidth * 100.0) / this.scenceLeft.nativeElement.parentNode.clientWidth,
          ).toFixed(0);
        }
        const rightWidth = (100 - Number(rightWidth2)).toFixed(0);
        (document.querySelector('#scence') as any).style.width = rightWidth + '%';
        this.isModelEnlargeLeft = true;
      }
    } else if (direction === 'right') {
      if (this.isModelEnlargeRight === true) {
        this.scenePropertiesPanel.nativeElement.style.width = '20%';
        this.scenePropertiesPanel.nativeElement.style.display = 'inline-block';
        (document.querySelector('#scence') as any).style.width = '60%';
        this.scenceLeft.nativeElement.style.width = '20%';
        this.isModelEnlargeRight = false;
      } else {
        this.scenePropertiesPanel.nativeElement.style.display = 'none';
        const leftWidth = Number(
          (this.scenceLeft.nativeElement.clientWidth * 100.0) / this.scenceLeft.nativeElement.parentNode.clientWidth,
        ).toFixed(0);
        (document.querySelector('#scence') as any).style.width = 100 - Number(leftWidth) + '%';
        this.isModelEnlargeRight = true;
      }
    }
  }

  /**
   * bpmn流程图左右收缩按钮功能
   * @param direction
   */
  processEnlarge(direction) {
    if (direction === 'left') {
      if (this.isProcessEnlargeLeft === true) {
        this.bottomLeft.nativeElement.style.width = '20%';
        this.bottomLeft.nativeElement.style.display = 'inline-block';
        (document.querySelector('#process') as any).style.width = '60%';
        this.processPropertiesPanel.nativeElement.style.width = '20%';
        this.isProcessEnlargeLeft = false;
      } else {
        this.bottomLeft.nativeElement.style.display = 'none';
        let rightWidth2 = '';
        if (this.processPropertiesPanel.nativeElement.scrollHeight > this.processPropertiesPanel.nativeElement.clientHeight) {
          // is scroll
          rightWidth2 = Number(
            ((this.processPropertiesPanel.nativeElement.clientWidth + 10) * 100.0) / this.bottomLeft.nativeElement.parentNode.clientWidth,
          ).toFixed(0);
        } else {
          // no scroll
          rightWidth2 = Number(
            (this.processPropertiesPanel.nativeElement.clientWidth * 100.0) / this.bottomLeft.nativeElement.parentNode.clientWidth,
          ).toFixed(0);
        }
        const rightWidth = (100 - Number(rightWidth2)).toFixed(0);
        (document.querySelector('#process') as any).style.width = rightWidth + '%';
        this.isProcessEnlargeLeft = true;
      }
    } else if (direction === 'right') {
      if (this.isProcessEnlargeRight === true) {
        this.processPropertiesPanel.nativeElement.style.width = '20%';
        this.processPropertiesPanel.nativeElement.style.display = 'inline-block';
        (document.querySelector('#process') as any).style.width = '60%';
        this.bottomLeft.nativeElement.style.width = '20%';
        this.isProcessEnlargeRight = false;
      } else {
        this.processPropertiesPanel.nativeElement.style.display = 'none';
        const leftWidth = Number(
          (this.bottomLeft.nativeElement.clientWidth * 100.0) / this.bottomLeft.nativeElement.parentNode.clientWidth,
        ).toFixed(0);
        (document.querySelector('#process') as any).style.width = 100 - Number(leftWidth) + '%';
        this.isProcessEnlargeRight = true;
      }
    }
  }

  /**
   * 子组件 全屏事件传值动态设置左右工具栏按钮显示
   * @param e
   */
  ModelFullScreenEmitter(e) {
    if (e === true) {
      this.isModelEnlargeLeft = true;
      this.isModelEnlargeRight = true;
    } else {
      this.isModelEnlargeLeft = false;
      this.isModelEnlargeRight = false;
    }
  }

  /**
   * 子组件 全屏事件传值动态设置左右工具栏按钮显示
   * @param e
   */
  ProcessFullScreenEmitter(e) {
    if (e === true) {
      this.isProcessEnlargeLeft = true;
      this.isProcessEnlargeRight = true;
    } else {
      this.isProcessEnlargeLeft = false;
      this.isProcessEnlargeRight = false;
    }
  }

  clear() {
    this.scenceViewService.clearScene();
  }

  /**
   * 引导
   */
  onBoard() {
    this.onboardingService.start({
      items: [
        { selectors: '.tools-btn', content: '操作功能区' },
        { selectors: '#scence-left', content: '模型层级管理' },
        { selectors: '#scence', content: '动画关键字编辑' },
        { selectors: '#scene-properties-panel', content: '模型属性管理' },
        { selectors: '#bottom-left', content: '模型文件导入' },
        { selectors: '#process', content: '维修步骤编辑' },
        { selectors: '#process-properties-panel', content: '交互规则设置' },
      ],
    });
  }

  /**
   * 撤销
   */
  revoke() {}

  /**
   * 重做
   */
  reform() {}

  /**
   * 预览
   */
  preview() {
    this.isPreview = true;
    this.vlsplayer = new VlsPlayer();
    setTimeout(() => {
      this.vlsplayer.Init('vls-canvas');
      this.vlsplayer.Loaded('assets/sportsCar-exclusive-gateway-camera.vls');
    }, 500);
  }
  handleCancel() {
    this.vlsplayer.clear();
    this.isPreview = false;
  }
  handleOk() {}
  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    this.treeList = [];
    this.scenceViewService.clearScene();
  }
}
