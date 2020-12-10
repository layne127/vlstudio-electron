import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenceViewComponent } from './scence-view.component';

describe('ScenceViewComponent', () => {
  let component: ScenceViewComponent;
  let fixture: ComponentFixture<ScenceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScenceViewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScenceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
