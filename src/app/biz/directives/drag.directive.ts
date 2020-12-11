import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import $ from 'jquery';
import { debounce } from 'rxjs/operators';
@Directive({
  selector: '[appDrag]',
})
export class DragDirective {
  @Input() highlightColor: string;
  @Output() mouseEnter = new EventEmitter<boolean>();
  isDragging = false;
  isResizingX = false;
  isResizingY = false;

  isResizingS = false;
  isResizingN = false;
  isResizingW = false;
  isResizingE = false;

  shiftPosition = { x: 0, y: 0 };
  element: any = null;
  constructor(private el: ElementRef) {
    this.element = this.el.nativeElement;
  }
  @HostListener('mouseenter')
  onMouseEnter() {
    // this.highlight(this.highlightColor || '#cccccc');
    this.mouseEnter.emit(true);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.highlight(null);
    this.mouseEnter.emit(false);
  }

  private highlight(color: string) {
    this.element.style.backgroundColor = color;
  }

  makesureInParent(position: any) {
    const parent: any = this.element.parentNode;
    if (position.x < 0) {
      position.x = 0;
    } else if (position.x > parent.clientWidth - this.element.clientWidth) {
      position.x = parent.clientWidth - this.element.clientWidth;
    }
    if (position.y < 0) {
      position.y = 0;
    } else if (position.y > parent.clientHeight - this.element.clientHeight) {
      position.y = parent.clientHeight - this.element.clientHeight;
    }
    return position;
  }

  dragElement(ev: any) {
    // console.log('do drag element');
    const parentRect = this.element.parentNode.getBoundingClientRect();
    let newPosition = {
      x: ev.clientX - parentRect.left - this.shiftPosition.x,
      y: ev.clientY - parentRect.top - this.shiftPosition.y,
    };
    newPosition = this.makesureInParent(newPosition);
    // 像素定位

    // this.el.nativeElement.style.left = newPosition.x + 'px';

    // this.el.nativeElement.style.top = newPosition.y + 'px';

    // 百分比方式, 四舍五入，保留整数
    this.element.style.left = Number((newPosition.x * 100.0) / this.element.parentNode.clientWidth).toFixed(0) + '%';
    this.element.style.top = Number((newPosition.y * 100.0) / this.element.parentNode.clientHeight).toFixed(0) + '%';
  }

  initDragging(ev: any) {
    const elementRect = this.element.getBoundingClientRect();
    this.shiftPosition.x = ev.clientX - elementRect.left;
    this.shiftPosition.y = ev.clientY - elementRect.top;
    console.log('shiftPosition x:' + this.shiftPosition.x + ' y:' + this.shiftPosition.y);
  }

  setDragging(cursor: string, event: any) {
    this.isDragging = cursor === 'move';
    if (this.isDragging) {
      this.initDragging(event);
    }
  }

  resizeElementX(ev: any) {
    // console.log('do resize element x');
    const elementRect = this.element.getBoundingClientRect();
    const parentRect = this.element.parentNode.getBoundingClientRect();
    const min = this.element.parentNode.clientWidth / 10;
    // 改变宽度
    let right = ev.clientX + this.shiftPosition.x;
    if (right - elementRect.left < min) {
      right = elementRect.left + min;
    } else if (right > parentRect.right) {
      right = parentRect.right;
    }
    const width = right - elementRect.left;
    this.element.style.width = Number((width * 100.0) / this.element.parentNode.clientWidth).toFixed(0) + '%';
  }

  resizeElementE(ev: any) {
    // console.log('do resize element x');
    const elementRect = this.element.getBoundingClientRect();
    const parentRect = this.element.parentNode.getBoundingClientRect();
    const min = this.element.parentNode.clientWidth / 10;
    // 改变宽度
    let right = ev.clientX + this.shiftPosition.x;
    if (right - elementRect.left < min) {
      right = elementRect.left + min;
    } else if (right > parentRect.right) {
      right = parentRect.right;
    }
    const width = right - elementRect.left;
    const widthEv = Number((width * 100.0) / this.element.parentNode.clientWidth).toFixed(0);
    // && (this.element.id === 'scence' || this.element.id === 'scence-left' || this.element.id === 'process')
    if (this.element.previousElementSibling) {
      const leftWidth = Number((this.element.previousElementSibling.clientWidth * 100.0) / this.element.parentNode.clientWidth).toFixed(0);
      const rightWidth = (100 - Number(leftWidth) - Number((width * 100.0) / this.element.parentNode.clientWidth)).toFixed(0) + '%';
      if (100 - Number(widthEv) - Number(leftWidth) > 10) {
        this.element.style.width = widthEv + '%';
        this.element.nextElementSibling.style.width = rightWidth;
      }
    } else if (!this.element.previousElementSibling) {
      // && (this.element.id === 'scence' || this.element.id === 'scence-left' || this.element.id === 'bottom-left' || this.element.id === 'process')
      const rightWidth2 = Number(
        (this.element.nextElementSibling.nextElementSibling.clientWidth * 100.0) / this.element.parentNode.clientWidth,
      ).toFixed(0);
      const rightWidth = (100 - Number(rightWidth2) - Number((width * 100.0) / this.element.parentNode.clientWidth)).toFixed(0);
      if (100 - Number(widthEv) - Number(rightWidth2) > 10) {
        this.element.style.width = widthEv + '%';
        this.element.nextElementSibling.style.width = 100 - Number(widthEv) - Number(rightWidth2) + '%';
        this.element.nextElementSibling.nextElementSibling.style.width = rightWidth2 + '%';
      } else {
      }
    }
  }

  resizeElementW(ev: any) {
    /*       console.log('左边移动');
              const elementRect = this.element.getBoundingClientRect();
              const parentRect = this.element.parentNode.getBoundingClientRect();
              const min = this.element.parentNode.clientWidth / 10;
              console.log(this.shiftPosition);
              let left = this.shiftPosition.x - ev.clientX;
              if (elementRect.left - left < min) {
                  left = elementRect.left + min;
              } else if (left > parentRect.right) {
                  left = parentRect.right;
              }
              const width = elementRect.left + left;
              console.log(Number(width * 100.0 / this.element.parentNode.clientWidth).toFixed(0) + '%');
              this.element.style.width = Number(width * 100.0 / this.element.parentNode.clientWidth).toFixed(0) + '%';
              if (this.element.previousElementSibling) {
                  const rightWidth = Number(this.element.nextElementSibling.clientWidth * 100.0 / this.element.parentNode.clientWidth).toFixed(0);
                  const leftWidth = (100 - Number(rightWidth) - Number(width * 100.0 / this.element.parentNode.clientWidth)).toFixed(0) + '%';
                  this.element.previousElementSibling.style.width = leftWidth;
              } */
  }
  resizeElementS(ev: any) {
    // console.log('do resize element y');
    const elementRect = this.element.getBoundingClientRect();
    const parentRect = this.element.parentNode.getBoundingClientRect();
    const min = this.element.parentNode.parentNode.clientHeight / 10;
    // 改变高度
    let bottom = ev.clientY + this.shiftPosition.y;
    if (bottom - elementRect.top < min) {
      bottom = elementRect.top + min;
    } else if (bottom > parentRect.bottom) {
      bottom = parentRect.bottom;
    }
    const height = bottom - elementRect.top;
    const heightEv = Number((height * 100.0) / this.element.parentNode.clientHeight).toFixed(0);
    if (this.element.parentNode.previousElementSibling) {
      const topHeight = Number((height * 100.0) / this.element.parentNode.parentNode.clientHeight).toFixed(0);
      const bottomHeight = (100 - Number(topHeight) - 2).toFixed(0) + '%';
      if (100 - Number(topHeight) > 10) {
        this.element.style.height = heightEv + '%';
        const bottomHeight = (100 - Number(heightEv) - 2).toFixed(0) + '%';
        this.element.nextElementSibling.style.height = bottomHeight;
      }
    } else if (this.element.parentNode.nextElementSibling) {
      if (100 - Number(heightEv) > 10) {
        this.element.style.height = heightEv + '%';
        const topHeight = Number((height * 100.0) / this.element.parentNode.parentNode.clientHeight).toFixed(0);
        const bottomHeight = (100 - Number(topHeight) - 2).toFixed(0) + '%';
        this.element.parentNode.nextElementSibling.style.height = bottomHeight;
      }
    }
  }

  resizeElementN(ev: any) {}

  resizeElementY(ev: any) {
    // console.log('do resize element y');
    const elementRect = this.element.getBoundingClientRect();
    const parentRect = this.element.parentNode.getBoundingClientRect();
    const min = this.element.parentNode.clientHeight / 10;
    // 改变高度
    let bottom = ev.clientY + this.shiftPosition.y;
    if (bottom - elementRect.top < min) {
      bottom = elementRect.top + min;
    } else if (bottom > parentRect.bottom) {
      bottom = parentRect.bottom;
    }
    const height = bottom - elementRect.top;
    this.element.style.height = Number((height * 100.0) / this.element.parentNode.clientHeight).toFixed(0) + '%';
  }

  initResizing(ev: any) {
    const elementRect = this.element.getBoundingClientRect();
    this.shiftPosition.x = elementRect.right - ev.clientX;
    this.shiftPosition.y = elementRect.bottom - ev.clientY;
    console.log('shiftPosition x:' + this.shiftPosition.x + ' y:' + this.shiftPosition.y);
  }

  setResizing(cursor: string, event: any) {
    if (cursor == null || cursor.indexOf('-resize') < 0) {
      /* this.isResizingX = false;
            this.isResizingY = false; */
      this.isResizingW = false;
      this.isResizingE = false;
      this.isResizingS = false;
      this.isResizingN = false;
      return;
    }
    cursor = cursor.replace('-resize', '');
    console.log(cursor);
    this.isResizingW = cursor.indexOf('w') >= 0;
    this.isResizingE = cursor.indexOf('e') >= 0;
    this.isResizingS = cursor.indexOf('s') >= 0;
    this.isResizingN = cursor.indexOf('n') >= 0;
    this.initResizing(event);
  }

  getMutableCursor(ev): string {
    const elementRect = this.element.getBoundingClientRect();
    const padding = 20;
    const pt = {
      x: ev.clientX,
      y: ev.clientY,
    };
    let cursor = '';
    if (pt.y >= elementRect.top && pt.y <= elementRect.top + padding) {
      // 上边缘
      // cursor += 'ns';
    } else if (pt.y >= elementRect.bottom - padding && pt.y <= elementRect.bottom) {
      // 下边缘
      cursor += 'ns';
    }
    if (pt.x >= elementRect.left && pt.x <= elementRect.left + padding) {
      // 左边缘
      //  cursor += 'ew';
    } else if (this.element.id !== 'scence-div' && pt.x >= elementRect.right - padding && pt.x <= elementRect.right) {
      // 右边缘
      cursor += 'ew';
    }
    if (cursor === '') {
      return 'move';
    }
    return cursor + '-resize';
  }

  isParent(obj, parentObj) {
    while (obj !== undefined && obj != null && obj.tagName.toUpperCase() !== 'BODY') {
      if (obj === parentObj) {
        return true;
      }
      obj = obj.parentNode;
    }
    return false;
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(ev: any) {
    if (this.isParent(ev.target, this.element)) {
      console.log(ev.target.nodeName + ' x:' + ev.clientX + ' y:' + ev.clientY);
      const cursor = this.getMutableCursor(ev);
      if (cursor === 'move') {
        this.setDragging(cursor, ev);
      } else {
        this.setResizing(cursor, ev);
      }
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(ev: any) {
    this.element.style.cursor = this.getMutableCursor(ev);
    if (this.isDragging) {
      this.dragElement(ev);
    }
    /*   if (this.isResizingX) {
              this.resizeElementX(ev);
          }
          if (this.isResizingY) {
              this.resizeElementY(ev);
          } */

    if (this.isResizingS) {
      this.resizeElementS(ev);
    }
    if (this.isResizingN) {
      this.resizeElementN(ev);
    }
    if (this.isResizingW) {
      this.resizeElementW(ev);
    }
    if (this.isResizingE) {
      this.resizeElementE(ev);
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp() {
    console.log('鼠标抬起');
    this.setDragging(null, null);
    this.setResizing(null, null);
  }
}
