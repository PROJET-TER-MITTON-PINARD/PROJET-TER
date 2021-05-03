import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TimelineComponent } from './timeline/timeline.component';
import { MultitimelineComponent } from './multitimeline/multitimeline.component';
import { FixetimelineComponent } from './fixetimeline/fixetimeline.component';

@NgModule({
  declarations: [
    AppComponent,
    TimelineComponent,
    MultitimelineComponent,
    FixetimelineComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
