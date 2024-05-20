import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectClientPage } from './select-client.page';

describe('SelectClientPage', () => {
  let component: SelectClientPage;
  let fixture: ComponentFixture<SelectClientPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectClientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
