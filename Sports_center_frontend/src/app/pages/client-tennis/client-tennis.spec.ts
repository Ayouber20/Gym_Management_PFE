import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTennis } from './client-tennis';

describe('ClientTennis', () => {
  let component: ClientTennis;
  let fixture: ComponentFixture<ClientTennis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTennis],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientTennis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
