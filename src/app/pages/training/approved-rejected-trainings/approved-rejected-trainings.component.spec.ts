import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedRejectedTrainingsComponent } from './approved-rejected-trainings.component';

describe('ApprovedRejectedTrainingsComponent', () => {
  let component: ApprovedRejectedTrainingsComponent;
  let fixture: ComponentFixture<ApprovedRejectedTrainingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovedRejectedTrainingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovedRejectedTrainingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
