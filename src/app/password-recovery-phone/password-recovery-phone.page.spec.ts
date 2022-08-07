import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PasswordRecoveryPhonePage } from './password-recovery-phone.page';

describe('PasswordRecoveryPhonePage', () => {
  let component: PasswordRecoveryPhonePage;
  let fixture: ComponentFixture<PasswordRecoveryPhonePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordRecoveryPhonePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordRecoveryPhonePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
