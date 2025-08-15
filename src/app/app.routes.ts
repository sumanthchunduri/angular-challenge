import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'visualizer',
    loadComponent: () => import('./part1/part1').then((m) => m.Part1),
  },
  {
    path: 'generator',
    loadComponent: () => import('./part2/part2').then((m) => m.Part2),
  },
  {
    path: '',
    redirectTo: 'visualizer',
    pathMatch: 'full',
  },
];
