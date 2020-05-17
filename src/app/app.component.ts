import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'dungeondraw';

  // its important myCanvas matches the variable name in the template
  @ViewChild('myCanvas3', { static: false }) myCanvas3: ElementRef;
  @ViewChild('myCanvas2', { static: false }) myCanvas2: ElementRef;
  @ViewChild('myCanvas1', { static: false }) myCanvas1: ElementRef;
  public ctx1: CanvasRenderingContext2D;
  public ctx2: CanvasRenderingContext2D;
  public ctx3: CanvasRenderingContext2D;

  @ViewChild('pattern') pattern: ElementRef;

  private isDrawing = false;
  private lastPoint;
  private originalPoint;

  constructor() {
  }

  ngAfterViewInit(): void {
    this.loadImage("assets/patterns/hand_lines.png").then(image3 => {
      this.loadImage("assets/patterns/hand_corss.png").then(image1 => {

        let linecap: CanvasLineCap = "round";
        let linejoin: CanvasLineJoin = "round";
        this.myCanvas3.nativeElement.width = window.innerWidth;
        this.myCanvas3.nativeElement.height = window.innerHeight;
        this.ctx3 = this.myCanvas3.nativeElement.getContext('2d');
        let pat3 = this.ctx3.createPattern(image3, "repeat");
        this.ctx3.fillStyle = pat3;
        this.ctx3.lineWidth = 0;
        this.ctx3.lineJoin = linejoin;
        this.ctx3.lineCap = linecap;
        this.ctx3.strokeStyle = pat3;

        this.myCanvas2.nativeElement.width = window.innerWidth;
        this.myCanvas2.nativeElement.height = window.innerHeight;
        this.ctx2 = this.myCanvas2.nativeElement.getContext('2d');
        this.ctx2.lineWidth = 40;
        this.ctx2.lineJoin = linejoin;
        this.ctx2.lineCap = linecap;

        this.myCanvas1.nativeElement.width = window.innerWidth;
        this.myCanvas1.nativeElement.height = window.innerHeight;
        this.ctx1 = this.myCanvas1.nativeElement.getContext('2d');
        let pat1 = this.ctx3.createPattern(image1, "repeat");
        this.ctx1.lineWidth = 100;
        this.ctx1.lineJoin = linejoin;
        this.ctx1.lineCap = linecap;
        this.ctx1.strokeStyle = pat1;
        this.ctx1.fillStyle = pat1;

      });
    });
  }


  onMouseDown(e) {
    this.isDrawing = true;
    let canvasX = e.pageX - this.myCanvas3.nativeElement.offsetLeft;
    let canvasY = e.pageY - this.myCanvas3.nativeElement.offsetTop;

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

    let canvasX = e.pageX - this.myCanvas3.nativeElement.offsetLeft;
    let canvasY = e.pageY - this.myCanvas3.nativeElement.offsetTop;
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
        this.ctx1.lineWidth = 100;
        this.ctx2.lineWidth = 40;
        this.ctx3.lineWidth = 0;
      }

      let ct3Size = 32;
      let ct2Size = 23;
      let ct1Size = 45;
      //this.ctx3.fillRect(x - ct3Size, y - ct3Size, ct3Size * 2, ct3Size * 2);
      let offset = -30;
      this.ctx3.translate(offset, offset);
      this.roundRect(this.ctx3, x - ct3Size - offset, y - ct3Size - offset, ct3Size * 2, ct3Size * 2, 10, true, true);
      this.ctx3.translate(-offset, -offset);
      //this.ctx2.fillRect(x - ct2Size, y - ct2Size, ct2Size * 2, ct2Size * 2);
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


  onMouseUp() {
    this.isDrawing = false;
    this.ctx1.closePath();
    this.ctx2.closePath();
    this.ctx3.closePath();

  };
}
