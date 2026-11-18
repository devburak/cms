import React, { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import CampaignMediaInput from './CampaignMediaInput';
jest.mock('../file/featuredImage', () => ({ initialFile }) => <div data-testid="image-choice">{initialFile.url}</div>);
function Editor({ initial }) {
  const [value, setValue] = useState(initial);
  return <><CampaignMediaInput label="Yatay medya" value={value} onChange={setValue} horizontal /><output aria-label="Kaydedilecek medya">{JSON.stringify(value)}</output></>;
}
test('YouTube/Vimeo links replace an image without retaining its image id; switching back preserves the image', () => {
  render(<Editor initial={{ mediaType: 'image', url: 'https://storage.example.invalid/image.jpg', mediaId: 'image-id' }} />);
  const panel = within(screen.getByRole('region', { name: 'Yatay medya' }));
  fireEvent.click(panel.getByRole('button', { name: 'Video bağlantısı' }));
  const input = panel.getByLabelText('Yatay medya video bağlantısı');
  fireEvent.change(input, { target: { value: 'https://youtu.be/BboCUmVWF8A' } });
  expect(panel.getByText('YouTube')).toBeInTheDocument();
  expect(JSON.parse(screen.getByLabelText('Kaydedilecek medya').textContent).mediaId).toBeNull();
  fireEvent.click(panel.getByRole('button', { name: 'Görsel' }));
  expect(screen.getByTestId('image-choice')).toHaveTextContent('https://storage.example.invalid/image.jpg');
  fireEvent.click(panel.getByRole('button', { name: 'Video bağlantısı' }));
  expect(panel.getByLabelText('Yatay medya video bağlantısı')).toHaveValue('https://youtu.be/BboCUmVWF8A');
  fireEvent.change(panel.getByLabelText('Yatay medya video bağlantısı'), { target: { value: 'https://vimeo.com/123456789/abc123abcd' } });
  expect(panel.getByText('Vimeo')).toBeInTheDocument();
  expect(panel.getByRole('link', { name: 'Videoyu aç' })).toHaveAttribute('href', 'https://player.vimeo.com/video/123456789?h=abc123abcd');
});
test('untrusted addresses have an inline error and no preview link', () => {
  render(<Editor initial={{ mediaType: 'video', url: 'https://evil.invalid/embed/123', mediaId: null }} />);
  expect(screen.getByText('Geçerli bir YouTube veya Vimeo video bağlantısı girin.')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Videoyu aç' })).not.toBeInTheDocument();
});
test('removing video returns to empty image media', () => {
  render(<Editor initial={{ mediaType: 'video', url: 'https://vimeo.com/123456789', mediaId: null }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Medyayı kaldır' }));
  expect(JSON.parse(screen.getByLabelText('Kaydedilecek medya').textContent)).toEqual({ mediaType: 'image', url: '', mediaId: null });
});
