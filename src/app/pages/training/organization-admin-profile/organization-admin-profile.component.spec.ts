import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationAdminProfileComponent } from './organization-admin-profile.component';

describe('OrganizationAdminProfileComponent', () => {
  let component: OrganizationAdminProfileComponent;
  let fixture: ComponentFixture<OrganizationAdminProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationAdminProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationAdminProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
