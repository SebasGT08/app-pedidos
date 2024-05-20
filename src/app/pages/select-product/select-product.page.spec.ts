import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectProductPage } from './select-product.page';

describe('SelectProductPage', () => {
  let component: SelectProductPage;
  let fixture: ComponentFixture<SelectProductPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectProductPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
