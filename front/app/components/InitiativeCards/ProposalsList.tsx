import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// components
import InitiativeCard from 'components/InitiativeCard';
import { Spinner, Button } from '@citizenlab/cl2-component-library';

// resources
import { IInitiativeData } from 'services/initiatives';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled, { useTheme } from 'styled-components';
import { media } from 'utils/styleUtils';
import { rgba } from 'polished';
import useLocale from 'hooks/useLocale';

const Loading = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.biggerThanMinTablet`
    height: calc(100vh - 280px);
    position: sticky;
    top: 200px;
  `}

  ${media.smallerThanMinTablet`
    height: 150px;
  `}
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 30px;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
    margin-top: 0px;
  `}
`;

const InitiativesList = styled.div`
  margin-left: -13px;
  margin-right: -13px;
  display: flex;
  flex-wrap: wrap;
`;

const StyledInitiativeCard = styled(InitiativeCard)`
  flex-grow: 0;
  width: calc(100% * (1 / 3) - 26px);
  margin-left: 13px;
  margin-right: 13px;

  @media (max-width: 1440px) and (min-width: 1279px) {
    width: calc(100% * (1 / 3) - 16px);
    margin-left: 8px;
    margin-right: 8px;
  }

  @media (max-width: 1279px) and (min-width: 768px) {
    width: calc(100% * (1 / 2) - 26px);
  }

  ${media.smallerThanMinTablet`
    width: 100%;
  `};
`;

interface Props {
  id: string;
  ariaLabelledBy: string;
  querying: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  list: IInitiativeData[];
  onLoadMore(): void;
}

const ProposalsList = ({
  list,
  hasMore,
  loadingMore,
  ariaLabelledBy,
  id,
  onLoadMore,
  querying,
}: Props) => {
  const theme: any = useTheme();
  const locale = useLocale();
  const loadMore = () => {
    trackEventByName(tracks.loadMoreProposals);
    onLoadMore();
  };

  if (!isNilOrError(locale)) {
    const hasInitiatives = list && list.length > 0;

    return (
      <div aria-labelledby={ariaLabelledBy} id={id} tabIndex={0}>
        {querying ? (
          <Loading id="initiatives-loading">
            <Spinner />
          </Loading>
        ) : (
          <>
            {hasInitiatives && list && (
              <InitiativesList id="e2e-initiatives-list">
                {list.map((initiative) => (
                  <StyledInitiativeCard
                    key={initiative.id}
                    initiativeId={initiative.id}
                  />
                ))}
              </InitiativesList>
            )}

            {hasMore && (
              <Footer>
                <Button
                  id="e2e-initiative-cards-show-more-button"
                  onClick={loadMore}
                  buttonStyle="secondary"
                  text={<FormattedMessage {...messages.showMore} />}
                  processing={loadingMore}
                  height="50px"
                  icon="showMore"
                  iconPos="left"
                  textColor={theme.colorText}
                  bgColor={rgba(theme.colorText, 0.08)}
                  bgHoverColor={rgba(theme.colorText, 0.12)}
                  fontWeight="500"
                  locale={locale}
                />
              </Footer>
            )}
          </>
        )}
        ;
      </div>
    );
  }

  return null;
};

export default ProposalsList;
