import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import VlsPlayer from '../../../assets/vlsplayer/vlsPlayer';
@Component({
  selector: 'app-vlsplayer',
  templateUrl: './vlsplayer.component.html',
  styleUrls: ['./vlsplayer.component.less'],
  styles: [],
})
export class VlsplayerComponent implements OnInit {
  vlsplayer: any;
  constructor() {}

  ngOnInit(): void {}
  ngAfterViewInit(): void {
    this.vlsplayer = new VlsPlayer();
    this.vlsplayer.Init('vls-canvas'); // 初始化场景
    this.vlsplayer.Loaded('assets/sportsCar-exclusive-gateway-camera.vls'); // 加载资源
    // this.vlsplayer.Loaded('assets/2021-21-01_13_00.vls');
  }

  /**
   * 播放
   * duration: 播放速度  0.5  1.5
   *   < 1 速度 +
   *   > 1 速度 -
   */
  play() {
    this.vlsplayer.Running();
  }

  /**
   * 暂停
   *  param: true =>  暂停
   *  param: false =>  继续
   */
  Pause(iszt) {
    this.vlsplayer.Pause(iszt);
  }

  // 结束
  Finished() {
    this.vlsplayer.Finished();
  }

  clear() {
    this.vlsplayer.clearModels();
  }

  jump() {
    this.vlsplayer.jump({
      id: 'Activity_0sn9ctl_8622a9d',
      result: '',
    });
  }
}
