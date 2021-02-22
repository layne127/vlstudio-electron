import ScenePlayer from './ScenePlayer';
import ProcessPlayer from './ProcessPlayer';
import $ from 'jquery';
export default function () {
    let scenePlayer;
    let processXML;
    let processPlayer;
    let evtData = {id: '', result: ''};
    let isPause = false;
    let vlsURL;
    /**
     * 初始化场景
     */
    this.Init = function (id) {
        scenePlayer = new ScenePlayer(id);
    },

    /**
     * 加载资源
     */
    this.Loaded = function(url) {
        vlsURL = url;
        $.ajax({url: url,success:function(res){
          let index = url.lastIndexOf("/");
          let modelurl =url.substring(0,index);
          scenePlayer.load(JSON.parse(res).scene, modelurl);
          processXML = JSON.parse(res).process;
        }});
        /* axios.get('assets/sportsCar-exclusive-gateway.vls').then((res) => {
            console.log(res);
         
        }) */
    },

    /**
     * 运行动画
     */
    
    this.Running = function (duration = 1) {
      console.log('播放');  
      scenePlayer.eventBus.on('animation.play', (event) => {

          console.log('animation.play', event);
          scenePlayer.playAnim(event.source, event.target, event.duration ? event.duration : duration, event.id, event.operate, (result) => {
           if (isPause === true) {
             evtData = { id: event.id, result: result }
           } else {
             processPlayer.process(event.id, result);
           }
          });
    
        })
        scenePlayer.eventBus.on('scene.set_camera', function (event) {
          scenePlayer.setCamera(event.camera);
        });
        scenePlayer.eventBus.on('animation.stop', (event) => {
          console.log('stop', event);
          scenePlayer.stopAnim(event.id);
        })
        processPlayer = new ProcessPlayer(processXML, scenePlayer.eventBus);
        processPlayer.execute(() => {
          console.log('ssss');
          scenePlayer.reset();
        })
    },

    /**
     * 暂停动画
     */
    this.Pause = function (pauseState) {
      console.log('evtData', evtData);
        if (pauseState === false) {
            isPause = false;
            processPlayer.process(evtData.id, evtData.result);
        } else {
            isPause = true;
        }
    },
    
    /**
     * 完成播放  结束
     */
    this.Finished = function() {
        scenePlayer.reset();
       // scenePlayer.stopAnim();
        processPlayer.engine.stop();
        scenePlayer.clearModels();
        this.Loaded(vlsURL);
        scenePlayer.eventBus.on('scene.set_camera', function (event) {
          scenePlayer.setCamera(event.camera);
        });
    }

    this.jump = function (jumpData) {
      processPlayer.process(jumpData.id, jumpData.result);
    }

    /**
     * 清除全部
     */
    this.clear = function () {
      scenePlayer.clear();
    }

    /**
     * 清除模型
     */
    this.clearModels = function () {
      scenePlayer.clearModels();
    }
}