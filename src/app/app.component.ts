import { Component } from '@angular/core';

interface Option {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public options: Option[] = [
    { label: 'Email', icon: 'email' },
    { label: 'Copy', icon: 'content_copy' },
    { label: 'Message', icon: 'message' }
  ];

  public hasLabels = true;
}
