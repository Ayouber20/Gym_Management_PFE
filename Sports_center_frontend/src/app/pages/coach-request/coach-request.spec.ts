import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachRequest } from './coach-request';

describe('CoachRequest', () => {
  let component: CoachRequest;
  let fixture: ComponentFixture<CoachRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(CoachRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
