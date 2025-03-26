import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Motion } from '@capacitor/motion';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gyroscope.component.html',
  styleUrls: ['./gyroscope.component.css']
})
export class GyroscopeComponent implements OnInit, OnDestroy {
  axes = [
    { name: 'Eje X (Roll)', value: 0 },
    { name: 'Eje Y (Pitch)', value: 0 },
    { name: 'Eje Z (Yaw)', value: 0 }
  ];
  isSupported: boolean = true; // Asumimos que está soportado inicialmente
  errorMessage: string | null = null;
  private listener: any;

  async ngOnInit() {
    try {
      // Método alternativo para verificar disponibilidad
      if (typeof DeviceOrientationEvent !== 'undefined' &&
        'requestPermission' in DeviceOrientationEvent) {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission !== 'granted') {
          this.handleError('Permiso de sensores denegado');
          return;
        }
      }

      await this.startMotionTracking();
    } catch (error) {
      this.handleError('Error al acceder al sensor: ' + error);
    }
  }

  private async startMotionTracking() {
    this.listener = await Motion.addListener('orientation', (event) => {
      // Usamos requestAnimationFrame para mejor rendimiento
      requestAnimationFrame(() => {
        this.axes[0].value = this.lowPassFilter(this.axes[0].value, event.beta);
        this.axes[1].value = this.lowPassFilter(this.axes[1].value, event.gamma);
        this.axes[2].value = this.lowPassFilter(this.axes[2].value, event.alpha);
      });
    });
  }

  private handleError(message: string) {
    this.isSupported = false;
    this.errorMessage = message;
    console.error(message);
  }

  private lowPassFilter(oldValue: number, newValue: number, alpha = 0.15): number {
    return oldValue * (1 - alpha) + newValue * alpha;
  }

  async ngOnDestroy() {
    if (this.listener) {
      await this.listener.remove();
    }
  }
}