import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-editions',
  imports: [RouterLink],
  templateUrl: './editions.html',
})
export class Editions implements OnInit {
  editionNum = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(p => { this.editionNum = p['id'] ?? ''; });
  }
}
