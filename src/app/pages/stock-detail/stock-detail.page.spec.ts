import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockDetailPage } from './stock-detail.page';

describe('StockDetailPage', () => {
  let component: StockDetailPage;
  let fixture: ComponentFixture<StockDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StockDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
