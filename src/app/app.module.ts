import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TimelineComponent } from './timeline/timeline.component';
import { MultitimelineComponent } from './multitimeline/multitimeline.component';
import { FixetimelineComponent } from './fixetimeline/fixetimeline.component';
import { BooleantimelineComponent } from './booleantimeline/booleantimeline.component';

@NgModule({
  declarations: [
    AppComponent,
    TimelineComponent,
    MultitimelineComponent,
    FixetimelineComponent,
    BooleantimelineComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
