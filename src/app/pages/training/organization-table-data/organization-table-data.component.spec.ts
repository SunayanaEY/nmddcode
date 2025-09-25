import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTableDataComponent } from './organization-table-data.component';

describe('OrganizationTableDataComponent', () => {
  let component: OrganizationTableDataComponent;
  let fixture: ComponentFixture<OrganizationTableDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationTableDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationTableDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
