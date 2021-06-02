import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MessengerNotificationsPage } from './messenger-notifications.page';

describe('MessengerNotificationsPage', () => {
  let component: MessengerNotificationsPage;
  let fixture: ComponentFixture<MessengerNotificationsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessengerNotificationsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MessengerNotificationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
