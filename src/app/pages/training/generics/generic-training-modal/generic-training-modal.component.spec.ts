import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericTrainingModalComponent } from './generic-training-modal.component';

describe('GenericTrainingModalComponent', () => {
  let component: GenericTrainingModalComponent;
  let fixture: ComponentFixture<GenericTrainingModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericTrainingModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericTrainingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
