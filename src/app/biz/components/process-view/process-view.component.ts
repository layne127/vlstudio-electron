import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import $ from 'jquery';
import { ProcessViewService } from '../../services/process-view.service';
import { ScenceViewService } from '../../services/scence-view.service';
@Component({
  selector: 'app-process-view',
  templateUrl: './process-view.component.html',
  styleUrls: ['./process-view.component.less'],
  styles: [],
})
export class ProcessViewComponent implements OnInit {
  diagramXML: any;
  processView: any;
  zoomNum = 1;
  processCanvas: any;
  isProcessFullScreen = false;
  taskList: any;
  taskindex = 0;
  @Output() ProcessFullScreenEmitter = new EventEmitter<boolean>();
  constructor(
    private httpClient: HttpClient,
    private scenceViewService: ScenceViewService,
    private processViewService: ProcessViewService,
  ) {}

  ngOnInit(): void {
    this.scenceViewService.getVLSModelLibraryUrl().subscribe((diagramXML) => {
      if (diagramXML) {
        // console.log(model);
        if (this.processView) {
          // this.processView = new ProcessView('#process-canvas', '#process-properties-panel', diagramXML);
        } else {
          this.processViewService.processView('#process-canvas', '#process-properties-panel', this.diagramXML);
          console.log('processView', this.processView);
        }
      } else {
        this.processViewService.processView('#process-canvas', '#process-properties-panel', this.diagramXML);
        console.log('processView', this.processView);
      }
    });
  }

  ngAfterViewInit(): void {
    // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    // Add 'implements AfterViewInit' to the class.
    setTimeout(() => {
      const a = document.createEvent('MouseEvents');
      a.initEvent('click', true, true);
      document.querySelector('#process-canvas').dispatchEvent(a);
      this.zoomOut();
      this.rollBack();
    }, 500);
  }

  /**
   * 放大  0.1
   */
  zoomIn() {
    this.processCanvas = this.processViewService.bpmnModeler.get('canvas');
    this.zoomNum = Number((this.zoomNum + 0.1).toFixed(1));
    if (this.zoomNum > 0) {
      this.processCanvas.zoom(this.zoomNum);
    }
  }

  /**
   * 缩小 0.1
   */
  zoomOut() {
    this.processCanvas = this.processViewService.bpmnModeler.get('canvas');
    this.zoomNum = Number((this.zoomNum - 0.1).toFixed(1));
    if (this.zoomNum > 0) {
      this.processCanvas.zoom(this.zoomNum);
    } else {
      this.zoomNum = 0.1;
      this.processCanvas.zoom(0.1);
    }
  }

  /**
   * 缩放可视大小
   */
  rollBack() {
    const canvas = this.processViewService.bpmnModeler.get('canvas');
    const contentNode = canvas.getDefaultLayer();
    const bbox = contentNode.getBBox();

    const elementMid = {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2,
    };
    const currentViewbox = canvas.viewbox();
    canvas.viewbox({
      x: elementMid.x - currentViewbox.width / 2,
      y: elementMid.y - currentViewbox.height / 2,
      width: currentViewbox.width,
      height: currentViewbox.height,
    });

    const innerWidth = bbox.width;
    const innerHeight = bbox.height;
    /* if (document.querySelector('#process-canvas').clientWidth > innerWidth && document.querySelector('#process-canvas').clientHeight > innerHeight) {

    } */
    // if (this.IsZoom) {
    const processCanvasWidth = document.querySelector('#process-canvas').clientWidth - 40;
    const processCanvasHeight = document.querySelector('#process-canvas').clientHeight - 40;

    const Zoomwidth = Number((processCanvasWidth / innerWidth).toFixed(1));
    const Zoomheight = Number((processCanvasHeight / innerHeight).toFixed(1));
    if (Zoomwidth > Zoomheight) {
      canvas.zoom(Zoomheight);
      this.zoomNum = Zoomheight;
    } else {
      canvas.zoom(Zoomwidth);
      this.zoomNum = Zoomwidth;
    }
    //  }
  }

  /**
   * 流程上一步
   */
  stepBackward() {
    this.taskList = this.processViewService.elementRegistryList.children.filter(
      (item) => item.type === 'bpmn:UserTask' || item.type === 'bpmn:ExclusiveGateway',
    );
    console.log(this.taskList);
    console.log(this.processViewService.selectionTask);
    console.log(this.taskList.indexOf(this.processViewService.selectionTask));
  }

  /**
   * 流程下一步
   */
  stepForward() {
    // this.Focus('Activity_0sn9ctl');
  }

  // 聚焦，放大元素
  Focus(Id) {
    const bbox = this.processViewService.bpmnModeler.get('elementRegistry').get(Id);
    const canvas = this.processViewService.bpmnModeler.get('canvas');
    canvas.zoom(1.5);
    const currentViewbox = canvas.viewbox();
    const elementMid = {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2,
    };
    canvas.viewbox({
      x: elementMid.x - currentViewbox.width / 2,
      y: elementMid.y - currentViewbox.height / 2,
      width: currentViewbox.width,
      height: currentViewbox.height,
    });
  }
  /**
   * BPMN流程图全屏展示功能
   */
  processFullScreen() {
    const processEl = document.querySelector('#process') as any;
    if (this.isProcessFullScreen === true) {
      $('#process').removeAttr('style');
      processEl.previousElementSibling.style.width = '20%';
      processEl.nextElementSibling.style.width = '20%';
      processEl.previousElementSibling.style.display = 'inline-block';
      processEl.nextElementSibling.style.display = 'inline-block';
      this.isProcessFullScreen = false;
    } else {
      this.isProcessFullScreen = true;
      processEl.style.width = '98%';
      processEl.style.height = '98%';
      processEl.style.position = 'fixed';
      processEl.style.zIndex = '9999999';
      processEl.style.top = '1%';
      processEl.style.bottom = '1%';
      processEl.style.left = '1%';
      processEl.style.right = '1%';
    }
    this.ProcessFullScreenEmitter.emit(this.isProcessFullScreen);
    this.zoomOut();
    this.rollBack();
  }
}
