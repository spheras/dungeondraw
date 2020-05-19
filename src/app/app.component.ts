import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { animateCSS } from 'src/util/util';
import { MatDrawer } from '@angular/material/sidenav';
import { STYLES, DrawStyle } from '../styles/draw.styles';
import { MatDialog } from '@angular/material/dialog';
import { AboutDialog } from './about/about.dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'dungeondraw';

  //the drawer
  @ViewChild('drawer') myDrawer: MatDrawer;
  //the download section
  @ViewChild('download') downloadLink: ElementRef;

  //Canvas to draw the floor of the lines
  @ViewChild('myCanvas3', { static: false }) myCanvas3: ElementRef;
  //Canvas to draw the border of the floor
  @ViewChild('myCanvas2', { static: false }) myCanvas2: ElementRef;
  //Canvas to draw the external decorations
  @ViewChild('myCanvas1', { static: false }) myCanvas1: ElementRef;

  //context for each canvas
  public ctx1: CanvasRenderingContext2D;
  public ctx2: CanvasRenderingContext2D;
  public ctx3: CanvasRenderingContext2D;

  // flag to know if it is drawing or not
  private isDrawing = false;
  // last point drawn
  private lastPoint;
  // original point that was pressed
  private originalPoint;

  public styles: DrawStyle[] = STYLES;
  public selectedStyle: DrawStyle = STYLES[0];

  constructor(public dialog: MatDialog) {
  }

  ngAfterViewInit(): void {

    //title animation when starting
    animateCSS('.title', "lightSpeedInLeft").then((m) => {
      animateCSS('.title', "lightSpeedOutRight").then(m => {
        document.querySelector('.title').remove();
      });
    });

    let linecap: CanvasLineCap = "round";
    let linejoin: CanvasLineJoin = "round";

    //all the canvas will set a 4K dimmensions
    let fourkwidth = 4096;
    let fourkheight = 2160;
    this.myCanvas3.nativeElement.width = fourkwidth;
    this.myCanvas3.nativeElement.height = fourkheight;
    this.myCanvas2.nativeElement.width = fourkwidth;
    this.myCanvas2.nativeElement.height = fourkheight;
    this.myCanvas1.nativeElement.width = fourkwidth;
    this.myCanvas1.nativeElement.height = fourkheight;

    let element: HTMLElement = (<HTMLElement>document.querySelector(".transparencyPanel"));
    element.style.width = `${fourkwidth}px`
    element.style.height = `${fourkheight}px`

    this.setStyle(STYLES[0]);
  }

  /**
   * @name toogleMenu
   * @description toogle the menu
   * @param e 
   */
  toggleMenu(e) {
    this.myDrawer.toggle();
    e.stopPropagation();
    e.preventDefault();
  }

  /**
   * @name clearScreen
   * @description clear the current screen
   */
  clearScreen() {
    this.ctx1.clearRect(0, 0, this.myCanvas1.nativeElement.width, this.myCanvas1.nativeElement.height);
    this.ctx2.clearRect(0, 0, this.myCanvas1.nativeElement.width, this.myCanvas1.nativeElement.height);
    this.ctx3.clearRect(0, 0, this.myCanvas1.nativeElement.width, this.myCanvas1.nativeElement.height);
  }

  /**
   * @name setStyle
   * @description set the style to apply
   * @param <DrawStyle> style the style to apply
   */
  setStyle(style: DrawStyle) {
    this.selectedStyle = style;
    //setting the draw style
    this.loadImage(`assets/patterns/${style.pattern1}`).then(image3 => {
      this.loadImage(`assets/patterns/${style.pattern2}`).then(image1 => {
        let linecap: CanvasLineCap = "round";
        let linejoin: CanvasLineJoin = "round";

        let element: HTMLElement = (<HTMLElement>document.querySelector("mat-drawer-container"));
        element.style.background = `url("/assets/patterns/${style.pattern1}")`;
        element = (<HTMLElement>document.querySelector(".transparencyPanel"));
        element.style.backgroundColor = `rgba(255, 255, 255, ${style.backgroundOpacity})`

        this.ctx3 = this.myCanvas3.nativeElement.getContext('2d');
        let pat3 = this.ctx3.createPattern(image3, "repeat");
        this.ctx3.fillStyle = pat3;
        this.ctx3.lineWidth = this.selectedStyle.lineWidth3;
        this.ctx3.lineJoin = linejoin;
        this.ctx3.lineCap = linecap;
        this.ctx3.strokeStyle = pat3;

        this.ctx2 = this.myCanvas2.nativeElement.getContext('2d');
        this.ctx2.lineWidth = this.selectedStyle.lineWidth2;
        this.ctx2.lineJoin = linejoin;
        this.ctx2.lineCap = linecap;

        this.ctx1 = this.myCanvas1.nativeElement.getContext('2d');
        let pat1 = this.ctx3.createPattern(image1, "repeat");
        this.ctx1.lineWidth = this.selectedStyle.lineWidth1;
        this.ctx1.lineJoin = linejoin;
        this.ctx1.lineCap = linecap;
        this.ctx1.strokeStyle = pat1;
        this.ctx1.fillStyle = pat1;
      });
    });
  }

  /**
   * @name saveDraw
   * @description save the current draw, and download as image file
   */
  saveDraw() {
    let width = this.myCanvas1.nativeElement.width;
    let height = this.myCanvas1.nativeElement.height;

    //discovering the boundaries of the draw
    let data = this.ctx1.getImageData(0, 0, width, height).data;
    let wf = width * 4;
    let lowestX = width;
    let lowestY = height;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let index = y * wf + x * 4;
        let alpha = data[index + 3];
        if (alpha != 0) {
          if (x < lowestX) {
            lowestX = x;
          }
          if (y < lowestY) {
            lowestY = y;
          }
          if (x > maxX) {
            maxX = x;
          }
          if (y > maxY) {
            maxY = y;
          }
        }
      }
    }

    //Make a Canvas to copy the data of the three canvas, and then download the image generated
    var hidden_canv = document.createElement('canvas');
    hidden_canv.style.display = 'none';
    document.body.appendChild(hidden_canv);
    let saveWidth = maxX - lowestX;
    let saveHeight = maxY - lowestY;
    hidden_canv.width = saveWidth;
    hidden_canv.height = saveHeight;

    let hidden_ctx = hidden_canv.getContext('2d');
    hidden_ctx.fillStyle = "white";
    hidden_ctx.fillRect(0, 0, width, height);
    hidden_ctx.drawImage(this.myCanvas1.nativeElement, lowestX, lowestY, saveWidth, saveHeight, 0, 0, saveWidth, saveHeight);
    hidden_ctx.drawImage(this.myCanvas2.nativeElement, lowestX, lowestY, saveWidth, saveHeight, 0, 0, saveWidth, saveHeight);
    hidden_ctx.drawImage(this.myCanvas3.nativeElement, lowestX, lowestY, saveWidth, saveHeight, 0, 0, saveWidth, saveHeight);

    //Create a download URL for the data, and download
    var hidden_data = hidden_canv.toDataURL("image/png").replace("image/png", "image/octet-stream");
    this.downloadLink.nativeElement.setAttribute('download', 'dungeondraw.png');
    this.downloadLink.nativeElement.setAttribute('href', hidden_data);
  }




  onMouseDown(e) {
    if (this.myDrawer.opened) {
      return;
    }

    this.isDrawing = true;
    let canvasX = e.pageX - this.myCanvas3.nativeElement.offsetLeft + this.myCanvas3.nativeElement.parentElement.scrollLeft;
    let canvasY = e.pageY - this.myCanvas3.nativeElement.offsetTop + this.myCanvas3.nativeElement.parentElement.scrollTop;

    this.lastPoint = { x: canvasX, y: canvasY };
    this.originalPoint = { x: canvasX, y: canvasY };


    this.ctx1.beginPath();
    this.ctx1.moveTo(canvasX, canvasY);
    this.ctx2.beginPath();
    this.ctx2.moveTo(canvasX, canvasY);
    this.ctx3.beginPath();
    this.ctx3.moveTo(canvasX, canvasY);
  }

  async loadImage(url): Promise<CanvasImageSource> {
    return new Promise(r => {
      let i = new Image();
      i.onload = (() => r(i));
      i.src = url;
    });
  }

  distanceBetween(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  }

  angleBetween(point1, point2) {
    return Math.atan2(point2.x - point1.x, point2.y - point1.y);
  }


  onMouseMove(e) {
    if (!this.isDrawing) return;

    let canvasX = e.pageX - this.myCanvas3.nativeElement.offsetLeft + this.myCanvas3.nativeElement.parentElement.scrollLeft;
    let canvasY = e.pageY - this.myCanvas3.nativeElement.offsetTop + this.myCanvas3.nativeElement.parentElement.scrollTop;
    var currentPoint = { x: canvasX, y: canvasY };
    var dist = this.distanceBetween(this.lastPoint, currentPoint);
    var angle = this.angleBetween(this.lastPoint, currentPoint);

    for (var i = 0; i < dist; i += 5) {

      let x = this.lastPoint.x + (Math.sin(angle) * i);
      let y = this.lastPoint.y + (Math.cos(angle) * i);
      if (e.ctrlKey) {
        y = this.originalPoint.y;
      }
      if (e.altKey) {
        x = this.originalPoint.x;
      }
      if (e.shiftKey) {
        this.ctx3.globalCompositeOperation = this.ctx2.globalCompositeOperation = this.ctx1.globalCompositeOperation = 'destination-out';
        this.ctx1.lineWidth = this.ctx2.lineWidth = this.ctx3.lineWidth;
      } else {
        this.ctx3.globalCompositeOperation = 'source-over';
        this.ctx2.globalCompositeOperation = 'source-over';
        this.ctx1.globalCompositeOperation = 'source-over';
        this.ctx1.lineWidth = this.selectedStyle.lineWidth1;
        this.ctx2.lineWidth = this.selectedStyle.lineWidth2;
        this.ctx3.lineWidth = this.selectedStyle.lineWidth3;
      }

      let ct3Size = 32;
      let ct2Size = 23;
      let ct1Size = 45;

      let patternOffset = 0;
      this.ctx3.translate(patternOffset, patternOffset);
      this.roundRect(this.ctx3, x - ct3Size - patternOffset, y - ct3Size - patternOffset, ct3Size * 2, ct3Size * 2, 10, true, true);
      this.ctx3.translate(-patternOffset, -patternOffset);
      this.roundRect(this.ctx2, x - ct2Size, y - ct2Size, ct2Size * 2, ct2Size * 2, 10, true, true);

      this.roundRect(this.ctx1, x - ct1Size, y - ct1Size, ct1Size * 2, ct1Size * 2, 0, true, true);
    }

    this.lastPoint = currentPoint;
  }

  /**
   * Draws a rounded rectangle using the current state of the canvas.
   * If you omit the last three params, it will draw a rectangle
   * outline with a 5 pixel border radius
   * @param {CanvasRenderingContext2D} ctx
   * @param {Number} x The top left x coordinate
   * @param {Number} y The top left y coordinate
   * @param {Number} width The width of the rectangle
   * @param {Number} height The height of the rectangle
   * @param {Number} [radius = 5] The corner radius; It can also be an object 
   *                 to specify different radii for corners
   * @param {Number} [radius.tl = 0] Top left
   * @param {Number} [radius.tr = 0] Top right
   * @param {Number} [radius.br = 0] Bottom right
   * @param {Number} [radius.bl = 0] Bottom left
   * @param {Boolean} [fill = false] Whether to fill the rectangle.
   * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
   */
  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }

  }

  /**
   * Closing the draw
   */
  onMouseUp() {
    this.isDrawing = false;
    this.ctx1.closePath();
    this.ctx2.closePath();
    this.ctx3.closePath();

  };


  /**
   * @name showAbout
   * @description show the about page
   */
  showAbout(): void {
    this.dialog.open(AboutDialog, {
      width: '400px',
      data: {}
    });

  }
}
