import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachSessions } from './coach-sessions';

describe('CoachSessions', () => {
  let component: CoachSessions;
  let fixture: ComponentFixture<CoachSessions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachSessions],
    }).compileComponents();

    fixture = TestBed.createComponent(CoachSessions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
