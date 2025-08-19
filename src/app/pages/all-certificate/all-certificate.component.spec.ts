import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCertificateComponent } from './all-certificate.component';

describe('AllCertificateComponent', () => {
  let component: AllCertificateComponent;
  let fixture: ComponentFixture<AllCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCertificateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
