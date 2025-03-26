import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngleMeterComponent } from './angle-meter.component';

describe('AngleMeterComponent', () => {
  let component: AngleMeterComponent;
  let fixture: ComponentFixture<AngleMeterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngleMeterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AngleMeterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
