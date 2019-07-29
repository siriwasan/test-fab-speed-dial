import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'test-mat-reactive-form';

  // tslint:disable-next-line: variable-name
  private _fixed = false;

  public open = false;
  public spin = true;
  public direction = 'up'; // up, down, left, right
  public animationMode = 'fling'; // fling, scale

  get fixed(): boolean {
    return this._fixed;
  }

  set fixed(fixed: boolean) {
    this._fixed = fixed;
    if (this._fixed) {
      this.open = true;
    }
  }

  doAction(action: string) {
    console.log(action);
  }
}
