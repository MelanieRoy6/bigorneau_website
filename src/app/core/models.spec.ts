import { describe, expect, it } from 'vitest';
import { payStatus } from './models';

describe('payStatus', () => {
  it('rien versé → en attente', () => expect(payStatus(0, 40)).toBe('pending'));
  it('versement partiel', () => expect(payStatus(15, 40)).toBe('partial'));
  it('montant atteint → payé', () => expect(payStatus(40, 40)).toBe('paid'));
  it('montant dû non défini : tout versement vaut payé', () => expect(payStatus(10, null)).toBe('paid'));
});
