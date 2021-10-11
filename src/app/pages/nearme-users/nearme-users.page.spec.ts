import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NearmeUsersPage } from './nearme-users.page';

describe('NearmeUsersPage', () => {
  let component: NearmeUsersPage;
  let fixture: ComponentFixture<NearmeUsersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NearmeUsersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NearmeUsersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
