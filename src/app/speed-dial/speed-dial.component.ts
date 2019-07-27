import { Component, ViewEncapsulation, OnDestroy, Output, EventEmitter, ViewChild, TemplateRef, ContentChildren, QueryList } from '@angular/core';
import { speedDialAnimation } from './speed-dial-animation';
import { SpeedDialOptionDirective } from './speed-dial-option.directive';

/**
 * Container for Speed dial content to show in Overlay when triggered
 * @example
 * ```html
 * <speed-dial #dial="speedDial">
 *   <!-- option 1 -->
 *   <button mat-mini-fab speed-dial-option>
 *     <mat-icon>option_icon</mat-icon>
 *   </buton>
 *   <!-- option 2 -->
 *   <button mat-mini-fab speed-dial-option>
 *     <mat-icon>option_icon</mat-icon>
 *   </buton>
 * </speed-dial>
 * <button mat-fab [speedDialTriggerFor]="dial" #trigger="speedDialTrigger">
 *   <mat-icon *ngIf="!trigger.isOpen">trigger_icon</mat-icon>
 *   <mat-icon *ngIf="trigger.isOpen">close</mat-icon>
 * </button>
 * ```
 */
@Component({
  selector: 'speed-dial',
  templateUrl: './speed-dial.component.html',
  styleUrls: ['./speed-dial.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [speedDialAnimation],
  exportAs: 'speedDial'
})
export class SpeedDialComponent implements OnDestroy {

  @Output()
  public closed = new EventEmitter<void>();

  @ViewChild(TemplateRef, { static: true })
  public templateRef: TemplateRef<any>;

  @ContentChildren(SpeedDialOptionDirective)
  public options: QueryList<SpeedDialOptionDirective>;


  public ngOnDestroy(): void {
    this.closed.complete();
  }

  public contentClick(event: Event): void {
    this.animateClose();
    this.closed.emit();
  }

  public animateOpen(index: number = 0): void {
    // TODO animate bottom to top
    this.options.forEach(option => option.animateOpen());
  }

  public animateClose(index: number = 0): void {
    // TODO animate top to bottom
    this.options.forEach(option => option.animateClose());
  }

}
