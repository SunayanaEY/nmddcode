import { TableComponent } from './table.component';

describe('TableComponent', () => {
  it('generates a unique pagination id for every table instance', () => {
    const firstTable = new TableComponent({} as any, {} as any);
    const secondTable = new TableComponent({} as any, {} as any);

    expect(firstTable.paginationId).not.toBe(secondTable.paginationId);
  });
});