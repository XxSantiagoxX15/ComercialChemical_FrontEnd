import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceCalculatorComponent } from './price-calculator.component';

describe('PriceCalculator', () => {
  let component: PriceCalculatorComponent;
  let fixture: ComponentFixture<PriceCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceCalculatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceCalculatorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
