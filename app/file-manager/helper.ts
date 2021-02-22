import { app, BrowserWindow, DownloadItem, WebContents } from 'electron';
import { IDownloadBytes, IDownloadFile } from './interface';

/**
 * 获取下载中的字节数据
 * @param data - 下载项
 */
export const getDownloadBytes = (data: IDownloadFile[]): IDownloadBytes => {
  const allBytes = data.reduce<IDownloadBytes>(
    (prev, current) => {
      if (current.state === 'progressing') {
        prev.receivedBytes += current.receivedBytes;
        prev.totalBytes += current.totalBytes;
      }

      return prev;
    },
    { receivedBytes: 0, totalBytes: 0 },
  );

  return allBytes;
};

/**
 * 下载
 * @param win - 窗口
 * @param url - 下载地址
 */
export const download = (url: string, win: BrowserWindow | null): void => {
  if (!win) return;
  win.webContents.downloadURL(url);
};
