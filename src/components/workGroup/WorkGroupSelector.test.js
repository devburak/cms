import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WorkGroupSelector, { uniqueWorkGroups } from './WorkGroupSelector';
const old = { _id: 'term-48', family: { _id: 'energy', name: 'Enerji' }, name: 'Eski dönem adı', period: { name: '48. Dönem' } };
const current = { _id: 'term-49', family: { _id: 'energy', name: 'Enerji' }, name: 'Enerji', period: { name: '49. Dönem' } };
const second = { _id: 'term-other', family: { _id: 'water', name: 'Su' }, name: 'Su' };
test('aynı grup farklı dönemlerde tek seçenektir; kalıcı adı kullanır', () => {
  expect(uniqueWorkGroups([old, current, second])).toEqual([{ _id: 'energy', name: 'Enerji' }, { _id: 'water', name: 'Su' }]);
});
test('başka grup eklenirken mevcut tarihsel dönem kimliği korunur', () => {
  const onChange = jest.fn();
  render(<WorkGroupSelector multiple groups={[old, current, second]} value={[old]} onChange={onChange} />);
  fireEvent.mouseDown(screen.getByRole('combobox'));
  fireEvent.click(screen.getByRole('option', { name: 'Su' }));
  expect(onChange).toHaveBeenCalledWith([old, expect.objectContaining({ _id: 'water' })]);
  expect(screen.queryByText('48. Dönem')).not.toBeInTheDocument();
});
