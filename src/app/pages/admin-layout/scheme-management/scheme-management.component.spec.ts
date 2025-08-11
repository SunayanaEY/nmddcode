import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeManagementComponent } from './scheme-management.component';

describe('SchemeManagementComponent', () => {
  let component: SchemeManagementComponent;
  let fixture: ComponentFixture<SchemeManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemeManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchemeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
