import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSectionComponent } from './table-section.component';

describe('TableSectionComponent', () => {
  let component: TableSectionComponent;
  let fixture: ComponentFixture<TableSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
