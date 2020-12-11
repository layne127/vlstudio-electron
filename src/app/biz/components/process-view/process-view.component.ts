import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import ProcessPlayer from '../../../../assets/js/process-view/ProcessPlayer';
import ProcessView from '../../../../assets/js/process-view/ProcessView';
import { ProcessViewService } from '../../services/process-view.service';
import { ScenceViewService } from '../../services/scence-view.service';
// import diagramXML from '../../../../assets/newDiagram';
@Component({
  selector: 'app-process-view',
  templateUrl: './process-view.component.html',
  styleUrls: [
    '../../../../assets/js/process-view/vendor/diagram-js.css',
    '../../../../assets/js/process-view/css/app.css',
    '../../../../assets/js/process-view/css/diagram-js.css',
    '../../../../assets/js/process-view/vendor/bpmn-font/css/bpmn-embedded.css',
    '../../../../assets/js/process-view/css/diagram-js-minimap.css',
    './process-view.component.less',
  ],
  styles: [],
})
export class ProcessViewComponent implements OnInit {
  diagramXML: any;
  processView: any;
  zoomNum = 1;
  processCanvas: any;
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
    console.log(this.processCanvas);
    console.log(this.zoomNum);
    if (this.zoomNum > 0) {
      this.processCanvas.zoom(this.zoomNum);
    } else {
      this.zoomNum = 0.1;
      this.processCanvas.zoom(0.1);
    }
  }
}
