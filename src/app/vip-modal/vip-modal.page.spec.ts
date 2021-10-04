import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VipModalPage } from './vip-modal.page';

describe('VipModalPage', () => {
  let component: VipModalPage;
  let fixture: ComponentFixture<VipModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VipModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VipModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
