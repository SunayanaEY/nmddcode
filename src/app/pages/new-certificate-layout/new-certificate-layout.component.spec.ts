import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCertificateLayoutComponent } from './new-certificate-layout.component';

describe('NewCertificateLayoutComponent', () => {
  let component: NewCertificateLayoutComponent;
  let fixture: ComponentFixture<NewCertificateLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewCertificateLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCertificateLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
