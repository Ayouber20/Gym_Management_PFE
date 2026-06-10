import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientCoachRequests } from './client-coach-requests';

describe('ClientCoachRequests', () => {
  let component: ClientCoachRequests;
  let fixture: ComponentFixture<ClientCoachRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientCoachRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientCoachRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
