import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GyroscopeComponent } from './gyroscope.component';

describe('GyroscopeComponent', () => {
  let component: GyroscopeComponent;
  let fixture: ComponentFixture<GyroscopeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GyroscopeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GyroscopeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
