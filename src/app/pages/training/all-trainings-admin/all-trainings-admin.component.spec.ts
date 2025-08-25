import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTrainingsAdminComponent } from './all-trainings-admin.component';

describe('AllTrainingsAdminComponent', () => {
  let component: AllTrainingsAdminComponent;
  let fixture: ComponentFixture<AllTrainingsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllTrainingsAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllTrainingsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
