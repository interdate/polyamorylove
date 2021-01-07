import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewUsersPage } from './new-users.page';

describe('NewUsersPage', () => {
  let component: NewUsersPage;
  let fixture: ComponentFixture<NewUsersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewUsersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewUsersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
