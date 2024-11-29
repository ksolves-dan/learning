// src/app/app.component.ts
import { Component } from '@angular/core';
import { HeroesComponent } from './heroes/heroes.component';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MessagesComponent } from './messages/messages.component';

@Component({
  selector: 'app-root',
  standalone: true, // AppComponent is also standalone
  imports: [RouterOutlet, RouterLink, HeroesComponent, MessagesComponent], // Import HeroesComponent here
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Tour of Heroes';
}