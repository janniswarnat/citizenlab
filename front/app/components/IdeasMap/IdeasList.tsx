import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from 'components/IdeaCards/tracks';

// components
import { Icon, Spinner } from 'cl2-component-library';
import TopicFilterDropdown from 'components/IdeaCards/TopicFilterDropdown';
import SelectSort from 'components/IdeaCards/SortFilterDropdown';
import ProjectFilterDropdown from 'components/IdeaCards/ProjectFilterDropdown';
import SearchInput from 'components/UI/SearchInput';
import Button from 'components/UI/Button';
import IdeaMapCard from './IdeaMapCard';

// resources
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';
import GetIdeas, {
  Sort,
  GetIdeasChildProps,
  InputProps as GetIdeasInputProps,
} from 'resources/GetIdeas';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetIdeaCustomFieldsSchemas, {
  GetIdeaCustomFieldsSchemasChildProps,
} from 'resources/GetIdeaCustomFieldsSchemas';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// i18n
import messages from 'components/IdeaCards/messages';
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

// style
import styled, { withTheme } from 'styled-components';
import {
  media,
  colors,
  fontSizes,
  viewportWidths,
  defaultCardStyle,
  isRtl,
} from 'utils/styleUtils';
import { rgba } from 'polished';

// typings
import {
  IdeaDefaultSortMethod,
  ParticipationMethod,
  ideaDefaultSortMethodFallback,
} from 'services/participationContexts';
import { IParticipationContextType } from 'typings';
import { withRouter, WithRouterProps } from 'react-router';
import { CustomFieldCodes } from 'services/ideaCustomFieldsSchemas';

const Container = styled.div`
  width: 100%;
`;

const Loading = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${defaultCardStyle};
`;

const FiltersArea = styled.div`
  width: 100%;
  min-height: 54px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 30px;
  `}
`;

const FilterArea = styled.div`
  display: flex;
  align-items: center;
`;

const LeftFilterArea = styled(FilterArea)`
  flex: 1 1 auto;

  &.hidden {
    display: none;
  }

  ${media.smallerThanMinTablet`
    display: flex;
    flex-direction: column;
    align-items: stretch;
  `}
`;

const RightFilterArea = styled(FilterArea)`
  display: flex;
  align-items: center;

  &.hidden {
    display: none;
  }
`;

const DropdownFilters = styled.div`
  display: flex;
  align-items: center;

  &.hidden {
    display: none;
  }
`;

const StyledSearchInput = styled(SearchInput)`
  width: 200px;
  margin-right: 30px;

  ${isRtl`
    margin-right: 0;
    margin-left: auto;
  `}

  ${media.smallerThanMinTablet`
    width: 100%;
    margin-right: 0px;
    margin-left: 0px;
    margin-bottom: 20px;
  `}
`;

const IdeasList = styled.div`
  margin-left: -12px;
  margin-right: -12px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const StyledIdeaMapCard = styled(IdeaMapCard)``;

const EmptyContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding-top: 100px;
  padding-bottom: 100px;
  ${defaultCardStyle};
`;

const IdeaIcon = styled(Icon)`
  flex: 0 0 26px;
  width: 26px;
  height: 26px;
  fill: ${colors.label};
`;

const EmptyMessage = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 12px;
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

const ListView = styled.div``;

interface InputProps extends GetIdeasInputProps {
  defaultSortingMethod?: IdeaDefaultSortMethod;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
  className?: string;
  allowProjectsFilter?: boolean;
}

interface DataProps {
  locale: GetLocaleChildProps;
  windowSize: GetWindowSizeChildProps;
  ideas: GetIdeasChildProps;
  project: GetProjectChildProps;
  ideaCustomFieldsSchemas: GetIdeaCustomFieldsSchemasChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

interface State {}

class WithoutFiltersSidebar extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  loadMore = () => {
    trackEventByName(tracks.loadMoreIdeas);
    this.props.ideas.onLoadMore();
  };

  handleSearchOnChange = (search: string) => {
    this.props.ideas.onChangeSearchTerm(search);
  };

  handleProjectsOnChange = (projects: string[]) => {
    this.props.ideas.onChangeProjects(projects);
  };

  handleSortOnChange = (sort: Sort) => {
    trackEventByName(tracks.sortingFilter, {
      sort,
    });
    this.props.ideas.onChangeSorting(sort);
  };

  handleTopicsOnChange = (topics: string[]) => {
    trackEventByName(tracks.topicsFilter, {
      topics,
    });
    this.props.ideas.onChangeTopics(topics);
  };

  isFieldEnabled = (fieldCode: CustomFieldCodes) => {
    /*
      If IdeaCards are used in a location that's not inside a project,
      and has no ideaCustomFields settings as such,
      we fall back to true
    */

    const { ideaCustomFieldsSchemas, locale } = this.props;

    if (!isNilOrError(ideaCustomFieldsSchemas) && !isNilOrError(locale)) {
      return (
        ideaCustomFieldsSchemas.ui_schema_multiloc?.[locale]?.[fieldCode]?.[
          'ui:widget'
        ] !== 'hidden'
      );
    }

    return true;
  };

  render() {
    const {
      participationMethod,
      participationContextId,
      participationContextType,
      defaultSortingMethod,
      windowSize,
      ideas,
      className,
      theme,
      allowProjectsFilter,
      project,
    } = this.props;
    const { list, hasMore, querying, loadingMore } = ideas;
    const hasIdeas = !isNilOrError(list) && list.length > 0;
    const topicsEnabled = this.isFieldEnabled('topic_ids');
    const smallerThanBigTablet = !!(
      windowSize && windowSize <= viewportWidths.largeTablet
    );
    const biggerThanSmallTablet = !!(
      windowSize && windowSize >= viewportWidths.smallTablet
    );
    const biggerThanLargeTablet = !!(
      windowSize && windowSize >= viewportWidths.largeTablet
    );
    const smallerThan1100px = !!(windowSize && windowSize <= 1100);
    const smallerThanPhone = !!(
      windowSize && windowSize <= viewportWidths.phone
    );

    return (
      <Container className={className || ''}>
        <FiltersArea className={`ideasContainer`}>
          <LeftFilterArea>
            <StyledSearchInput onChange={this.handleSearchOnChange} />
          </LeftFilterArea>

          <RightFilterArea>
            <DropdownFilters>
              <SelectSort
                onChange={this.handleSortOnChange}
                alignment={biggerThanLargeTablet ? 'right' : 'left'}
                defaultSortingMethod={defaultSortingMethod || null}
              />
              {allowProjectsFilter && (
                <ProjectFilterDropdown onChange={this.handleProjectsOnChange} />
              )}
              {topicsEnabled && (
                <TopicFilterDropdown
                  onChange={this.handleTopicsOnChange}
                  alignment={biggerThanLargeTablet ? 'right' : 'left'}
                  projectId={!isNilOrError(project) ? project.id : null}
                />
              )}
            </DropdownFilters>
          </RightFilterArea>
        </FiltersArea>

        <ListView>
          {querying ? (
            <Loading id="ideas-loading">
              <Spinner />
            </Loading>
          ) : (
            <>
              {hasIdeas && list ? (
                <IdeasList>
                  {list.map((idea) => (
                    <StyledIdeaMapCard ideaId={idea.id} />
                    // <StyledIdeaCard
                    //   key={idea.id}
                    //   ideaId={idea.id}
                    //   participationMethod={participationMethod}
                    //   participationContextId={participationContextId}
                    //   participationContextType={participationContextType}
                    //   hideImage={smallerThanBigTablet && biggerThanSmallTablet}
                    //   hideImagePlaceholder={smallerThanBigTablet}
                    //   hideIdeaStatus={
                    //     (biggerThanLargeTablet && smallerThan1100px) ||
                    //     smallerThanPhone
                    //   }
                    // />
                  ))}
                </IdeasList>
              ) : (
                <EmptyContainer id="ideas-empty">
                  <IdeaIcon ariaHidden name="idea" />
                  <EmptyMessage>
                    <EmptyMessageLine>
                      <FormattedMessage {...messages.noFilteredResults} />
                    </EmptyMessageLine>
                  </EmptyMessage>
                </EmptyContainer>
              )}
              {hasMore && (
                <Footer>
                  <ShowMoreButton
                    onClick={this.loadMore}
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
                  />
                </Footer>
              )}
            </>
          )}
        </ListView>
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  locale: <GetLocale />,
  windowSize: <GetWindowSize />,
  ideas: ({ render, ...getIdeasInputProps }) => (
    <GetIdeas
      {...getIdeasInputProps}
      pageSize={24}
      sort={
        getIdeasInputProps.defaultSortingMethod || ideaDefaultSortMethodFallback
      }
    >
      {render}
    </GetIdeas>
  ),
  project: ({ params, render }) => (
    <GetProject projectSlug={params.slug}>{render}</GetProject>
  ),
  ideaCustomFieldsSchemas: ({ project, render }) => {
    return (
      <GetIdeaCustomFieldsSchemas
        projectId={!isNilOrError(project) ? project.id : null}
      >
        {render}
      </GetIdeaCustomFieldsSchemas>
    );
  },
});

const WithoutFiltersSidebarWithHoCs = withTheme(
  injectIntl(WithoutFiltersSidebar)
);

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <WithoutFiltersSidebarWithHoCs {...inputProps} {...dataProps} />
    )}
  </Data>
));
