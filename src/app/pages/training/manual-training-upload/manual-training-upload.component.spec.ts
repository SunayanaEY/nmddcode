import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualTrainingUploadComponent } from './manual-training-upload.component';

describe('ManualTrainingUploadComponent', () => {
  let component: ManualTrainingUploadComponent;
  let fixture: ComponentFixture<ManualTrainingUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualTrainingUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualTrainingUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
