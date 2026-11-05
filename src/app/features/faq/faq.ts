import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

interface Question { q: string; a: string[] }

@Component({
  selector: 'app-faq',
  imports: [RouterLink],
  templateUrl: './faq.html',
})
export class Faq {
  readonly questions: Question[] = [
    {
      q: 'Comment bien cracher son bigorneau ?',
      a: [
        "Chacun sa technique. Certains le trempent dans le muscadet pour oublier le côté salé ; d'autres prennent une grande inspiration, visent l'horizon et croient très fort.",
        "Un seul avertissement : le petit mollusque a une légère tendance à baver après coup. Le bigorneau ne se rend pas, il laisse des traces.",
      ],
    },
    {
      q: 'Faut-il être bien assuré ?',
      a: [
        "Oui, c'est préférable. Pense même à une complémentaire santé en cas de déboîtage d'épaule lors d'une partie de rugby improvisé.",
        "L'organisation décline toute responsabilité sur les genoux, les épaules, les chevilles et les amours-propres.",
      ],
    },
    {
      q: 'Comment s’habiller ?',
      a: [
        "Tenue correcte exigée : au moins un slip. Après, on s'en fout de toute façon, tu termineras recouvert de vase.",
        "Pour les chaussures, prévois celles que tu ne reverras plus jamais propres. Elles feront de très beaux souvenirs.",
      ],
    },
    {
      q: 'Je ne sais pas cuisiner, c’est grave ?',
      a: [
        "Pas du tout : les repas (vendredi soir, samedi midi, apéro, samedi soir…) sont tirés au sort, et tout le monde met la main à la patte, sans exception. Le sort est aveugle, mais il n'est pas sans pitié : tu cuisineras avec d'autres, jamais seul face à la casserole.",
        "Et si le résultat est discutable, c'est qu'il est « rustique ». C'est le mot officiel.",
      ],
    },
    {
      q: 'Peut-on choisir son binôme ?',
      a: [
        "Non. Article 1 du règlement : les binômes sont tirés au sort en début de week-end. Pas de choix, pas de négociation, pas de pot-de-vin (le muscadet est accepté, mais ne change rien).",
      ],
    },
    {
      q: 'Et si l’arbitre se trompe ?',
      a: [
        "Les arbitres sont les vainqueurs de l'édition précédente. Toute décision arbitrale est définitive, irrévocable, et généralement contestée. La contestation fait partie du spectacle.",
      ],
    },
    {
      q: 'À quoi sert le trophée, à part prendre la poussière ?',
      a: [
        "Le trophée se remet en jeu chaque année. Celui qui le gagne repart avec la gloire éternelle (jusqu'à l'année suivante) et la responsabilité d'imaginer les épreuves de l'édition d'après. Noblesse oblige, et corvée aussi.",
      ],
    },
    {
      q: 'Faut-il savoir nager ?',
      a: [
        "Pas obligatoire. Mais le passage du Gois est submersible : on consulte les horaires de marée, pas son horoscope. Si l'eau monte, on ne négocie pas avec elle.",
      ],
    },
    {
      q: 'Combien de muscadet puis-je boire ?',
      a: [
        "La consommation est libre mais responsable. Le muscadet est la boisson officielle, pas un sport de combat (même si certains s'y entraînent).",
        "L'organisation décline toute responsabilité sur les performances sportives influencées par un verre de trop. Pense à boire de l'eau, et à ne pas prendre le volant : un bigorneau, ça ne conduit pas.",
      ],
    },
    {
      q: 'Je suis végétarien, allergique, ou je n’aime pas les bigorneaux : je fais comment ?',
      a: [
        "Préviens l'organisation à l'inscription, pour que les cuisiniers du jour en tiennent compte. Pour la compétition, on peut cracher à peu près n'importe quel petit objet : le règlement s'intéresse à la distance, pas au menu.",
      ],
    },
    {
      q: 'Peut-on tricher ?',
      a: [
        "On préfère parler de stratégie. Les arbitres, eux, ont d'autres mots, et le dernier mot.",
      ],
    },
    {
      q: 'Quand et où ça se passe ?',
      a: [
        "Le week-end du 5 et 6 juin 2027, du côté de Beauvoir-sur-Mer, au passage du Gois. Les détails pratiques arrivent avec les inscriptions : rapproche-toi de la Vendée en attendant.",
      ],
    },
  ];

  constructor(private titleSvc: Title, private metaSvc: Meta) {
    this.titleSvc.setTitle('FAQ — Bigorneaux Party');
    this.metaSvc.updateTag({ name: 'description', content: 'Comment bien cracher son bigorneau, quoi porter, faut-il être assuré ? Toutes les questions (sérieuses ou pas) sur la Bigorneaux Party.' });
  }
}
