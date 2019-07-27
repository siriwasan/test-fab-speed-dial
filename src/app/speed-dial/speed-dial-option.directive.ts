import {
  Directive,
  OnInit,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
  Input,
  HostBinding,
  ElementRef,
  ViewContainerRef,
  Inject,
  Optional,
  HostListener
} from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { OverlayRef, Overlay, ConnectedPositionStrategy, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatButton } from '@angular/material/button';
import { TooltipComponent, TOOLTIP_PANEL_CLASS } from '@angular/material/tooltip';

/**
 * Option for inside {@link SpeedDialComponent}
 * @example
 * ```html
 * <speed-dial>
 *   <button speed-dial-option>
 *     ...option 1...
 *   </buton>
 *   <button speed-dial-option speedDialOptionLabel="Optional Label">
 *     ...option 2...
 *   </buton>
 * </speed-dial>
 * ```
 */
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'button[speed-dial-option]',
  exportAs: 'speedDialOption'
})
export class SpeedDialOptionDirective implements OnChanges, OnDestroy {
  @Input('speedDialOptionLabel')
  public label: string;

  @HostBinding('@speedDialAnimation')
  public speedDialAnimation: string = 'closed';

  private openCallBack: () => void;

  private closeCallBack: () => void;

  private overlayRef: OverlayRef;

  private labelInstance: TooltipComponent;

  constructor(
    private elementRef: ElementRef,
    private viewContainerRef: ViewContainerRef,
    private overlay: Overlay,
    @Optional() matButton: MatButton
  ) {
    // undo default to accent for mini-fab
    if (matButton) {
      matButton.color = null;
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.label && this.labelInstance) {
      this.labelInstance.message = this.label;
      this.labelInstance._markForCheck();
      this.overlayRef.updatePosition();
    }
  }

  public ngOnDestroy(): void {
    this.destroyLabel();
  }

  @HostListener('@speedDialAnimation.done', ['$event'])
  public onAnimationDone(event: AnimationEvent): void {
    if (event) {
      if (event.toState === 'opened' && this.openCallBack) {
        this.openCallBack();
        if (!this.labelInstance) {
          this.createLabel();
        }
        if (this.label) {
          this.labelInstance.message = this.label;
          this.labelInstance._markForCheck();
          this.overlayRef.updatePosition();
          // this.labelInstance.show('before');
        }
      }
      if (event.toState === 'closed' && this.closeCallBack) {
        this.closeCallBack();
      }
    }
  }

  public animateOpen(): Promise<void> {
    return new Promise(resolve => {
      this.openCallBack = () => resolve();
      this.speedDialAnimation = 'opened';
    });
  }

  public animateClose(): Promise<void> {
    if (this.labelInstance) {
      this.labelInstance.hide(0);
    }
    this.destroyLabel();
    return new Promise(resolve => {
      this.closeCallBack = () => resolve();
      this.speedDialAnimation = 'closed';
    });
  }

  private getPosition(): ConnectedPositionStrategy {
    return this.overlay
      .position()
      .connectedTo(this.elementRef, { originX: 'start', originY: 'center' }, { overlayX: 'end', overlayY: 'center' });
  }

  private createOverlay(): OverlayRef {
    const positionStrategy = this.getPosition();
    positionStrategy.onPositionChange.subscribe(change => {
      // if (this.labelInstance) {
      //   this.labelInstance._setTransformOrigin(change.connectionPair);
      // }
    });
    const config = new OverlayConfig({
      direction: 'ltr',
      positionStrategy: this.getPosition(),
      panelClass: TOOLTIP_PANEL_CLASS,
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });
    return this.overlay.create(config);
  }

  private createLabel(): void {
    this.overlayRef = this.createOverlay();
    const portal = new ComponentPortal(TooltipComponent, this.viewContainerRef);
    this.labelInstance = this.overlayRef.attach(portal).instance;
    this.labelInstance.message = this.label;
    this.labelInstance._markForCheck();
    this.overlayRef.updatePosition();
  }

  private destroyLabel(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    if (this.labelInstance) {
      this.labelInstance = null;
    }
  }
}
