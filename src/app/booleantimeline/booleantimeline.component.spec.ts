import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooleantimelineComponent } from './booleantimeline.component';

describe('BooleantimelineComponent', () => {
  let component: BooleantimelineComponent;
  let fixture: ComponentFixture<BooleantimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BooleantimelineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BooleantimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
