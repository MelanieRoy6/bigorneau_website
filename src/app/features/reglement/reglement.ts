import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-reglement',
  imports: [RouterLink],
  templateUrl: './reglement.html',
})
export class Reglement {
  constructor(private titleSvc: Title, private metaSvc: Meta) {
    this.titleSvc.setTitle('Le règlement des olympiades — Bigorneaux Party');
    this.metaSvc.updateTag({ name: 'description', content: 'Binômes tirés au sort, épreuves imaginées par les vainqueurs, trophée et muscadet officiel : découvre les règles de la Bigorneaux Party.' });
  }
}
