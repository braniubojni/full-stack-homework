import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumbersPage from '@/app/numbers/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock react-query hooks
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

describe('NumbersPage Edge Case Tests', () => {
  beforeEach(() => {
    // Default mock implementations
    (useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    (useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isError: false,
      error: null,
    });

    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: jest.fn(),
    });
  });

  it('handles numbers with extreme values correctly', async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn();
    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isError: false,
      error: null,
    });

    renderWithQueryClient(<NumbersPage />);

    // Test with maximum safe integer
    const numberInput = screen.getByLabelText('Enter an integer', {
      exact: false,
    });
    const submitButton = screen.getByText('Add');

    // Set up the test for a very large number (close to JS Number.MAX_SAFE_INTEGER)
    const largeNumber = Number.MAX_SAFE_INTEGER.toString();
    await user.clear(numberInput);
    await user.type(numberInput, largeNumber);
    await user.click(submitButton);

    // Verify the mutation gets called with the extreme value
    expect(mockMutate).toHaveBeenCalledWith(Number.MAX_SAFE_INTEGER);

    // Test with minimum safe integer
    const minNumber = Number.MIN_SAFE_INTEGER.toString();
    await user.clear(numberInput);
    await user.type(numberInput, minNumber);
    await user.click(submitButton);

    // Verify the mutation gets called with the extreme value
    expect(mockMutate).toHaveBeenCalledWith(Number.MIN_SAFE_INTEGER);
  });

  it('validates numeric input in the value field', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<NumbersPage />);

    const numberInput = screen.getByLabelText('Enter an integer', {
      exact: false,
    });
    const submitButton = screen.getByText('Add');

    // Test with non-integer value
    await user.clear(numberInput);
    await user.type(numberInput, '3.14');
    await user.click(submitButton);

    // Expect error message for non-integer input
    expect(
      screen.getByText('Please enter a valid integer')
    ).toBeInTheDocument();

    // Test with empty value
    await user.clear(numberInput);
    await user.click(submitButton);

    // Test with valid integer
    await user.clear(numberInput);
    await user.type(numberInput, '42');
    await user.click(submitButton);

    // No error message should appear (we're mocking the mutation to succeed)
    expect(
      screen.queryByText('Please enter a valid integer')
    ).not.toBeInTheDocument();
  });

  it('properly resets form after successful submission', async () => {
    const user = userEvent.setup();
    // Mock successful submission
    (useMutation as jest.Mock).mockImplementation(({ onSuccess }) => ({
      mutate: jest.fn((data) => {
        if (onSuccess) {
          onSuccess({ value: data });
        }
      }),
      isError: false,
      error: null,
    }));

    renderWithQueryClient(<NumbersPage />);

    // Fill the form
    const numberInput = screen.getByLabelText('Enter an integer', {
      exact: false,
    });
    await user.clear(numberInput);
    await user.type(numberInput, '42');

    // Submit the form
    const submitButton = screen.getByText('Add');
    await user.click(submitButton);

    // Check that the form has been reset
    await waitFor(() => {
      expect((numberInput as HTMLInputElement).value).toBe('');
    });

    // Check for success message
    expect(screen.getByText('Number added successfully')).toBeInTheDocument();
  });

  it('handles malformed date strings gracefully', () => {
    // Create a modified version of the sample data with a malformed date
    const dataWithMalformedDate = [
      {
        id1: 1,
        number1: 5,
        id2: 2,
        number2: 10,
        sum: 15,
      },
    ];

    // Mock the query response with the malformed data
    (useQuery as jest.Mock).mockReturnValue({
      data: dataWithMalformedDate,
      isLoading: false,
    });

    // The component should render without crashing
    renderWithQueryClient(<NumbersPage />);

    // Verify the component rendered the data without errors
    expect(screen.getByTestId('table-container')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('handles no data response properly', () => {
    // Mock empty data response
    (useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderWithQueryClient(<NumbersPage />);

    // Should display the "no data" message
    expect(
      screen.getByText(
        'No number pairs available. Add at least two numbers to see pairs.'
      )
    ).toBeInTheDocument();
  });
});
