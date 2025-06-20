import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumbersPage from '@/app/numbers/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Mock react-query hooks
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));
// Mock the fetch API
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

// Sample number pairs data for tests
const sampleNumberPairs = [
  {
    id1: 1,
    number1: 5,
    id2: 2,
    number2: 10,
    sum: 15,
  },
  {
    id1: 2,
    number1: 10,
    id2: 3,
    number2: 15,
    sum: 25,
  },
];

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

describe('NumbersPage Unit Tests', () => {
  // Set up mocks before each test
  beforeEach(() => {
    // Default mock implementations for react-query hooks
    (useQuery as jest.Mock).mockReturnValue({
      data: sampleNumberPairs,
      isLoading: false,
    });

    (useMutation as jest.Mock).mockImplementation(({ onSuccess, onError }) => ({
      mutate: jest.fn((data) => onSuccess && onSuccess(data)),
      isError: false,
      error: null,
    }));

    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: jest.fn(),
    });
  });

  it('renders the page title correctly', () => {
    renderWithQueryClient(<NumbersPage />);
    expect(screen.getByText('Number Pairs Calculator')).toBeInTheDocument();
  });

  it('renders the form with all required inputs', () => {
    renderWithQueryClient(<NumbersPage />);
    // Check form section title
    expect(screen.getByText('Add a new number')).toBeInTheDocument();
    // Check form elements
    expect(
      screen.getByLabelText('Enter an integer', {
        exact: false,
      })
    ).toBeInTheDocument();
    const btn = screen.getByText('Add');
    expect(btn).toBeInTheDocument();
    expect(btn.closest('button')).toBeInTheDocument();
  });

  it('renders the numbers table with correct data', async () => {
    renderWithQueryClient(<NumbersPage />);
    // Check table title
    expect(screen.getByText('Adjacent Number Pairs')).toBeInTheDocument();
    // Check table container
    expect(screen.getByTestId('table-container')).toBeInTheDocument();

    // Check table headers
    expect(screen.getByTestId('ID-1')).toBeInTheDocument();
    expect(screen.getByTestId('Number-1')).toBeInTheDocument();
    expect(screen.getByTestId('ID-2')).toBeInTheDocument();
    expect(screen.getByTestId('Number-2')).toBeInTheDocument();
    expect(screen.getByTestId('Sum')).toBeInTheDocument();

    // Check table data
    const tableRows = screen.getAllByRole('row');
    expect(tableRows.length).toBeGreaterThan(1);
    const firstRow = within(tableRows[1]);
    expect(firstRow.getByText('1')).toBeInTheDocument();
    expect(firstRow.getByText('5')).toBeInTheDocument();
    expect(firstRow.getByText('2')).toBeInTheDocument();
    expect(firstRow.getByText('10')).toBeInTheDocument();
    expect(firstRow.getByText('15')).toBeInTheDocument();
  });

  it('displays loading indicator when data is loading', () => {
    // Mock loading state
    (useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
    });
    renderWithQueryClient(<NumbersPage />);
    // Check for CircularProgress component
    const progressBars = screen.queryAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('displays empty state message when no numbers exist', () => {
    // Mock empty data
    (useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    renderWithQueryClient(<NumbersPage />);
    // Check for no data message
    expect(
      screen.getByText(
        'No number pairs available. Add at least two numbers to see pairs.'
      )
    ).toBeInTheDocument();
  });
});
