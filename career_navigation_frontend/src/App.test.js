import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app brand header', () => {
  render(<App />);
  const brandElement = screen.getByText(/Career Navigator/i);
  expect(brandElement).toBeInTheDocument();
});
