import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Piscine } from './piscine';

describe('Piscine', () => {
  let component: Piscine;
  let fixture: ComponentFixture<Piscine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Piscine],
    }).compileComponents();

    fixture = TestBed.createComponent(Piscine);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
