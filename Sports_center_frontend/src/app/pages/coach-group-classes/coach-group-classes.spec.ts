import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachGroupClasses } from './coach-group-classes';

describe('CoachGroupClasses', () => {
  let component: CoachGroupClasses;
  let fixture: ComponentFixture<CoachGroupClasses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachGroupClasses],
    }).compileComponents();

    fixture = TestBed.createComponent(CoachGroupClasses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
