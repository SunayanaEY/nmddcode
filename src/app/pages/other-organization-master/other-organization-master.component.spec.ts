import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherOrganizationMasterComponent } from './other-organization-master.component';

describe('OtherOrganizationMasterComponent', () => {
  let component: OtherOrganizationMasterComponent;
  let fixture: ComponentFixture<OtherOrganizationMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherOrganizationMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherOrganizationMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
