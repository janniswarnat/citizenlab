import React, { PureComponent, FormEvent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import IdeaCard, { InputProps as IdeaCardProps } from 'components/IdeaCard';
import IdeasMap from 'components/IdeasMap';
import Icon from 'components/UI/Icon';
import Spinner from 'components/UI/Spinner';
import SelectTopics from './SelectTopics';
import SelectSort from './SelectSort';
import SelectProjects from './SelectProjects';

import SearchInput from 'components/UI/SearchInput';
import Button from 'components/UI/Button';
import IdeaButton from 'components/IdeaButton';
import FeatureFlag from 'components/FeatureFlag';

// resources
import GetIdeas, { GetIdeasChildProps, InputProps as GetIdeasInputProps } from 'resources/GetIdeas';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled, { withTheme } from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { darken, rgba } from 'polished';

// typings
import { ParticipationMethod } from 'services/participationContexts';

const Container = styled.div`
  width: 100%;
`;

const Loading = styled.div`
  width: 100%;
  height: 300px;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.06);
`;

const FiltersArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  &.mapView {
    justify-content: flex-end;
  }

  ${media.smallerThanMaxTablet`
    margin-bottom: 30px;
    flex-direction: column;
    align-items: flex-start;
  `}
`;

const FilterArea = styled.div`
  display: flex;

  ${media.biggerThanMinTablet`
    align-items: center;
  `}
`;

const LeftFilterArea = FilterArea.extend`
  &.hidden {
    display: none;
  }
  ${media.smallerThanMaxTablet`
    margin-bottom: 22px;
  `}
  ${media.largePhone`
    width: 100%;
  `}
`;

const Spacer = styled.div`
  flex: 1;
`;

const RightFilterArea = FilterArea.extend`
  &.hidden {
    display: none;
  }

  ${media.smallerThanMaxTablet`
    width: 100%;
    display: flex;
    justify-content: space-between;
  `}

  ${media.largePhone`
    width: 100%;
    display: flex;
    flex-direction: column-reverse;
  `}
`;

const DropdownFilters = styled.div`
  &.hidden {
    display: none;
  }
`;

const StyledSearchInput = styled(SearchInput)`
  width: 300px;
  margin-right: 30px;

  input {
    font-size: ${fontSizes.medium}px;
    font-weight: 400;
  }

  ${media.largePhone`
    width: 100%;
  `}
`;

const ViewButtons = styled.div`
  display: flex;

  &.cardView {
    margin-left: 35px;

    ${media.smallerThanMinTablet`
      margin-left: 0px;
    `}
  }
`;

const ViewButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  border: solid 1px ${({ theme }) => theme.colorText};

  &:not(.active):hover {
    background: ${({ theme }) => rgba(theme.colorText, 0.08)};
  }

  &.active {
    background: ${({ theme }) => theme.colorText};

    > span {
      color: #fff;
    }
  }

  > span {
    color: ${({ theme }) => theme.colorText};
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    line-height: normal;
    padding-left: 18px;
    padding-right: 18px;
    padding-top: 10px;
    padding-bottom: 10px;

    ${media.smallerThanMinTablet`
      padding-top: 9px;
      padding-bottom: 9px;
    `}
  }
`;

const CardsButton = ViewButton.extend`
  border-top-left-radius: ${(props: any) => props.theme.borderRadius};
  border-bottom-left-radius: ${(props: any) => props.theme.borderRadius};
  border-right: none;
`;

const MapButton = ViewButton.extend`
 border-top-right-radius: ${(props: any) => props.theme.borderRadius};
  border-bottom-right-radius: ${(props: any) => props.theme.borderRadius};
`;

const IdeasList: any = styled.div`
  margin-left: -13px;
  margin-right: -13px;
  display: flex;
  flex-wrap: wrap;
`;

const StyledIdeaCard = styled<IdeaCardProps>(IdeaCard)`
  flex-grow: 0;
  width: calc(100% * (1/3) - 26px);
  margin-left: 13px;
  margin-right: 13px;

  ${media.smallerThanMaxTablet`
    width: calc(100% * (1/2) - 26px);
  `};

  ${media.smallerThanMinTablet`
    width: 100%;
  `};
`;

const EmptyContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding-top: 100px;
  padding-bottom: 100px;
  background: #fff;
  border: solid 1px ${colors.separation};
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

const IdeaIcon = styled(Icon)`
  width: 43px;
  height: 43px;
  fill: ${colors.label};
`;

const EmptyMessage = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 20px;
  margin-bottom: 30px;
`;

const EmptyMessageLine = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  text-align: center;
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

const ShowMoreButton = styled(Button)``;

interface InputProps extends GetIdeasInputProps  {
  showViewToggle?: boolean | undefined;
  defaultView?: 'card' | 'map' | null | undefined;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: 'Phase' | 'Project' | null;
  className?: string;
  allowProjectsFilter?: boolean;
}

interface DataProps {
  ideas: GetIdeasChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

interface State {
  selectedView: 'card' | 'map';
}

class IdeaCards extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedView: (props.defaultView || 'card')
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.phaseId !== prevProps.phaseId) {
      this.setState({ selectedView: this.props.defaultView || 'card' });
    }
  }

  loadMore = () => {
    this.props.ideas.onLoadMore();
  }

  handleSearchOnChange = (search: string) => {
    // track
    this.props.ideas.onChangeSearchTerm(search);
  }

  handleProjectsOnChange = (projects: string[]) => {
    this.props.ideas.onChangeProjects(projects);
  }

  handleSortOnChange = (sort: string) => {
    this.props.ideas.onChangeSorting(sort);
  }

  handleTopicsOnChange = (topics: string[]) => {
    this.props.ideas.onChangeTopics(topics);
  }

  selectView = (selectedView: 'card' | 'map') => (event: FormEvent<any>) => {
    event.preventDefault();
    trackEventByName(tracks.toggleDisplay, { selectedDisplayMode: selectedView });
    this.setState({ selectedView });
  }

  render() {
    const { selectedView } = this.state;
    const {
      participationMethod,
      participationContextId,
      participationContextType,
      ideas,
      className,
      theme,
      allowProjectsFilter
    } = this.props;
    const {
      queryParameters,
      searchValue,
      ideasList,
      hasMore,
      querying,
      loadingMore
    } = ideas;
    const hasIdeas = (!isNilOrError(ideasList) && ideasList.length > 0);
    const showViewToggle = (this.props.showViewToggle || false);
    const showCardView = (selectedView === 'card');
    const showMapView = (selectedView === 'map');

    return (
      <Container id="e2e-ideas-container" className={className}>
        <FiltersArea id="e2e-ideas-filters" className={`${showMapView && 'mapView'}`}>
          <LeftFilterArea className={`${showMapView && 'hidden'}`}>
            <StyledSearchInput value={(searchValue || '')} onChange={this.handleSearchOnChange} className="e2e-search-ideas-input"/>
          </LeftFilterArea>

          <RightFilterArea>
            <DropdownFilters className={`${showMapView ? 'hidden' : 'visible'}`}>
              <SelectSort onChange={this.handleSortOnChange} />
              {allowProjectsFilter && <SelectProjects onChange={this.handleProjectsOnChange} />}
              <SelectTopics onChange={this.handleTopicsOnChange} />
            </DropdownFilters>

            <Spacer />

            {showViewToggle &&
              <FeatureFlag name="maps">
                <ViewButtons className={`${showCardView && 'cardView'}`}>
                  <CardsButton onClick={this.selectView('card')} className={`${showCardView && 'active'}`}>
                    <FormattedMessage {...messages.cards} />
                  </CardsButton>
                  <MapButton onClick={this.selectView('map')} className={`${showMapView && 'active'}`}>
                    <FormattedMessage {...messages.map} />
                  </MapButton>
                </ViewButtons>
              </FeatureFlag>
            }
          </RightFilterArea>
        </FiltersArea>

        {showCardView && querying &&
          <Loading id="ideas-loading">
            <Spinner />
          </Loading>
        }

        {!querying && !hasIdeas &&
          <EmptyContainer id="ideas-empty">
            <IdeaIcon name="idea" />
            <EmptyMessage>
              <EmptyMessageLine>
                <FormattedMessage {...messages.noIdea} />
              </EmptyMessageLine>
            </EmptyMessage>
            {/* If there's at least 1 project, we can potentially show this button */}
            {queryParameters.projects && queryParameters.projects.length > 0 &&
              <IdeaButton
                // -If we DON'T have the project filter option, we're not on the ideas index page (only place with projects filter)
                // Other places that use this component always only have a project tied to them
                // We can grab its id by getting the first element of the projects parameter.
                // -If we DO have the project filter, we cannot show an idea button that links to a particular project
                // Hence the projectId will be undefined and we link to the project selection page before showing the idea
                projectId={!allowProjectsFilter ? (queryParameters.projects && queryParameters.projects[0]) : undefined}
                phaseId={queryParameters.phase}
              />
            }
          </EmptyContainer>
        }

        {showCardView && !querying && hasIdeas && ideasList &&
          <IdeasList id="e2e-ideas-list">
            {ideasList.map((idea) => (
              <StyledIdeaCard
                key={idea.id}
                ideaId={idea.id}
                participationMethod={participationMethod}
                participationContextId={participationContextId}
                participationContextType={participationContextType}
              />
            ))}
          </IdeasList>
        }

        {showCardView && !querying && hasMore &&
          <Footer>
            <ShowMoreButton
              onClick={this.loadMore}
              size="1"
              style="secondary"
              text={<FormattedMessage {...messages.showMore} />}
              processing={loadingMore}
              height="50px"
              icon="showMore"
              iconPos="left"
              textColor={theme.colorText}
              textHoverColor={darken(0.1, theme.colorText)}
              bgColor={rgba(theme.colorText, 0.08)}
              bgHoverColor={rgba(theme.colorText, 0.12)}
              fontWeight="500"
            />
          </Footer>
        }

        {showMapView && hasIdeas &&
          <IdeasMap projectIds={queryParameters.projects} phaseId={queryParameters.phase} />
        }
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  ideas: ({ render, children, ...getIdeasInputProps }) => <GetIdeas {...getIdeasInputProps}>{render}</GetIdeas>
});

const IdeaCardsWithHoCs = withTheme<Props, State>(IdeaCards);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaCardsWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
