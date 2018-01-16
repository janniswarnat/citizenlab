import * as React from 'react';
import { size, isEmpty } from 'lodash';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { browserHistory } from 'react-router';

import { injectResources, InjectedResourcesLoaderProps } from 'utils/resourceLoaders/resourcesLoader';
import { projectsStream, IProjectData } from 'services/projects';

import ContentContainer from 'components/ContentContainer';
import ProjectCard from './ProjectCard';
import OpenProjectCard from './OpenProjectCard';
import Radio from 'components/UI/Radio';
import Button from 'components/UI/Button';
import ButtonBar from 'components/ButtonBar';
import Spinner from 'components/UI/Spinner';


import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const StyledContentContainer = styled(ContentContainer)`
  padding-top: 4rem;
`;

const ColumnsContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0 -2rem;

  ${media.smallerThanMaxTablet`
    flex-direction: column;
  `}
`;

const PageTitle = styled.h1`
  width: 100%;
  color: #444;
  font-size: 34px;
  font-weight: 500;
  line-height: 40px;
  margin: 0;
  padding: 0;
  ${media.smallerThanMaxTablet`
    font-size: 28px;
    line-height: 34px;
    margin-right: 12px;
  `}
`;

const Column = styled.div`
  padding: 2rem;
  flex: 1;
`;

const LeftColumn = Column.extend`
`;

const RightColumn = Column.extend`
`;

const ColumnTitle = styled.h2`
  font-weight: 400;
`;

const ColumnExplanation = styled.div`
  color: #474747;
  font-size: 18px;
  line-height: 30px;
  font-weight: 300;
  min-height: 7rem;
`;

const ProjectsList = styled.div`
  padding: 2rem 0;
`;

const ProjectWrapper = styled.div`
  display: flex;
  flex-direction: row;
  ${media.biggerThanDesktop`
    margin-left: -30px;
  `}
`;

const ButtonBarInner = styled.div`
  width: 100%;
  max-width: ${props => props.theme.maxPageWidth}px;
  display: flex;
  align-items: center;

  .Button {
    margin-right: 10px;
  }

  ${media.smallerThanDesktop`
    margin-left: 35px;
  `}
`;

const WithoutButtonBar = styled.div`
  ${media.biggerThanMaxTablet`
    display: none;
  `}
  padding-bottom: 20px;
`;

type Props = {
  theme: any;
  location: any;
};

type State = {
  selectedProjectId: string | null;
};

class IdeasProjectSelectPage extends React.Component<Props & InjectedResourcesLoaderProps<IProjectData>, State> {

  constructor(props) {
    super(props);
    this.state = {
      selectedProjectId: null,
    };
  }

  handleProjectClick = (project) => () => {
    this.setState({ selectedProjectId: project.id });
  }

  redirectTo = (projectSlug) => {
    const queryParams = (this.props.location && this.props.location.search) || '';
    browserHistory.push(`/projects/${projectSlug}/ideas/new${queryParams}`);
  }

  handleOnSubmitClick = () => {
    if (this.props.projects && this.props.projects.all) {
      const project = this.props.projects.all.find((project) => project.id === this.state.selectedProjectId);
      if (project) {
        this.redirectTo(project.attributes.slug);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { loading, hasMore, all } = nextProps.projects;
    if (!loading && !hasMore && size(all) === 1) {
      this.redirectTo(nextProps.projects.all[0].attributes.slug);
      return false;
    }
    return true;
  }

  render() {
    const { selectedProjectId } = this.state;
    const { all: projects, loadMore, hasMore, loading } = this.props.projects;
    const projectsLoading = this.props.projects.loading;
    const openProject = this.props.projects.all && this.props.projects.all[0];

    if (loading && !projects) return null;

    return (
      <StyledContentContainer>
        <PageTitle>
          <FormattedMessage {...messages.pageTitle} />
        </PageTitle>
        <ColumnsContainer>
          <LeftColumn>
            <ColumnTitle>
              <FormattedMessage {...messages.cityProjects} />
            </ColumnTitle>
            <ColumnExplanation>
              <FormattedMessage {...messages.cityProjectsExplanation} />
            </ColumnExplanation>
            <ProjectsList>
              {projects && projects.map((project) => (
                <ProjectWrapper key={project.id}>
                  <Radio
                    onChange={this.handleProjectClick(project)}
                    currentValue={selectedProjectId}
                    value={project.id}
                    name="project"
                    id={project.id}
                    label=""
                  />
                  <ProjectCard
                    onClick={this.handleProjectClick(project) as any}
                    project={project as any}
                    selected={(selectedProjectId === project.id) as any}
                  />
                </ProjectWrapper>
              ))}
            </ProjectsList>
            {hasMore && <a onClick={loadMore} role="button"><FormattedMessage {...messages.loadMore} /></a>}
          </LeftColumn>
          {projects && openProject &&
            <RightColumn>
              <ColumnTitle>
                <FormattedMessage {...messages.openProject} />
              </ColumnTitle>
              <ColumnExplanation>
                <FormattedMessage {...messages.openProjectExplanation} />
              </ColumnExplanation>
              <ProjectsList>
                <ProjectWrapper key={openProject.id}>
                  <Radio
                    onChange={this.handleProjectClick(openProject)}
                    currentValue={selectedProjectId}
                    value={openProject.id}
                    name="project"
                    id={openProject.id}
                    label=""
                  />
                  <OpenProjectCard
                    project={projects[0]}
                  />
                </ProjectWrapper>
              </ProjectsList>
            </RightColumn>
          }
        </ColumnsContainer>
        <ButtonBar>
          <ButtonBarInner>
            <Button
              className="e2e-submit-project-select-form"
              size="2"
              text={<FormattedMessage {...messages.continueButton} />}
              onClick={this.handleOnSubmitClick}
              disabled={!selectedProjectId}
            />
          </ButtonBarInner>
        </ButtonBar>
        <WithoutButtonBar>
          <Button
            className="e2e-submit-project-select-form"
            size="2"
            text={<FormattedMessage {...messages.continueButton} />}
            onClick={this.handleOnSubmitClick}
            disabled={!selectedProjectId}
          />
        </WithoutButtonBar>
      </StyledContentContainer>
    );
  }
}

export default injectResources('projects', projectsStream)(IdeasProjectSelectPage);
