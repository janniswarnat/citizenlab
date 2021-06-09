import React from 'react';
import { render, screen, fireEvent, act, within } from 'utils/testUtils/rtl';
import * as service from 'modules/commercial/insights/services/insightsCategories';
import clHistory from 'utils/cl-router/history';

import InsightsEdit from './';

let mockData = [
  {
    id: '1aa8a788-3aee-4ada-a581-6d934e49784b',
    type: 'category',
    attributes: {
      name: 'Test',
    },
  },
  {
    id: '4b429681-1744-456f-8550-e89a2c2c74b2',
    type: 'category',
    attributes: {
      name: 'Test 2',
    },
  },
];

jest.mock('utils/cl-intl');

jest.mock('modules/commercial/insights/services/insightsCategories', () => ({
  addInsightsCategory: jest.fn(),
  deleteInsightsCategory: jest.fn(),
}));

jest.mock('modules/commercial/insights/hooks/useInsightsCategories', () => {
  return jest.fn(() => mockData);
});

jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));

const viewId = '1';

let mockLocationData = { pathname: '', query: {} };

jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return (
          <Component
            {...props}
            params={{ viewId }}
            location={mockLocationData}
          />
        );
      };
    },
  };
});

window.confirm = jest.fn(() => true);

describe('Insights Edit', () => {
  it('renders Edit screen', () => {
    render(<InsightsEdit />);
    expect(screen.getByTestId('insightsEdit')).toBeInTheDocument();
  });
  describe('Categories', () => {
    it('renders correct number of categories', () => {
      render(<InsightsEdit />);
      expect(screen.getAllByTestId('insightsCategory')).toHaveLength(2);
    });
    it('selects category correctly', () => {
      const spy = jest.spyOn(clHistory, 'replace');
      render(<InsightsEdit />);
      fireEvent.click(screen.getByText(mockData[0].attributes.name));
      expect(spy).toHaveBeenCalledWith({
        pathname: '',
        search: `?category=${mockData[0].id}`,
      });
    });
  });

  it('shows selected category correctly', () => {
    mockLocationData = { pathname: '', query: { category: mockData[0].id } };
    render(<InsightsEdit />);
    expect(
      within(screen.getByTestId('insightsInputsHeader')).getByText(
        mockData[0].attributes.name
      )
    ).toBeInTheDocument();
  });

  it('deletes category correctly', async () => {
    mockLocationData = { pathname: '', query: { category: mockData[0].id } };
    render(<InsightsEdit />);
    fireEvent.click(
      within(screen.getByTestId('insightsInputsHeader')).getByRole('button')
    );
    await act(async () => {
      fireEvent.click(screen.getByText('Delete category'));
    });
    expect(service.deleteInsightsCategory).toHaveBeenCalledWith(
      viewId,
      mockData[0].id
    );
  });

  it('selects all input correctly', () => {
    const spy = jest.spyOn(clHistory, 'replace');
    render(<InsightsEdit />);
    fireEvent.click(screen.getAllByText('All input')[0]);
    expect(spy).toHaveBeenCalledWith({
      pathname: '',
      search: `?category=`,
    });
  });

  it('renders Infobox when no categories are available', () => {
    mockData = [];
    render(<InsightsEdit />);
    expect(screen.getByTestId('insightsNoCategories')).toBeInTheDocument();
  });
  it('adds category with correct view id and name ', async () => {
    const categoryName = 'New category';

    render(<InsightsEdit />);

    fireEvent.input(screen.getByPlaceholderText('Add category'), {
      target: {
        value: categoryName,
      },
    });

    await act(async () => {
      fireEvent.click(screen.getByText('+'));
    });

    expect(service.addInsightsCategory).toHaveBeenCalledWith(
      viewId,
      categoryName
    );
  });
});

// rename category modal
