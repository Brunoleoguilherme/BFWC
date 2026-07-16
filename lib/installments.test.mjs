// Testes da lógica de pagamento (roda com: npm test  ou  node --test lib/installments.test.mjs)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CATEGORY_QUOTAS, countCategories, normalizeSelection, selectionTotalReais,
  optionTotalReais, selectionSummary, totalCentsForTeam, paidCategoriesOf,
  enabledAthletesFor, fullCategoryFor, computeInstallments, activePlanSize,
} from './installments.js';

const cat2 = 'Masculino,Feminino';
const cat3 = 'Masculino,Feminino,Sub-15';

test('countCategories', () => {
  assert.equal(countCategories(cat2), 2);
  assert.equal(countCategories('Masculino'), 1);
  assert.equal(countCategories(''), 1);
  assert.equal(countCategories('Masculino,Feminino,Sub-15,Sub-12'), 4);
});

test('normalizeSelection: subconjunto (paga só Feminino)', () => {
  assert.deepEqual(normalizeSelection({ Feminino: { option: '1' } }, cat2), { Feminino: { option: '1' } });
});
test('normalizeSelection: completo', () => {
  assert.deepEqual(
    normalizeSelection({ Masculino: { option: '1' }, Feminino: { option: '2', qty: 15 } }, cat2),
    { Masculino: { option: '1' }, Feminino: { option: '2', qty: 15 } });
});
test('normalizeSelection: vazio => null', () => { assert.equal(normalizeSelection({}, cat2), null); });
test('normalizeSelection: opção inválida => null', () => { assert.equal(normalizeSelection({ Feminino: { option: '9' } }, cat2), null); });
test('normalizeSelection: ignora categoria não inscrita', () => {
  assert.deepEqual(normalizeSelection({ 'Sub-12': { option: '1' }, Feminino: { option: '1' } }, cat2), { Feminino: { option: '1' } });
});
test('normalizeSelection: clampa qty da opção 2 (12..20)', () => {
  assert.equal(normalizeSelection({ Feminino: { option: '2', qty: 5 } }, 'Feminino').Feminino.qty, 12);
  assert.equal(normalizeSelection({ Feminino: { option: '2', qty: 99 } }, 'Feminino').Feminino.qty, 20);
});

test('selectionTotalReais', () => {
  assert.equal(selectionTotalReais({ Masculino: { option: '1' } }), 2000);
  assert.equal(selectionTotalReais({ Feminino: { option: '2', qty: 15 } }), 800 + 90 * 15);
});
test('optionTotalReais', () => {
  assert.equal(optionTotalReais('1', 3), 6000);
  assert.equal(optionTotalReais('2', 2, 10), 800 * 2 + 90 * 10);
});

test('totalCentsForTeam: seleção parcial usa só o pago', () => {
  assert.equal(totalCentsForTeam({ category: cat2, payment_selection: { Feminino: { option: '1' } } }), 2000 * 100);
});
test('totalCentsForTeam: legado por opção soma todas as categorias', () => {
  assert.equal(totalCentsForTeam({ category: cat2, payment_option: '1' }), 2000 * 2 * 100);
});

test('selectionSummary', () => {
  assert.deepEqual(selectionSummary({ Masculino: { option: '1' } }), { option: '1', qty: 0 });
  assert.deepEqual(selectionSummary({ Masculino: { option: '2', qty: 12 } }), { option: '2', qty: 12 });
  assert.deepEqual(selectionSummary({ Masculino: { option: '1' }, Feminino: { option: '2', qty: 15 } }), { option: 'mix', qty: 15 });
});

test('paidCategoriesOf: seleção, legado e string JSON', () => {
  assert.deepEqual(paidCategoriesOf({ category: cat2, payment_selection: { Masculino: { option: '1' } } }), ['Masculino']);
  assert.deepEqual(paidCategoriesOf({ category: cat2 }), ['Masculino', 'Feminino']);
  assert.deepEqual(paidCategoriesOf({ category: 'Masculino', payment_selection: JSON.stringify({ Masculino: { option: '1' } }) }), ['Masculino']);
});

test('enabledAthletesFor', () => {
  assert.equal(enabledAthletesFor({ category: cat2, payment_selection: { Masculino: { option: '1' } } }), 20); // IPN
  assert.equal(enabledAthletesFor({ category: cat3, payment_selection: { Masculino: { option: '1' }, Feminino: { option: '1' }, 'Sub-15': { option: '1' } } }), 60);
  assert.equal(enabledAthletesFor({ category: 'Feminino', payment_selection: { Feminino: { option: '2', qty: 15 } } }), 15);
  assert.equal(enabledAthletesFor({ category: cat2, payment_option: '1' }), 40); // legado, 2 cats
  assert.equal(enabledAthletesFor({ category: cat2, payment_selection: { Masculino: { option: '1' }, Feminino: { option: '2', qty: 18 } } }), 38); // mix
});

function mockSupabase(teams) {
  return { from() { return this; }, select() { return this; }, eq() { return Promise.resolve({ data: teams }); } };
}
test('fullCategoryFor: conta só a categoria paga (parcial não ocupa a não paga)', async () => {
  const teams = Array.from({ length: CATEGORY_QUOTAS.Feminino }, (_, i) => ({ id: 't' + i, category: cat2, payment_selection: { Feminino: { option: '1' } } }));
  assert.equal(await fullCategoryFor(mockSupabase(teams), 'novo', 'Masculino'), null); // Masc: 0 pagos reais
  assert.equal(await fullCategoryFor(mockSupabase(teams), 'novo', 'Feminino'), 'Feminino'); // Fem: cota cheia
});
test('fullCategoryFor: abaixo da cota => null', async () => {
  const teams = [{ id: 'a', category: 'Masculino', payment_selection: { Masculino: { option: '1' } } }];
  assert.equal(await fullCategoryFor(mockSupabase(teams), 'novo', 'Masculino'), null);
});

test('computeInstallments 3x: soma o total e última absorve o arredondamento', () => {
  const p = computeInstallments(2000, 3);
  assert.equal(p.length, 3);
  assert.equal(p.reduce((s, x) => s + x.amount_cents, 0), 2000 * 100);
  assert.deepEqual(p.map((x) => x.due_date), ['2026-07-20', '2026-08-20', '2026-09-20']);
});
test('computeInstallments 1x', () => {
  const p = computeInstallments(2000, 1);
  assert.equal(p.length, 1);
  assert.equal(p[0].amount_cents, 2000 * 100);
  assert.equal(p[0].due_date, '2026-09-20');
});

test('activePlanSize muda por data', () => {
  assert.equal(activePlanSize(new Date('2026-07-01T12:00:00Z')), 3);
  assert.equal(activePlanSize(new Date('2026-08-01T12:00:00Z')), 2);
  assert.equal(activePlanSize(new Date('2026-09-01T12:00:00Z')), 1);
});
