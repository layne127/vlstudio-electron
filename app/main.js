// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, remote, dialog, Notification } = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const logger = require('electron-log');
const JSZip = require('jszip');
const dayjs = require('dayjs');
const AdmZip = require('adm-zip');
const underscore = require('underscore');
// 日志设置
// logger.transports.file.level = 'info';
// logger.transports.file.file = './logs/electron-test.log';  // 设置日志存储位置
/* logger.transports.file.level = false;
logger.transports.console.level = false; */
logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}';
logger.transports.file.maxSize = 1048576;
logger.error('error!');
logger.info('info!');
logger.warn('warn!');
logger.verbose('verbose!');
logger.debug('debug!');
logger.silly('silly!');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    /* width: 1000,
    height: 800, */
    show: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: false,
      preload: './preload.js',
    },
  });
  mainWindow.maximize();
  mainWindow.show();
  logger.info('electron test app start at ', new Date());
  logger.info(app.getAppPath());
  logger.info(app.getName());
  logger.info(app.getPath('exe'));
  // and load the index.html of the app.
  // mainWindow.loadFile('app/dist/index.html')
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html`),
      protocol: 'file:',
      slashes: true,
    }),
  );
  // mainWindow.loadURL(`file://${__dirname}/dist/index.html#/dashboard`);
  // mainWindow.webContents.openDevTools();
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  ipcMain.on('uploadFile', (event, arg) => {
    // const { payload } = arg;
    logger.info('接收上传消息', arg);
    const str = fs.readFileSync(arg);
    //  logger.info(str.toString());
    let filePath = path.dirname(arg);
    logger.info('filePath', filePath);
    dialog
      .showOpenDialog(mainWindow, {
        title: '选择保存位置',
        properties: ['openFile', 'openDirectory'],
      })
      .then((res) => {
        if (res.canceled) return;
        //写入文件到系统
        fs.writeFileSync(res.filePaths + '/1111111.obj', str, 'utf-8');
      });
    //  mainWindow.webContents.downloadURL(arg);
    // 后台Node进程通知前端上传成功
  });

  var zip = new JSZip();

  /**
   * 接收到下载信息
   */
  ipcMain.on('downloadFile', (event, arg) => {
    const evt = event;
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
    let filePath = '/vlstudio' + fileName + '.zip';
    evt.sender.send('downloadProcess', { msg: '打包中', code: 0 });
    zip.file(arg.vlsName, arg.vlsData);
    arg.modelUrlList.forEach((list) => {
      readDir(zip, list, '');
    });
    // 开始异步压缩文件及文件夹
    zip
      .generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9,
        },
      })
      .then((content) => {
        // 压缩打包完成 弹出保存位置窗口
        evt.sender.send('downloadProcess', { msg: '打包完成', code: 1 });
        dialog
          .showOpenDialog(mainWindow, {
            title: '选择保存位置',
            properties: ['openDirectory'],
          })
          .then((res) => {
            if (res.canceled) return;
            //写入文件到系统
            fs.writeFileSync(res.filePaths + filePath, content, 'utf-8');
          });
      });
  });

  /**
   * 选择指定模型 上传
   */
  ipcMain.on('openDownLoadDialog', (event, arg) => {
    dialog
      .showOpenDialog(mainWindow, {
        title: '选择保存位置',
        properties: ['openFile'],
        filters: [
          { name: 'Zips', extensions: ['zip'] },
          /* { name: 'All Files', extensions: ['*'] } */
        ],
      })
      .then((res) => {
        logger.info(res);
        if (res.canceled) return;
        event.sender.send('uploadModelProcess', { msg: '开始上传', code: 0 });
        const zipFile = fs.readFileSync(res.filePaths.toString());
        const files = new AdmZip(res.filePaths.toString());
        //  mainWindow.webContents.downloadURL(res.filePaths.toString());

        // 获取所有zip中entry并遍历
        let fileTypes = [];
        files.getEntries().forEach(function (entry) {
          var entryName = entry.entryName;
          // console.log(entryName.endsWith);
          fileTypes.push(entryName.split('.')[1].toLowerCase());
        });

        // 判断上传模型包是否符合规范
        if (underscore.intersection(fileTypes, ['obj', 'mtl', 'gltf', 'wrl']).length > 0) {
          //写入文件到指定目录
          fs.writeFileSync(res.filePaths.toString(), zipFile, 'utf-8');
          // 解压缩到指定位目录
          files.extractAllTo('/Users/layne127/projects/bsti/vls/zip', true);
          event.sender.send('uploadModelProcess', { msg: '上传完成', code: 1 });
        } else {
          event.sender.send('uploadModelProcess', { msg: '请选择正确的模型数据包', code: -1 });
          /* dialog.showMessageBox({
          type:'warning', 
          title:'sure?',
          message:'请选择正确的模型数据包',
          detail:'请选择正确的模型数据包',
          buttons:['确定'],
      }).then(res=>logger.info(res));  */
        }
      });
  });

  /**
   * 监听下载进度
   */
  let cacheItem = {};
  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    //设置文件存放位置
    logger.info(item);
    cacheItem.path = item.getSavePath(); //地址
    cacheItem.eTag = item.getETag(); //资源标识
    cacheItem.urlChain = item.getURLChain(); //地址
    cacheItem.length = item.getTotalBytes(); //资源大小
    cacheItem.lastModified = item.getLastModifiedTime(); //资源最后一次更新的时间
    cacheItem.startTime = item.getStartTime();
    logger.info(cacheItem);
    logger.info(item.getFilename());
    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        // 下载中断
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          // 下载停止
          // 等待渲染进程请求继续
          ipcMain.once('resume', (event) => {
            if (item.canResume()) {
              // 判断是否可以继续
              item.resume();
            } else {
              //  event.sender.send('resumeCallback', 'cannot resume')
            }
          });
        } else {
          // 进度 百分数的整数
          let progress = Math.floor((item.getReceivedBytes() / item.getTotalBytes()) * 100);
          logger.info('progress', progress);
          //  win.webContents.send('progress', progress)
        }
      }
    });
    item.once('done', (event, state) => {
      if (state === 'completed') {
        logger.info('download complete');
        logger.info(item.getSavePath());
        // 打开下载后所在的文件夹
        // shell.showItemInFolder(item.getSavePath())
        // 以系统默认方式打开
        //   shell.openItem(item.getSavePath())
      } else {
        logger.info('downstate', state);
      }
    });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// 读取目录及文件
function readDir(obj, nowPath, nowFolder) {
  // 读取目录中的所有文件及文件夹
  let files = fs.readdirSync(nowPath);
  files.forEach(function (fileName, index) {
    // 遍历检测目录中的文件
    let fillPath = nowPath + '/' + fileName;
    let file = fs.statSync(fillPath);
    if (file.isDirectory()) {
      // 如果是目录的话，继续查询
      let folder = nowFolder + '/' + fileName;
      // 压缩对象中生成该目录
      let dirList = zip.folder(folder);
      // 重新检索目录文件
      readDir(dirList, fillPath, folder);
    } else {
      // 如果是文件压缩目录添加文件
      obj.file(fileName, fs.readFileSync(fillPath));
    }
  });
}

function showNotification(title, body) {
  const notification = {
    title: title,
    body: body,
  };
  new Notification(notification).show();
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
