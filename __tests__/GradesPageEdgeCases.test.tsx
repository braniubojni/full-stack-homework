import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GradesPage from '@/app/grades/page';
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

describe('GradesPage Edge Case Tests', () => {
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

  it('handles grades with extreme values correctly', () => {
    // Mock grades with boundary values (0 and 100)
    (useQuery as jest.Mock).mockReturnValue({
      data: [
        { id: 1, class: 'Math', grade: 0, created_at: '2025-06-19T10:00:00Z' },
        {
          id: 2,
          class: 'Science',
          grade: 100,
          created_at: '2025-06-19T11:00:00Z',
        },
      ],
      isLoading: false,
    });

    renderWithQueryClient(<GradesPage />);

    // Verify the extreme values are displayed correctly
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();

    // Check averages are calculated correctly
    expect(screen.getByText('Average: 0%')).toBeInTheDocument(); // Math avg
    expect(screen.getByText('Average: 100%')).toBeInTheDocument(); // Science avg
  });

  it('correctly calculates statistics when a class has no grades', () => {
    // Mock data where one class has no grades
    (useQuery as jest.Mock).mockReturnValue({
      data: [
        { id: 1, class: 'Math', grade: 85, created_at: '2025-06-19T10:00:00Z' },
        {
          id: 2,
          class: 'Science',
          grade: 92,
          created_at: '2025-06-19T11:00:00Z',
        },
        // No History grades
      ],
      isLoading: false,
    });

    renderWithQueryClient(<GradesPage />);

    // Check that History shows N/A for average since it has no grades
    const historyCard = screen
      .getByText('History')
      .closest('.MuiCard-root') as HTMLElement;
    expect(within(historyCard).getByText('Grades: 0')).toBeInTheDocument();
    expect(within(historyCard).getByText('Average: N/A')).toBeInTheDocument();
  });

  it('validates minimum and maximum grade input', async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn();

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isError: false,
    });

    renderWithQueryClient(<GradesPage />);

    // Select a class first
    const classSelect = screen.getByLabelText('Class');
    await user.click(classSelect);
    await user.click(screen.getByText('Math'));

    const gradeInput = screen.getByLabelText('Grade (0-100)');
    const submitButton = screen.getByRole('button', { name: 'Add Grade' });

    // Test with grade below minimum (negative)
    await user.clear(gradeInput);
    await user.type(gradeInput, '-5');
    await user.click(submitButton);

    // Grade input should prevent negative input due to regex in handleGradeChange
    // The actual value should remain valid
    expect(gradeInput).not.toHaveValue('-5');

    // Test with grade above maximum (>100)
    await user.clear(gradeInput);
    await user.type(gradeInput, '101');
    await user.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(
        screen.getByText('Grade must be an integer between 0 and 100')
      ).toBeInTheDocument();
    });

    // Test with valid boundary values
    await user.clear(gradeInput);
    await user.type(gradeInput, '0');
    await user.click(submitButton);
    expect(mockMutate).toHaveBeenCalledWith({ class: 'Math', grade: 0 });

    await user.clear(gradeInput);
    await user.type(gradeInput, '100');
    await user.click(submitButton);
    expect(mockMutate).toHaveBeenCalledWith({ class: 'Math', grade: 100 });
  });

  it('handles non-integer grade input correctly', async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn();

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isError: false,
    });

    renderWithQueryClient(<GradesPage />);

    // Select a class first
    const classSelect = screen.getByLabelText('Class');
    await user.click(classSelect);
    await user.click(screen.getByText('Math'));

    const gradeInput = screen.getByLabelText('Grade (0-100)');
    const submitButton = screen.getByRole('button', { name: 'Add Grade' });

    // Try to enter decimal grade
    await user.clear(gradeInput);
    await user.type(gradeInput, '85.5');

    // Input should only accept integers due to regex validation
    expect(gradeInput).toHaveValue('85');

    // Submit with valid integer
    await user.click(submitButton);
    expect(mockMutate).toHaveBeenCalledWith({ class: 'Math', grade: 85 });
  });

  it('properly resets form after successful submission', async () => {
    const user = userEvent.setup();
    let successCallback: Function | undefined;

    (useMutation as jest.Mock).mockImplementation(({ onSuccess }) => {
      successCallback = onSuccess;
      return {
        mutate: (data: any) => successCallback && successCallback(data),
        isError: false,
      };
    });

    renderWithQueryClient(<GradesPage />);

    // Fill the form
    const classSelect = screen.getByLabelText('Class');
    await user.click(classSelect);
    await user.click(screen.getByText('Math'));

    const gradeInput = screen.getByLabelText('Grade (0-100)');
    await user.clear(gradeInput);
    await user.type(gradeInput, '85');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Add Grade' });
    await user.click(submitButton);

    // Check that form was reset
    await waitFor(() => {
      expect(classSelect).toHaveTextContent(''); // Select should be reset
      expect(gradeInput).toHaveValue(''); // Input should be empty
    });

    // Check for success message
    expect(screen.getByText('Grade added successfully')).toBeInTheDocument();
  });

  it('handles malformed date strings gracefully', () => {
    // Mock grades with invalid date
    (useQuery as jest.Mock).mockReturnValue({
      data: [
        { id: 1, class: 'Math', grade: 85, created_at: 'invalid-date' },
        { id: 2, class: 'Science', grade: 92, created_at: null },
      ],
      isLoading: false,
    });

    renderWithQueryClient(<GradesPage />);

    // Check that invalid date shows as N/A
    const tableRows = screen.getAllByRole('row');
    expect(tableRows.length).toBeGreaterThan(1); // Header + at least one row

    // In the component, N/A is displayed when date is invalid
    expect(screen.getAllByText('N/A').length).toBe(2);
  });
});
