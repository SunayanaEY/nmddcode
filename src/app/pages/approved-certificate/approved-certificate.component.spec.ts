import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedCertificateComponent } from './approved-certificate.component';

describe('ApprovedCertificateComponent', () => {
  let component: ApprovedCertificateComponent;
  let fixture: ComponentFixture<ApprovedCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovedCertificateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovedCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
