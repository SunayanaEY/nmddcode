import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateLayoutComponent } from './certificate-layout.component';

describe('CertificateLayoutComponent', () => {
  let component: CertificateLayoutComponent;
  let fixture: ComponentFixture<CertificateLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificateLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
