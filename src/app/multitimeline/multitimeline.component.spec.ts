import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultitimelineComponent } from './multitimeline.component';

describe('MultitimelineComponent', () => {
  let component: MultitimelineComponent;
  let fixture: ComponentFixture<MultitimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultitimelineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultitimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
