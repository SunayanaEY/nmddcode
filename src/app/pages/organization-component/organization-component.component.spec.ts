import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationComponentComponent } from './organization-component.component';

describe('OrganizationComponentComponent', () => {
  let component: OrganizationComponentComponent;
  let fixture: ComponentFixture<OrganizationComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
