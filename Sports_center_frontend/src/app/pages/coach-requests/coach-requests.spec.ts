import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachRequests } from './coach-requests';

describe('CoachRequests', () => {
  let component: CoachRequests;
  let fixture: ComponentFixture<CoachRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(CoachRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
