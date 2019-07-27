import {
  Directive,
  AfterContentInit,
  OnDestroy,
  Input,
  ViewContainerRef,
  ElementRef,
  HostListener
} from '@angular/core';
import { OverlayRef, Overlay, OverlayConfig, ConnectedPositionStrategy } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Observable } from 'rxjs';
import { merge } from 'rxjs/operators';
import { SpeedDialComponent } from './speed-dial.component';

/**
 * FAB that triggers showing {@link SpeedDialComponent} in Overlay
 * @example
 * ```html
 * <speed-dial #dial="speedDial">...</speed-dial>
 * <button mat-fab [speedDialTriggerFor]="dial">...</button>
 * ```
 */
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'button[speedDialTriggerFor]',
  exportAs: 'speedDialTrigger'
})
export class SpeedDialTriggerDirective implements AfterContentInit, OnDestroy {
  // tslint:disable-next-line:no-input-rename
  @Input('speedDialTriggerFor')
  public speedDial: SpeedDialComponent;

  public isOpen = false;

  private overlayRef: OverlayRef;

  constructor(private viewContainerRef: ViewContainerRef, private elementRef: ElementRef, private overlay: Overlay) {}

  public ngAfterContentInit(): void {
    this.speedDial.closed.subscribe(() => this.destroyPanel());
  }

  public ngOnDestroy(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent): void {
    this.open();
    event.preventDefault();
  }

  public open(): void {
    if (!this.overlayRef) {
      const config: OverlayConfig = this.getOverlayConfig();
      this.overlayRef = this.overlay.create(config);
      Observable.merge(this.overlayRef.backdropClick(), this.overlayRef.detachments()).subscribe(() => {
        this.close();
      });
    }
    const templatePortal = new TemplatePortal(this.speedDial.templateRef, this.viewContainerRef);
    this.overlayRef.attach(templatePortal);
    this.isOpen = true;
    this.speedDial.animateOpen();
  }

  public close(): void {
    this.speedDial.animateClose();
    this.speedDial.closed.emit();
  }

  private getPosition(): ConnectedPositionStrategy {
    return this.overlay
      .position()
      .connectedTo(this.elementRef, { originX: 'center', originY: 'top' }, { overlayX: 'center', overlayY: 'bottom' });
  }

  private getOverlayConfig(): OverlayConfig {
    return new OverlayConfig({
      positionStrategy: this.getPosition(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });
  }

  private destroyPanel(): void {
    this.overlayRef.detach();
    this.isOpen = false;
  }
}
