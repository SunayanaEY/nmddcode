import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyTrainingsComponent } from './verify-trainings.component';

describe('VerifyTrainingsComponent', () => {
  let component: VerifyTrainingsComponent;
  let fixture: ComponentFixture<VerifyTrainingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyTrainingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyTrainingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
