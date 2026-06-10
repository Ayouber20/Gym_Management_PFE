import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCoachRequests } from './admin-coach-requests';

describe('AdminCoachRequests', () => {
  let component: AdminCoachRequests;
  let fixture: ComponentFixture<AdminCoachRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCoachRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCoachRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
