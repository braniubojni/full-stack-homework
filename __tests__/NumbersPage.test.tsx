import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '@/app/context/AppContext';
import NumbersPage from '@/app/numbers/page';

// Mock the fetch API
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

beforeEach(() => {
  mockFetch.mockClear();
});

describe('NumbersPage', () => {
  it('renders the form and table properly', async () => {
    // Mock fetch responses
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes('/api/init')) {
        return Promise.resolve({
          ok: true,
        });
      }

      if (url.includes('/api/numbers')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id1: 1, number1: 5, id2: 2, number2: 10, sum: 15 },
              { id1: 2, number1: 10, id2: 3, number2: 15, sum: 25 },
            ]),
        });
      }

      return Promise.resolve({ ok: false });
    });

    render(
      <AppProvider>
        <NumbersPage />
      </AppProvider>
    );

    // Check for heading
    expect(screen.getByText('Number Pairs Calculator')).toBeInTheDocument();

    // Check form is visible
    expect(screen.getByText('Add a new number')).toBeInTheDocument();

    // Check input and button
    expect(screen.getByLabelText('Enter an integer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();

    // Wait for table to load with mock data
    await waitFor(() => {
      expect(screen.getByText('Adjacent Number Pairs')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('ID 1')).toBeInTheDocument();
    expect(screen.getByText('Number 1')).toBeInTheDocument();
    expect(screen.getByText('ID 2')).toBeInTheDocument();
    expect(screen.getByText('Number 2')).toBeInTheDocument();
    expect(screen.getByText('Sum')).toBeInTheDocument();

    // Check table data
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const user = userEvent.setup();

    // Mock fetch for form submission
    mockFetch.mockImplementation(async (url: string, options: RequestInit) => {
      if (url.includes('/api/init')) {
        return Promise.resolve({ ok: true });
      }

      if (url.includes('/api/numbers')) {
        if (options.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id: 4, value: 20 }),
          });
        } else {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
      }

      return Promise.resolve({ ok: false });
    });

    render(
      <AppProvider>
        <NumbersPage />
      </AppProvider>
    );

    // Fill the form
    const input = screen.getByLabelText('Enter an integer');
    await user.clear(input);
    await user.type(input, '20');

    // Submit the form
    const addButton = screen.getByRole('button', { name: 'Add' });
    await user.click(addButton);

    // Check the submit was called with correct data
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/numbers',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ value: 20 }),
        })
      );
    });

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Number added successfully')).toBeInTheDocument();
    });
  });
});
