import {
  AfterContentInit,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Injector,
  Input,
  OnDestroy,
  Output,
  QueryList,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';
import { MatButton } from '@angular/material';
import { DOCUMENT } from '@angular/common';
import { forkJoin, fromEvent, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

const Z_INDEX_ITEM = 23;

export type Direction = 'up' | 'down' | 'left' | 'right';
export type AnimationMode = 'fling' | 'scale';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'fab-speed-dial-actions',
  template: `
    <ng-content select="[mat-mini-fab]" *ngIf="miniFabVisible"></ng-content>
  `
})
export class FabSpeedDialActionsComponent implements AfterContentInit {
  private parent: FabSpeedDialComponent;

  @ContentChildren(MatButton) buttons: QueryList<MatButton>;

  /**
   * Whether the min-fab button exist in DOM
   */
  public miniFabVisible = false;

  /**
   * The timeout ID for the callback to show the mini-fab buttons
   */
  private showMiniFabAnimation: NodeJS.Timer;

  /**
   * When we will remove mini-fab buttons from DOM, after the animation is complete
   */
  private hideMiniFab: Subscription | null;

  constructor(injector: Injector, private renderer: Renderer2) {
    // tslint:disable-next-line: no-use-before-declare
    this.parent = injector.get(FabSpeedDialComponent);
  }

  ngAfterContentInit(): void {
    this.buttons.changes.subscribe(() => {
      this.initButtonStates();
      this.parent.setActionsVisibility();
    });

    this.initButtonStates();
  }

  private initButtonStates(): void {
    this.buttons.forEach((button, i) => {
      this.renderer.addClass(button._getHostElement(), 'fab-action-item');
      this.changeElementStyle(button._getHostElement(), 'z-index', '' + (Z_INDEX_ITEM - i));
    });
  }

  show(): void {
    if (!this.buttons) {
      return;
    }

    this.resetAnimationState();
    this.miniFabVisible = true;

    this.showMiniFabAnimation = setTimeout(() => {
      this.buttons.forEach((button, i) => {
        let transitionDelay = 0;
        let transform;
        if (this.parent.animationMode === 'scale') {
          // Incremental transition delay of 65ms for each action button
          transitionDelay = 3 + 65 * i;
          transform = 'scale(1)';
        } else {
          transform = this.getTranslateFunction('0');
        }

        const hostElement = button._getHostElement();
        this.changeElementStyle(hostElement, 'transition-delay', transitionDelay + 'ms');
        this.changeElementStyle(hostElement, 'opacity', '1');
        this.changeElementStyle(hostElement, 'transform', transform);
      });
    }, 50); // Be sure that *ngIf can show elements before trying to animate them
  }

  private resetAnimationState(): void {
    clearTimeout(this.showMiniFabAnimation);
    if (this.hideMiniFab) {
      this.hideMiniFab.unsubscribe();
      this.hideMiniFab = null;
    }
  }

  hide(): void {
    if (!this.buttons) {
      return;
    }

    this.resetAnimationState();

    const obs = this.buttons.map((button, i) => {
      let opacity = '1';
      let transitionDelay = 0;
      let transform;

      if (this.parent.animationMode === 'scale') {
        transitionDelay = 3 - 65 * i;
        transform = 'scale(0)';
        opacity = '0';
      } else {
        transform = this.getTranslateFunction(55 * (i + 1) - i * 5 + 'px');
      }

      const hostElement = button._getHostElement();

      this.changeElementStyle(hostElement, 'transition-delay', transitionDelay + 'ms');
      this.changeElementStyle(hostElement, 'opacity', opacity);
      this.changeElementStyle(hostElement, 'transform', transform);

      return fromEvent(hostElement, 'transitionend').pipe(take(1));
    });

    // Wait for all animation to finish, then destroy their elements
    this.hideMiniFab = forkJoin(obs).subscribe(() => (this.miniFabVisible = false));
  }

  private getTranslateFunction(value: string): string {
    const dir = this.parent.direction;
    const translateFn = dir === 'up' || dir === 'down' ? 'translateY' : 'translateX';
    const sign = dir === 'down' || dir === 'right' ? '-' : '';

    return translateFn + '(' + sign + value + ')';
  }

  private changeElementStyle(elem: any, style: string, value: string) {
    // FIXME - Find a way to create a "wrapper" around the action button(s) provided by the user, so we don't change it's style tag
    this.renderer.setStyle(elem, style, value);
  }
}

/** @dynamic @see https://github.com/angular/angular/issues/20351#issuecomment-344009887 */
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'fab-speed-dial',
  template: `
    <div class="fab-speed-dial-container">
      <ng-content select="fab-speed-dial-trigger"></ng-content>
      <ng-content select="fab-speed-dial-actions"></ng-content>
    </div>
  `,
  styleUrls: ['fab-speed-dial.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FabSpeedDialComponent implements OnDestroy, AfterContentInit {
  private isInitialized = false;
  // tslint:disable: variable-name
  private _direction: Direction = 'up';
  private _open = false;
  private _animationMode: AnimationMode = 'fling';
  private _fixed = false;
  // tslint:enable: variable-name
  private documentClickUnlistener: (() => void) | null = null;

  /**
   * Whether this speed dial is fixed on screen (user cannot change it by clicking)
   */
  @Input() get fixed(): boolean {
    return this._fixed;
  }

  set fixed(fixed: boolean) {
    this._fixed = fixed;
    this._processOutsideClickState();
  }

  /**
   * Whether this speed dial is opened
   */
  @HostBinding('class.fab-opened')
  @Input()
  get open(): boolean {
    return this._open;
  }

  set open(open: boolean) {
    const previousOpen = this._open;
    this._open = open;
    if (previousOpen !== this._open) {
      this.openChange.emit(this._open);
      if (this.isInitialized) {
        this.setActionsVisibility();
      }
    }
  }

  /**
   * The direction of the speed dial. Can be 'up', 'down', 'left' or 'right'
   */
  @Input() get direction(): Direction {
    return this._direction;
  }

  set direction(direction: Direction) {
    const previousDirection = this._direction;
    this._direction = direction;
    if (previousDirection !== this.direction) {
      this._setElementClass(previousDirection, false);
      this._setElementClass(this.direction, true);

      if (this.isInitialized) {
        this.setActionsVisibility();
      }
    }
  }

  /**
   * The animation mode to open the speed dial. Can be 'fling' or 'scale'
   */
  @Input() get animationMode(): AnimationMode {
    return this._animationMode;
  }

  set animationMode(animationMode: AnimationMode) {
    const previousAnimationMode = this._animationMode;
    this._animationMode = animationMode;
    if (previousAnimationMode !== this._animationMode) {
      this._setElementClass(previousAnimationMode, false);
      this._setElementClass(this.animationMode, true);

      if (this.isInitialized) {
        // To start another detect lifecycle and force the "close" on the action buttons
        Promise.resolve(null).then(() => (this.open = false));
      }
    }
  }

  @Output() openChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ContentChild(FabSpeedDialActionsComponent, { static: true }) childActions: FabSpeedDialActionsComponent;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngAfterContentInit(): void {
    this.isInitialized = true;
    this.setActionsVisibility();
    this._setElementClass(this.direction, true);
    this._setElementClass(this.animationMode, true);
  }

  ngOnDestroy() {
    this._unsetDocumentClickListener();
  }

  /**
   * Toggle the open state of this speed dial
   */
  public toggle(): void {
    this.open = !this.open;
  }

  @HostListener('click')
  _onClick(): void {
    if (!this.fixed && this.open) {
      this.open = false;
    }
  }

  setActionsVisibility(): void {
    if (!this.childActions) {
      return;
    }

    if (this.open) {
      this.childActions.show();
    } else {
      this.childActions.hide();
    }
    this._processOutsideClickState();
  }

  private _setElementClass(elemClass: string, isAdd: boolean): void {
    const finalClass = `fab-${elemClass}`;
    if (isAdd) {
      this.renderer.addClass(this.elementRef.nativeElement, finalClass);
    } else {
      this.renderer.removeClass(this.elementRef.nativeElement, finalClass);
    }
  }

  private _processOutsideClickState() {
    if (!this.fixed && this.open) {
      this._setDocumentClickListener();
    } else {
      this._unsetDocumentClickListener();
    }
  }

  private _setDocumentClickListener() {
    if (!this.documentClickUnlistener) {
      this.documentClickUnlistener = this.renderer.listen(this.document, 'click', () => {
        this.open = false;
      });
    }
  }

  private _unsetDocumentClickListener() {
    if (this.documentClickUnlistener) {
      this.documentClickUnlistener();
      this.documentClickUnlistener = null;
    }
  }
}

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'fab-speed-dial-trigger',
  template: `
    <ng-content select="[mat-fab]"></ng-content>
  `
})
export class FabSpeedDialTriggerComponent {
  private parent: FabSpeedDialComponent;

  /**
   * Whether this trigger should spin (360dg) while opening the speed dial
   */
  @HostBinding('class.fab-spin') get sp() {
    return this.spin;
  }

  @Input() spin = false;

  constructor(injector: Injector) {
    this.parent = injector.get(FabSpeedDialComponent);
  }

  @HostListener('click', ['$event'])
  _onClick(event: Event): void {
    if (!this.parent.fixed) {
      this.parent.toggle();
      event.stopPropagation();
    }
  }
}
