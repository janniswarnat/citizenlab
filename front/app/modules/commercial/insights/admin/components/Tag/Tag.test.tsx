import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import Tag, { TagProps } from './';

const defaultTagProps = {
  label: 'Label',
  onIconClick: () => {},
  variant: 'primary',
} as TagProps;

describe('Tag', () => {
  it('should render', () => {
    render(<Tag {...defaultTagProps} />);
    expect(screen.getByTestId('insightsTag')).toBeInTheDocument();
    expect(screen.getByText(defaultTagProps.label)).toBeInTheDocument();
  });
  it('should not render icon when onIconClick is undefined', () => {
    render(<Tag {...defaultTagProps} onIconClick={undefined} />);
    expect(
      screen.queryByTestId('insightsTagIconContainer')
    ).not.toBeInTheDocument();
  });
  it('should render correct icon when primary', () => {
    const { container } = render(<Tag {...defaultTagProps} />);
    expect(
      container.querySelector('.insightsTagCloseIcon')
    ).toBeInTheDocument();
  });
  it('should render correct icon when secondary', () => {
    const { container } = render(
      <Tag {...defaultTagProps} variant="secondary" />
    );
    expect(container.querySelector('.insightsTagPlusIcon')).toBeInTheDocument();
  });
  it('should call onIconClick correctly', () => {
    const onIconClick = jest.fn();
    render(<Tag {...defaultTagProps} onIconClick={onIconClick} />);
    fireEvent.click(screen.getByTestId('insightsTagIconContainer'));
    expect(onIconClick).toHaveBeenCalled();
  });
});
