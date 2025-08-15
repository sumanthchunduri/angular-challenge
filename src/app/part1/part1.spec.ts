import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Part1 } from './part1';

describe('Part1', () => {
  let component: Part1;
  let fixture: ComponentFixture<Part1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Part1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Part1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
