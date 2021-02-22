import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VlsplayerComponent } from './vlsplayer.component';

describe('VlsplayerComponent', () => {
  let component: VlsplayerComponent;
  let fixture: ComponentFixture<VlsplayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VlsplayerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VlsplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
