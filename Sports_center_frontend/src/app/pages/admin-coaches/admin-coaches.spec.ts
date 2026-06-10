import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCoaches } from './admin-coaches';

describe('AdminCoaches', () => {
  let component: AdminCoaches;
  let fixture: ComponentFixture<AdminCoaches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCoaches],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCoaches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
