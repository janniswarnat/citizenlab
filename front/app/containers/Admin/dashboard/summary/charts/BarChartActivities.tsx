import React from 'react';

// hooks
import { useCubeQuery } from '@cubejs-client/react';

// components
import {
  GraphCard,
  NoDataContainer,
  GraphCardInner,
  GraphCardHeader,
  GraphCardTitle,
} from 'components/admin/Chart';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// typings
import { Query } from '@cubejs-client/core';

interface Props {
  className?: string;
}

const DEFAULT_QUERY: Query = {
  measures: ['Activities.count'],
  timeDimensions: [
    {
      dimension: 'Activities.createdAt',
      granularity: 'day',
    },
  ],
  order: {
    'Activities.createdAt': 'asc',
  },
  filters: [],
};

const BarChartActivities = ({ className }: Props) => {
  const { resultSet, isLoading, error } = useCubeQuery(DEFAULT_QUERY);

  const noData = isLoading || error;
  console.log(resultSet);

  return (
    <GraphCard className={className}>
      <GraphCardInner>
        <GraphCardHeader>
          <GraphCardTitle>Title</GraphCardTitle>
        </GraphCardHeader>
        {noData ? (
          <NoDataContainer>
            <FormattedMessage {...messages.noData} />
          </NoDataContainer>
        ) : (
          <>{/* CHART */}</>
        )}
      </GraphCardInner>
    </GraphCard>
  );
};

export default BarChartActivities;
