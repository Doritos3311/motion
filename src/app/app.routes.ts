import { Routes } from '@angular/router';
import { AngleMeterComponent } from './components/angle-meter/angle-meter.component';
import { HomeComponent } from './components/home/home.component';
import { GyroscopeComponent } from './components/gyroscope/gyroscope.component';

export const routes: Routes = [
  { path: 'angle-meter', component: AngleMeterComponent },
  { path: '', component: HomeComponent },
  { path: 'gyroscope', component: GyroscopeComponent }
];