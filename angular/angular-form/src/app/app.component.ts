import { Component } from '@angular/core';
import { UserRegistrationComponent } from './user-registration/user-registration.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UserRegistrationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'User Registration App';
}