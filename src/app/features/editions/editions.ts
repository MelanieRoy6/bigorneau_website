import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';

interface Photo { src: string; alt: string; }

const PHOTOS: Record<string, Photo[]> = {
  '4': [
    { src: 'Picture%202026/copains1.jpeg', alt: 'Les copains' },
    { src: 'Picture%202026/passage_gois_1.jpeg', alt: 'Passage du Gois' },
    { src: 'Picture%202026/passage_gois_2.jpeg', alt: 'Passage du Gois' },
    { src: 'Picture%202026/passage_gois_3.jpeg', alt: 'Passage du Gois' },
    { src: 'Picture%202026/passage_gois_4.jpeg', alt: 'Passage du Gois' },
    { src: 'Picture%202026/passage_gois_5.jpeg', alt: 'Passage du Gois' },
    { src: 'Picture%202026/passage_gois_6.jpeg', alt: 'Passage du Gois' },
    { src: 'Picture%202026/passage_gois_7.jpeg', alt: 'Passage du Gois' },
    { src: 'Picture%202026/rock_concert.jpeg', alt: 'Concert de rock' },
    { src: 'Picture%202026/winner2026.jpeg', alt: 'Les vainqueurs' },
    { src: 'Picture%202026/%C3%A0table.jpeg', alt: 'À table' },
  ],
  '3': [
    { src: 'Picture%202025/affiche_grange.jpeg', alt: 'Affiche de la grange' },
    { src: 'Picture%202025/copains1.jpeg', alt: 'Les copains' },
    { src: 'Picture%202025/copains2.jpeg', alt: 'Les copains' },
    { src: 'Picture%202025/crachat_helena.jpeg', alt: 'Crachat de bigorneau' },
    { src: 'Picture%202025/passage_gois1.jpeg', alt: 'Passage du Gois' },
    { src: 'Picture%202025/rugby1.jpeg', alt: 'Rugby improvisé' },
    { src: 'Picture%202025/rugby2.jpeg', alt: 'Rugby improvisé' },
    { src: 'Picture%202025/rugby3.jpeg', alt: 'Rugby improvisé' },
    { src: 'Picture%202025/victory_imitation.jpeg', alt: 'Imitation de victoire' },
  ]
};

@Component({
  selector: 'app-editions',
  imports: [RouterLink],
  templateUrl: './editions.html',
})
export class Editions implements OnInit {
  editionNum = '';
  photos: Photo[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(p => {
      this.editionNum = p['id'] ?? '';
      this.photos = PHOTOS[this.editionNum] ?? [];
    });
  }
}
