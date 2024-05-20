import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkDetailsPage } from './work-details.page';

describe('WorkDetailsPage', () => {
  let component: WorkDetailsPage;
  let fixture: ComponentFixture<WorkDetailsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(WorkDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
