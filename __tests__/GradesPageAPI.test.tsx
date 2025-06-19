import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GradesPage from '@/app/grades/page';
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

describe('GradesPage API Integration Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('fetches and displays grades from the API', async () => {
    const sampleGrades = [
      {
        id: 1,
        class: 'Math',
        grade: 85,
        created_at: '2025-06-19T10:00:00Z',
      },
      {
        id: 2,
        class: 'Science',
        grade: 92,
        created_at: '2025-06-19T11:00:00Z',
      },
    ];

    // Mock the fetch calls
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes('/api/grades')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(sampleGrades),
        });
      }
      return Promise.resolve({ ok: false });
    });

    renderWithQueryClient(<GradesPage />);

    // Check for loading state (if applicable)
    // In some implementations, you might see a loading indicator

    // Wait for the data to be displayed
    await waitFor(() => {
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('92')).toBeInTheDocument();
    });

    // Verify API was called correctly
    expect(mockFetch).toHaveBeenCalledWith('/api/grades');
  });

  it('submits a new grade to the API correctly', async () => {
    const user = userEvent.setup();
    const newGrade = { id: 3, class: 'History', grade: 78 };

    // Mock fetch for initial load and form submission
    mockFetch.mockImplementation(async (url: string, options?: RequestInit) => {
      if (url.includes('/api/grades')) {
        if (options?.method === 'POST') {
          // Check that the POST body is correct
          const body = JSON.parse(options.body as string);
          if (body.class === newGrade.class && body.grade === newGrade.grade) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(newGrade),
            });
          }
        } else {
          // Return empty array for the initial GET
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
      }

      return Promise.resolve({ ok: false });
    });

    renderWithQueryClient(<GradesPage />);

    // Wait for the form to be available
    await waitFor(() => {
      expect(screen.getByLabelText('Class')).toBeInTheDocument();
    });

    // Fill out the form
    const classSelect = screen.getByLabelText('Class');
    await user.click(classSelect);

    // Select History from dropdown
    const historyOption = await screen.findByTestId('menu-option-History');
    await user.click(historyOption);

    const gradeInput = screen.getByLabelText('Grade (0-100)', {
      exact: false,
    });
    await user.clear(gradeInput);
    await user.type(gradeInput, '78');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Add Grade' });
    await user.click(submitButton);

    // Verify form submission
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/grades',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ class: 'History', grade: 78 }),
        })
      );
    });

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Grade added successfully')).toBeInTheDocument();
    });
  });

  it('handles API error when fetching grades', async () => {
    // Mock failed API response
    mockFetch.mockImplementation(async (url: string) => {
      if (url.includes('/api/grades')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Server error' }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    renderWithQueryClient(<GradesPage />);

    // Should show no grades message
    await waitFor(() => {
      expect(
        screen.getByText('No grades available. Add grades to see them here.')
      ).toBeInTheDocument();
    });
  });

  it('handles API validation errors when submitting form', async () => {
    const user = userEvent.setup();

    // Mock API validation error
    mockFetch.mockImplementation(async (url: string, options?: RequestInit) => {
      if (url.includes('/api/grades')) {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: () =>
              Promise.resolve({
                error: 'Invalid class. Must be Math, Science, or History',
              }),
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

    renderWithQueryClient(<GradesPage />);

    // Fill out form with invalid data (assuming our component attempts to submit it)
    await waitFor(() => {
      expect(screen.getByLabelText('Class')).toBeInTheDocument();
    });

    // Select a class
    const classSelect = screen.getByLabelText('Class');
    await user.click(classSelect);
    const mathOption = await screen.findByTestId('menu-option-Math');
    await user.click(mathOption);

    const gradeInput = screen.getByLabelText('Grade (0-100)', {
      exact: false,
    });
    await user.clear(gradeInput);
    await user.type(gradeInput, '50');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Add Grade' });
    await user.click(submitButton);
  });
});
