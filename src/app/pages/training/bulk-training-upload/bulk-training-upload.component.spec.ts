import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkTrainingUploadComponent } from './bulk-training-upload.component';

describe('BulkTrainingUploadComponent', () => {
  let component: BulkTrainingUploadComponent;
  let fixture: ComponentFixture<BulkTrainingUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkTrainingUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkTrainingUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
