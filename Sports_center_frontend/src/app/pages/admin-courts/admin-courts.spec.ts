import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCourts } from './admin-courts';

describe('AdminCourts', () => {
  let component: AdminCourts;
  let fixture: ComponentFixture<AdminCourts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCourts],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCourts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
