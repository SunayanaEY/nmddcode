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

  it('should not display center logo if logoPath3 is missing', () => {
    component.data = {
      logoPath1: 'path1.png',
      logoPath2: null,
      logoPath3: null
    };
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const centerLogo = compiled.querySelector('.logo-center');
    expect(centerLogo).toBeNull();
  });

  it('should display center logo if logoPath3 is present', () => {
    component.data = {
      logoPath1: 'path1.png',
      logoPath2: null,
      logoPath3: 'path3.png'
    };
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const centerLogo = compiled.querySelector('.logo-center');
    expect(centerLogo).toBeTruthy();
  });
});
