import {
  trigger,
  state,
  style,
  animate,
  transition,
  AnimationMetadata
} from '@angular/animations';

export const speedDialAnimation: AnimationMetadata = trigger('speedDialAnimation', [
  state('closed', style({
    opacity: 0,
    transform: 'scale(0.01, 0.01)'
  })),
  state('opened', style({
    opacity: 1,
    transform: 'scale(1, 1)'
  })),
  transition('closed => opened', animate('225ms ease-in')),
  transition('opened => closed', animate('195ms ease-out'))
]);
