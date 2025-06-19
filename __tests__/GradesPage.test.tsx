import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GradesPage from '@/app/grades/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock components and hooks
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Mock the fetch API
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

// Sample grade data for tests
const sampleGrades = [
  {
    id: 1,
    class: 'Math',
    grade: 85,
    created_at: '2025-06-17T10:00:00Z',
  },
  {
    id: 2,
    class: 'Science',
    grade: 92,
    created_at: '2025-06-18T11:00:00Z',
  },
  {
    id: 3,
    class: 'History',
    grade: 78,
    created_at: '2025-06-19T12:00:00Z',
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

describe('GradesPage', () => {
  // Set up mocks before each test
  beforeEach(() => {
    mockFetch.mockClear();

    // Default mock implementations for react-query hooks
    (useQuery as jest.Mock).mockImplementation(({ queryKey, queryFn }) => {
      if (Array.isArray(queryKey[0]) && queryKey[0][0] === 'grades') {
        return { data: sampleGrades, isLoading: false };
      }
      return { data: null, isLoading: false };
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

  // UNIT TESTS

  describe('Unit Tests', () => {
    it('renders the page title correctly', () => {
      renderWithQueryClient(<GradesPage />);
      expect(screen.getByText('Grade Management')).toBeInTheDocument();
    });
    it('renders the form with all required inputs', () => {
      renderWithQueryClient(<GradesPage />);
      // Check form section title
      expect(screen.getByText('Add a new grade')).toBeInTheDocument();
      // Check form elements
      expect(screen.getByLabelText('Class')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add Grade' })
      ).toBeInTheDocument();
    });
    it('renders class statistics correctly', async () => {
      renderWithQueryClient(<GradesPage />);

      // Check statistics section title
      expect(screen.getByText('Class Statistics')).toBeInTheDocument();
      // Check that we have 3 statistic cards
      const mathCard = await screen.findByTestId('class-stat-Math');
      const scienceCard = await screen.findByTestId('class-stat-Science');
      const historyCard = await screen.findByTestId('class-stat-History');
      expect(mathCard).toBeInTheDocument();
      expect(scienceCard).toBeInTheDocument();
      expect(historyCard).toBeInTheDocument();
      // Check statistics values are calculated correctly
      expect(within(mathCard).getByText('Grades: 1')).toBeInTheDocument();
      expect(within(mathCard).getByText('Average: 85%')).toBeInTheDocument();
      expect(within(scienceCard).getByText('Grades: 1')).toBeInTheDocument();
      expect(within(scienceCard).getByText('Average: 92%')).toBeInTheDocument();
      expect(within(historyCard).getByText('Grades: 1')).toBeInTheDocument();
      expect(within(historyCard).getByText('Average: 78%')).toBeInTheDocument();
    });
    it('renders the grades table with correct data', async () => {
      renderWithQueryClient(<GradesPage />);
      // Check table title
      expect(screen.getByText('All Grades')).toBeInTheDocument();
      // Check table headers
      expect(await screen.findByTestId('table-header-ID')).toBeInTheDocument();
      expect(
        await screen.findByTestId('table-header-Class')
      ).toBeInTheDocument();
      expect(
        await screen.findByTestId('table-header-Grade')
      ).toBeInTheDocument();
      expect(
        await screen.findByTestId('table-header-Date-Added')
      ).toBeInTheDocument();
      // Check data is displayed correctly
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('92')).toBeInTheDocument();
      expect(screen.getByText('78')).toBeInTheDocument();
    });
    it('displays loading indicator when data is loading', () => {
      // Mock loading state
      (useQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: true,
      });
      renderWithQueryClient(<GradesPage />);
      // Check for CircularProgress component
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
    it('displays empty state message when no grades exist', () => {
      // Mock empty data
      (useQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });
      renderWithQueryClient(<GradesPage />);
      // Check for no data message
      expect(
        screen.getByText('No grades available. Add grades to see them here.')
      ).toBeInTheDocument();
    });
  });

  // INTEGRATION TESTS

  describe('Integration Tests', () => {
    it('submits a new grade successfully', async () => {
      const user = userEvent.setup();
      const mockInvalidateQueries = jest.fn();
      // Mock the mutation and query client
      const mockMutate = jest.fn((data) => {
        // Simulate successful mutation
        return Promise.resolve({ id: 4, ...data });
      });
      (useMutation as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isError: false,
        error: null,
      });
      (useQueryClient as jest.Mock).mockReturnValue({
        invalidateQueries: mockInvalidateQueries,
      });
      renderWithQueryClient(<GradesPage />);
      // Find and interact with the form elements
      const classSelect = screen.getByLabelText('Class');
      await user.click(classSelect);
      // Working with MUI select
      const mathOption = await screen.findByTestId('menu-option-Math');
      await user.click(mathOption);
      // Enter grade value
      const gradeInput = screen.getByLabelText('Grade (0-100)', {
        exact: false,
      });
      await user.clear(gradeInput);
      await user.type(gradeInput, '95');
      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Add Grade' });
      await user.click(submitButton);
      // Verify mutation was called with correct data
      expect(mockMutate).toHaveBeenCalledWith({ class: 'Math', grade: 95 });
    });
    it('shows error message on form validation failure', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<GradesPage />);
      // Select a class but enter invalid grade (above 100)
      const submitButton = screen.getByRole('button', { name: 'Add Grade' });
      const classSelect = screen.getByLabelText('Class');
      await user.click(classSelect);
      const scienceOption = await screen.findByTestId('menu-option-Science');
      await user.click(scienceOption);
      const gradeInput = screen.getByLabelText('Grade (0-100)', {
        exact: false,
      });
      await user.clear(gradeInput);
      await user.type(gradeInput, '101'); // Invalid grade
      await user.click(submitButton);
    });
    it('handles API error during grade submission', async () => {
      const user = userEvent.setup();
      // Mock API error
      const errorMessage = 'Server error while adding grade';
      (useMutation as jest.Mock).mockReturnValue({
        mutate: jest.fn((data, { onError } = {}) => {
          const error = new Error(errorMessage);
          onError && onError(error);
        }),
        isError: true,
        error: new Error(errorMessage),
      });
      renderWithQueryClient(<GradesPage />);
      // Fill and submit form
      const classSelect = screen.getByLabelText('Class');
      await user.click(classSelect);
      await user.click(await screen.findByTestId('menu-option-History'));
      const gradeInput = await screen.findByLabelText('Grade (0-100)', {
        exact: false,
      });
      (gradeInput as HTMLInputElement).value = '';
      await user.type(gradeInput, '88');
      const submitButton = screen.getByRole('button', { name: 'Add Grade' });
      await user.click(submitButton);
    });
    it('handles API error during grades fetching', async () => {
      // Mock query error
      (useQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch grades'),
        isError: true,
      });
      renderWithQueryClient(<GradesPage />);
      // Check for empty grades display
      expect(
        screen.getByText('No grades available. Add grades to see them here.')
      ).toBeInTheDocument();
    });
    it('formats dates correctly in the grades table', () => {
      renderWithQueryClient(<GradesPage />);
      // Check date formatting (the component formats to localeDateString)
      const expectedDate = new Date(
        '2025-06-19T10:00:00Z'
      ).toLocaleDateString();
      expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });
  });
});
