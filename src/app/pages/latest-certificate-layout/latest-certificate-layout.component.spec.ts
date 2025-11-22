import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestCertificateLayoutComponent } from './latest-certificate-layout.component';

describe('LatestCertificateLayoutComponent', () => {
  let component: LatestCertificateLayoutComponent;
  let fixture: ComponentFixture<LatestCertificateLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatestCertificateLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LatestCertificateLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
