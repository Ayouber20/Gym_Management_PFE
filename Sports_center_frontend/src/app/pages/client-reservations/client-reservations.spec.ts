import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientReservations } from './client-reservations';

describe('ClientReservations', () => {
  let component: ClientReservations;
  let fixture: ComponentFixture<ClientReservations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientReservations],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientReservations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
