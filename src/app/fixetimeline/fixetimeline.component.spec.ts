import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixetimelineComponent } from './fixetimeline.component';

describe('FixetimelineComponent', () => {
  let component: FixetimelineComponent;
  let fixture: ComponentFixture<FixetimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FixetimelineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FixetimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
