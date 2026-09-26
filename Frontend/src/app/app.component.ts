import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
public class AppComponent {
  title = 'SmartRide - Covoiturage Intelligent par IA';
  activeTab = 'search';

  searchQuery = { origin: '', destination: '', date: '' };
  
  mockMatches = [
    {
      id: 'TRIP-101',
      driver: 'Sami Mansouri',
      score: 98,
      rating: 4.9,
      departureTime: '08:15',
      origin: 'Ariana, Tunis',
      destination: 'Les Berges du Lac 2',
      price: '8.5 TND',
      seats: 3
    },
    {
      id: 'TRIP-102',
      driver: 'Amira Ben Salah',
      score: 94,
      rating: 4.8,
      departureTime: '08:30',
      origin: 'Ennasr 2',
      destination: 'Centre Ville Tunis',
      price: '6.0 TND',
      seats: 2
    }
  ];

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
