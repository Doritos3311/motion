import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Motion } from '@capacitor/motion';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gyroscope.component.html',
  styleUrls: ['./gyroscope.component.css']
})
export class GyroscopeComponent implements OnDestroy {
  axes = [
    { name: 'X', value: 0 },
    { name: 'Y', value: 0 },
    { name: 'Z', value: 0 }
  ];

  async ngOnInit() {
    await Motion.addListener('orientation', (event) => {
      this.axes[0].value = event.alpha;
      this.axes[1].value = event.beta;
      this.axes[2].value = event.gamma;
    });
  }

  ngOnDestroy() {
    Motion.removeAllListeners();
  }
}