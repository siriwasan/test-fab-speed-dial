import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { FabSpeedDialModule } from './fab-speed-dial/fab-speed-dial.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, MaterialModule, FabSpeedDialModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
