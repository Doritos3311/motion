import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Motion } from '@capacitor/motion';

@Component({
  selector: 'app-angle-meter',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './angle-meter.component.html',
  styleUrls: ['./angle-meter.component.css']
})
export class AngleMeterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  currentAngle: number = 0;
  targetAngle: number = 0;
  savedAngles: number[] = [];
  isListening: boolean = false;
  isMeasuring: boolean = false;

  private ctx!: CanvasRenderingContext2D;
  private centerX!: number;
  private centerY!: number;
  private radius!: number;
  private animationId!: number;

  // Métodos de ciclo de vida
  ngAfterViewInit(): void {
    this.initCanvas();
    this.animate();
    this.startMotionTracking();
  }

  ngOnDestroy(): void {
    this.stopMotionTracking();
    cancelAnimationFrame(this.animationId);
  }

  // Configuración inicial del canvas
  initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    this.ctx.scale(dpr, dpr);
    this.centerX = canvas.width / (2 * dpr);
    this.centerY = canvas.height / (2 * dpr);
    this.radius = Math.min(canvas.width, canvas.height) * 0.4 / dpr;
    this.drawProtractor();
  }

  // Animación suave
  animate(): void {
    const animateFrame = () => {
      if (Math.abs(this.currentAngle - this.targetAngle) > 0.5) {
        this.currentAngle += (this.targetAngle - this.currentAngle) * 0.1;
        this.drawProtractor();
      }
      this.animationId = requestAnimationFrame(animateFrame);
    };
    animateFrame();
  }

  // Manejo del giroscopio
  async startMotionTracking() {
    if (this.isListening) return;

    try {
      await Motion.addListener('orientation', (event) => {
        const tiltAngle = event.gamma; // -90° a 90°
        this.targetAngle = 90 + tiltAngle; // Convertir a 0°-180°
      });
      this.isListening = true;
    } catch (error) {
      console.error('Error al acceder a los sensores:', error);
    }
  }

  async stopMotionTracking() {
    if (this.isListening) {
      await Motion.removeAllListeners();
      this.isListening = false;
    }
  }

  // Dibujo del transportador
  drawProtractor(): void {
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo semi-circular estilo iOS
    this.drawSemiCircle('#1c1c1e', this.radius);
    this.drawSemiCircle('#2c2c2e', this.radius * 0.95);

    // Marcas de grados
    this.drawDegreeMarks();

    // Línea indicadora
    this.drawIndicatorLine();

    // Punto central con efecto
    this.drawCenterPoint();
  }

  private drawSemiCircle(color: string, radius: number): void {
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, radius, Math.PI, 2 * Math.PI);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.strokeStyle = '#3a3a3c';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private drawDegreeMarks(): void {
    this.ctx.strokeStyle = '#5e9eff';
    this.ctx.lineWidth = 1;
    this.ctx.font = 'bold 14px -apple-system, sans-serif';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Ángulos clave con posiciones fijas (180° a la izquierda, 0° a la derecha)
    const anglePositions = [
      { angle: 180, textX: (centerX: number, radius: number) => centerX - radius - 20, textY: (centerY: number) => centerY },
      { angle: 150, textX: (centerX: number, radius: number) => centerX - (radius + 20) * Math.cos(Math.PI / 6), textY: (centerY: number, radius: number) => centerY + (radius + 20) * Math.sin(Math.PI / 6) },
      { angle: 120, textX: (centerX: number, radius: number) => centerX - (radius + 20) * Math.cos(Math.PI / 3), textY: (centerY: number, radius: number) => centerY + (radius + 20) * Math.sin(Math.PI / 3) },
      { angle: 90, textX: (centerX: number) => centerX, textY: (centerY: number, radius: number) => centerY + radius + 20 },
      { angle: 60, textX: (centerX: number, radius: number) => centerX + (radius + 20) * Math.cos(Math.PI / 3), textY: (centerY: number, radius: number) => centerY + (radius + 20) * Math.sin(Math.PI / 3) },
      { angle: 30, textX: (centerX: number, radius: number) => centerX + (radius + 20) * Math.cos(Math.PI / 6), textY: (centerY: number, radius: number) => centerY + (radius + 20) * Math.sin(Math.PI / 6) },
      { angle: 0, textX: (centerX: number, radius: number) => centerX + radius + 20, textY: (centerY: number) => centerY }
    ];

    // Dibujar todas las marcas de grado (invertidas)
    for (let angle = 0; angle <= 180; angle += 5) {
      const invertedAngle = 180 - angle; // Invertimos el ángulo
      const radian = (invertedAngle * Math.PI) / 180;
      const startX = this.centerX + (this.radius - 15) * Math.cos(radian);
      const startY = this.centerY + (this.radius - 15) * Math.sin(radian);
      const endX = this.centerX + this.radius * Math.cos(radian);
      const endY = this.centerY + this.radius * Math.sin(radian);

      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }

    // Dibujar etiquetas numéricas
    anglePositions.forEach(pos => {
      const textX = pos.textX(this.centerX, this.radius);
      const textY = pos.textY(this.centerY, this.radius);
      this.ctx.fillText(pos.angle.toString(), textX, textY);
    });
  }

  private drawIndicatorLine(): void {
    const radian = (this.currentAngle * Math.PI) / 180;
    const endX = this.centerX + this.radius * Math.cos(radian);
    const endY = this.centerY + this.radius * Math.sin(radian);

    // Sombra y efecto de neón
    this.ctx.shadowColor = 'rgba(94, 158, 255, 0.5)';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetY = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY);
    this.ctx.lineTo(endX, endY);
    this.ctx.strokeStyle = '#5e9eff';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Resetear sombra
    this.ctx.shadowColor = 'transparent';
  }

  private drawCenterPoint(): void {
    // Efecto de neón
    this.ctx.shadowColor = '#5e9eff';
    this.ctx.shadowBlur = 15;

    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, 8, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#5e9eff';
    this.ctx.fill();

    // Punto interior
    this.ctx.shadowBlur = 0;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, 4, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();
  }

  // Métodos de interacción
  startMeasurement(event: MouseEvent | TouchEvent): void {
    this.isMeasuring = true;
    this.updateAngle(event);
  }

  updateAngle(event: MouseEvent | TouchEvent): void {
    if (!this.isMeasuring) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : (event as MouseEvent).clientY;

    const x = clientX - rect.left - this.centerX;
    const y = clientY - rect.top - this.centerY;

    let angle = Math.atan2(y, x) * 180 / Math.PI;
    if (angle < 0) angle += 360;

    this.targetAngle = Math.round(angle * 10) / 10;
  }

  endMeasurement(): void {
    this.isMeasuring = false;
  }

  saveAngle(): void {
    if (this.currentAngle !== 0) {
      this.savedAngles.unshift(this.currentAngle);
      if (this.savedAngles.length > 5) {
        this.savedAngles.pop();
      }
    }
  }

  deleteAngle(angle: number): void {
    this.savedAngles = this.savedAngles.filter(a => a !== angle);
  }

  clearMeasurement(): void {
    this.targetAngle = 0;
    this.isMeasuring = false;
  }
}