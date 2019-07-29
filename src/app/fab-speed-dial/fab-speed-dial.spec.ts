import { async, TestBed } from '@angular/core/testing';

import { FabSpeedDialActionsComponent, FabSpeedDialComponent, FabSpeedDialTriggerComponent } from './fab-speed-dial';
import { By } from '@angular/platform-browser';
import { Component, ViewChild } from '@angular/core';

/** Test component that contains an fab speed dial buttons */
@Component({
  template: `
    <div>
      <fab-speed-dial [direction]="direction" [(open)]="open" #fabSpeedDial>
        <fab-speed-dial-trigger>
          <button mat-fab>check</button>
        </fab-speed-dial-trigger>

        <fab-speed-dial-actions #fabActions>
          <button mat-mini-fab>add</button>
          <button mat-mini-fab>edit</button>
          <button mat-mini-fab>menu</button>
        </fab-speed-dial-actions>
      </fab-speed-dial>
      <div class="testElement">Test element</div>
    </div>
  `
})
class TestAppComponent {
  @ViewChild(FabSpeedDialActionsComponent, { static: true })
  public fabActions: FabSpeedDialActionsComponent;
  @ViewChild(FabSpeedDialComponent, { static: true })
  public fabSpeedDial: FabSpeedDialComponent;
  public direction = 'up';
  public open: boolean;

  clickCount = 0;
  isDisabled = false;
  rippleDisabled = false;

  tabIndex: number;

  increment() {
    this.clickCount++;
  }
}

describe('FabSpeedDial', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [
        FabSpeedDialComponent,
        FabSpeedDialTriggerComponent,
        FabSpeedDialActionsComponent,
        TestAppComponent
      ]
    });
  }));

  it('should apply direction class based on direction', () => {
    const fixture = TestBed.createComponent(TestAppComponent);

    const testComponent = fixture.debugElement.componentInstance;
    const speedDialDebugElement = fixture.debugElement.query(By.css('fab-speed-dial'));

    fixture.detectChanges();
    expect(speedDialDebugElement.nativeElement.classList.contains('fab-up')).toBeTruthy();

    testComponent.direction = 'down';
    fixture.detectChanges();
    expect(speedDialDebugElement.nativeElement.classList.contains('fab-down')).toBeTruthy();

    testComponent.direction = 'right';
    fixture.detectChanges();
    expect(speedDialDebugElement.nativeElement.classList.contains('fab-right')).toBeTruthy();

    testComponent.direction = 'left';
    fixture.detectChanges();
    expect(speedDialDebugElement.nativeElement.classList.contains('fab-left')).toBeTruthy();
    // also check if the other class from before is removed
    expect(speedDialDebugElement.nativeElement.classList.contains('fab-right')).toBeFalsy();
  });

  it('should apply opened class trigger button clicked', () => {
    const fixture = TestBed.createComponent(TestAppComponent);
    const speedDialDebugElement = fixture.debugElement.query(By.css('fab-speed-dial'));
    const triggerButtonDebugElement = fixture.debugElement.query(By.css('fab-speed-dial-trigger button'));

    triggerButtonDebugElement.nativeElement.click();
    fixture.detectChanges();
    expect(speedDialDebugElement.nativeElement.classList.contains('fab-opened')).toBeTruthy();
    triggerButtonDebugElement.nativeElement.click();

    fixture.detectChanges();
    // check if the class is removed afterwards
    expect(speedDialDebugElement.nativeElement.classList.contains('fab-opened')).toBeFalsy();
  });

  it('should apply opened class when property open is set', () => {
    const fixture = TestBed.createComponent(TestAppComponent);

    const testComponent = fixture.debugElement.componentInstance;
    const speedDialDebugElement = fixture.debugElement.query(By.css('fab-speed-dial'));

    testComponent.open = true;
    fixture.detectChanges();
    expect(speedDialDebugElement.nativeElement.classList.contains('fab-opened')).toBeTruthy();
    testComponent.open = false;
    fixture.detectChanges();
    // check if the class is removed afterwards
    expect(speedDialDebugElement.nativeElement.classList.contains('fab-opened')).toBeFalsy();
  });

  it('should close when action button is clicked', () => {
    const fixture = TestBed.createComponent(TestAppComponent);

    const testComponent = fixture.debugElement.componentInstance;
    const speedDialDebugElement = fixture.debugElement.query(By.css('fab-speed-dial'));

    testComponent.open = true;
    fixture.detectChanges();
    expect(speedDialDebugElement.nativeElement.classList.contains('fab-opened')).toBeTruthy();

    const actionButton = fixture.debugElement.query(By.css('fab-speed-dial-actions button:first-child'));
    actionButton.nativeElement.click();
    fixture.detectChanges();
    // check if the class is removed after click
    expect(speedDialDebugElement.nativeElement.classList.contains('fab-opened')).toBeFalsy();
  });

  it('should call "show" method of all fabActions', () => {
    const fixture = TestBed.createComponent(TestAppComponent);
    const testComponent = fixture.debugElement.componentInstance;

    spyOn(fixture.componentInstance.fabSpeedDial, 'setActionsVisibility').and.callThrough();
    spyOn(fixture.componentInstance.fabActions, 'show').and.callThrough();

    testComponent.open = true;
    fixture.detectChanges();

    expect(fixture.componentInstance.fabSpeedDial.setActionsVisibility).toHaveBeenCalled();
    expect(fixture.componentInstance.fabActions.show).toHaveBeenCalled();
  });

  it('should click on document testElement to hide all fabActions', () => {
    const fixture = TestBed.createComponent(TestAppComponent);
    const testComponent = fixture.debugElement.componentInstance;

    const actionsSpy = spyOn(fixture.componentInstance.fabSpeedDial, 'setActionsVisibility').and.callThrough();
    spyOn(fixture.componentInstance.fabActions, 'show').and.callThrough();
    spyOn(fixture.componentInstance.fabActions, 'hide').and.callThrough();

    testComponent.open = true;
    fixture.detectChanges();

    expect(fixture.componentInstance.fabSpeedDial.setActionsVisibility).toHaveBeenCalled();
    expect(fixture.componentInstance.fabActions.show).toHaveBeenCalled();
    actionsSpy.calls.reset();

    const actionButton = fixture.debugElement.query(By.css('.testElement'));
    actionButton.nativeElement.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.fabSpeedDial.setActionsVisibility).toHaveBeenCalled();
    expect(fixture.componentInstance.fabActions.hide).toHaveBeenCalled();
  });
});
