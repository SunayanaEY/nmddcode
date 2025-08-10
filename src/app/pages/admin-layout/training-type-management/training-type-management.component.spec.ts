import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingTypeManagementComponent } from './training-type-management.component';

describe('TrainingTypeManagementComponent', () => {
  let component: TrainingTypeManagementComponent;
  let fixture: ComponentFixture<TrainingTypeManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingTypeManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingTypeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
