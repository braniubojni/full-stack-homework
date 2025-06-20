import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumbersPage from '@/app/numbers/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the fetch API
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

// Helper function to render component with query client
const renderWithQueryClient = (ui: React.ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe('NumbersPage API Integration Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('fetches number pairs from the API correctly', async () => {
    // Mock the API response
    const mockNumberPairsData = [
      { id1: 1, number1: 5, id2: 2, number2: 11, sum: 16 },
      { id1: 2, number1: 20, id2: 3, number2: 15, sum: 35 },
    ];

    // Setup mock for fetch API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNumberPairsData,
    });

    renderWithQueryClient(<NumbersPage />);

    // Check if data is displayed in the table
    await waitFor(() => {
      expect(screen.getByTestId('table-container')).toBeInTheDocument();
      // Check for the data we mocked
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(mockNumberPairsData.length + 1); // +1 for header row
      mockNumberPairsData.forEach((pair) => {
        expect(screen.getByText(pair.number1.toString())).toBeInTheDocument();
        expect(screen.getByText(pair.number2.toString())).toBeInTheDocument();
        expect(screen.getByText(pair.sum.toString())).toBeInTheDocument();
      });
    });
  });

  it('handles API error during data fetching', async () => {
    // Mock API error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to fetch number pairs' }),
    });

    renderWithQueryClient(<NumbersPage />);

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(
        screen.getByText(
          'No number pairs available. Add at least two numbers to see pairs.'
        )
      ).toBeInTheDocument();
    });
  });

  it('submits a new number to the API successfully', async () => {
    const user = userEvent.setup();

    // Mock successful post request
    mockFetch.mockImplementation(async (url, options) => {
      if (options?.method === 'POST') {
        return {
          ok: true,
          json: async () => ({ success: true }),
        };
      }

      return {
        ok: true,
        json: async () => [],
      };
    });

    renderWithQueryClient(<NumbersPage />);

    // Find and interact with the form elements
    const numberInput = screen.getByLabelText('Enter an integer', {
      exact: false,
    });
    await user.clear(numberInput);
    await user.type(numberInput, '42');

    // Submit the form
    const submitButton = screen.getByText('Add');
    await user.click(submitButton);

    // Verify API was called with correct data
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/numbers',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ value: 42 }),
      })
    );

    // Check success message displayed
    await waitFor(() => {
      expect(screen.getByText('Number added successfully')).toBeInTheDocument();
    });
  });

  it('handles API error during number submission', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to add number';

    // Mock API error on post
    mockFetch.mockImplementation(async (url, options) => {
      if (options?.method === 'POST') {
        return {
          ok: false,
          json: async () => ({ error: errorMessage }),
        };
      }

      return {
        ok: true,
        json: async () => [],
      };
    });

    renderWithQueryClient(<NumbersPage />);

    // Find and interact with the form elements
    const numberInput = screen.getByLabelText('Enter an integer', {
      exact: false,
    });
    await user.clear(numberInput);
    await user.type(numberInput, '42');

    // Submit the form
    const submitButton = screen.getByText('Add');
    await user.click(submitButton);
  });
});
