import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Motion } from '@capacitor/motion';


@Component({
  selector: 'app-angle-meter',
  standalone: true,
  imports: [ CommonModule, RouterLink ],
  templateUrl: './angle-meter.component.html',
  styleUrls: ['./angle-meter.component.css']
})
export class AngleMeterComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  currentAngle: number = 0;
  startAngle: number = 0;
  isMeasuring: boolean = false;
  savedAngles: number[] = [];
  
  private ctx!: CanvasRenderingContext2D;
  private centerX!: number;
  private centerY!: number;
  private radius!: number;
  public isListening: boolean = false; // ✔️ Ahora es accesible desde la plantilla
  
  // Iniciar seguimiento del dispositivo
  async startMotionTracking() {
    if (this.isListening) return;
    
    try {
      await Motion.addListener('orientation', (event) => {
        // Calcular ángulo basado en la orientación (ejemplo: usar gamma para inclinación lateral)
        const tiltAngle = event.gamma; // Rango: -90° a 90°
        const adjustedAngle = 90 + tiltAngle; // Ajustar a rango 0°-180°
        this.currentAngle = Math.round(adjustedAngle * 10) / 10;
        this.drawProtractor();
      });
      this.isListening = true;
      console.log('Sensores activados');
    } catch (error) {
      console.error('Error al acceder a los sensores:', error);
    }
  }

  // Detener seguimiento
  async stopMotionTracking() {
    await Motion.removeAllListeners();
    this.isListening = false;
    console.log('Sensores detenidos');
  }

  ngOnDestroy(): void {
    this.stopMotionTracking();
  }

  // Añade esta función para eliminar ángulos guardados
  deleteAngle(angle: number): void {
    this.savedAngles = this.savedAngles.filter(a => a !== angle);
  }

  ngAfterViewInit(): void {
    this.initCanvas();
    this.startMotionTracking(); // Iniciar automáticamente
  }

  initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;
    this.radius = Math.min(canvas.width, canvas.height) * 0.4;
    
    this.drawProtractor();
  }

  drawProtractor(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo del transportador (oscuro)
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#1e1e1e';
    this.ctx.fill();
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Marcas de grados (color claro)
    this.ctx.strokeStyle = '#a0a0a0';
    for (let angle = 0; angle < 360; angle += 5) {
      const radian = angle * Math.PI / 180;
      const startX = this.centerX + (this.radius - 15) * Math.cos(radian);
      const startY = this.centerY + (this.radius - 15) * Math.sin(radian);
      const endX = this.centerX + this.radius * Math.cos(radian);
      const endY = this.centerY + this.radius * Math.sin(radian);
      
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.lineWidth = angle % 10 === 0 ? 2 : 1;
      this.ctx.stroke();
      
      // Etiquetas numéricas
      if (angle % 30 === 0) {
        const textX = this.centerX + (this.radius - 30) * Math.cos(radian);
        const textY = this.centerY + (this.radius - 30) * Math.sin(radian);
        
        this.ctx.font = '12px -apple-system, sans-serif';
        this.ctx.fillStyle = '#e0e0e0';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(angle.toString(), textX, textY);
      }
    }
    
    // Línea de medición (azul brillante)
    if (this.isMeasuring) {
      const radian = this.currentAngle * Math.PI / 180;
      const endX = this.centerX + this.radius * Math.cos(radian);
      const endY = this.centerY + this.radius * Math.sin(radian);
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.lineTo(endX, endY);
      this.ctx.strokeStyle = '#5e9eff';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
      
      // Punto central
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, 8, 0, 2 * Math.PI);
      this.ctx.fillStyle = '#5e9eff';
      this.ctx.fill();
    }
  }

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
    
    this.currentAngle = Math.round(angle * 10) / 10; // Redondea a 1 decimal
    this.drawProtractor();
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

  clearMeasurement(): void {
    this.currentAngle = 0;
    this.isMeasuring = false;
    this.drawProtractor();
  }
}