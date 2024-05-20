import { ComponentFixture, TestBed} from '@angular/core/testing';
import { HorarioDetailsPage } from './horario-details.page';

describe('HorarioDetailsPage', () => {
  let component: HorarioDetailsPage;
  let fixture: ComponentFixture<HorarioDetailsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HorarioDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
