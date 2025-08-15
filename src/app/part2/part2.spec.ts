import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Part2 } from './part2';

describe('Part2', () => {
  let component: Part2;
  let fixture: ComponentFixture<Part2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Part2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Part2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
