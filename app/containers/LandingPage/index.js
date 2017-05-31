import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import styled from 'styled-components';
// import { lighten } from 'polished';
import WatchSagas from 'containers/WatchSagas';
import { preprocess } from 'utils';

import {
  selectLandingPage,
  makeSelectIdeas,
  makeSelectProjects,
} from './selectors';
import { loadIdeas, loadProjects } from './actions';
import sagas from './sagas';
import Idea from './components/idea';
import Project from './components/project';
import { media } from '../../utils/styleUtils';
import headerImage from '../../../assets/img/landingpage/header.png';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f2f2f2;
`;

const HeaderContainer = styled.div`
  width: 100%;
  height: 305px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 25px;
  padding-right: 25px;
  position: relative;

  ${media.notPhone`
    height: 305px;
  `}

  ${media.phone`
    min-height: 305px;
  `}
`;

const HeaderOverlay = styled.div`
  background-color: #003a7d;
  opacity: 0.65;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderBackground = styled.div`
  background-image: url(${headerImage});
  background-repeat: no-repeat;
  background-position: center top;
  background-size: cover;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderTitle = styled.h1`
  color: #fff;
  font-size: 46px;
  line-height: 50px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 115px;
  display: flex;
  z-index: 1;

  ${media.tablet`
    font-size: 40px;
    line-height: 48px;
  `}

  ${media.phone`
    font-weight: 600;
    font-size: 34px;
    line-height: 38px;
  `}

  ${media.smallPhone`
    font-weight: 600;
    font-size: 30px;
    line-height: 34px;
  `}
`;

const HeaderSubtitle = styled.h2`
  color: #fff;
  font-size: 30px;
  line-height: 34px;
  font-weight: 100;
  text-align: center;
  margin: 0;
  margin-top: 10px;
  padding: 0;
  opacity: 0.8;
  z-index: 1;

  ${media.tablet`
    font-size: 28px;
    line-height: 32px;
  `}

  ${media.phone`
    font-size: 24px;
    line-height: 28px;
  `}

  ${media.smallPhone`
    font-size: 20px;
    line-height: 24px;
  `}
`;

const TabBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding-left: 30px;
  padding-right: 30px;
  background: white;
  border-bottom: solid 1px #e0e0e0;

  ${media.phone`
    justify-content: center;
  `}
`;

const TabBarInner = styled.div`
  max-width: 1050px;
  display: flex;

  ${media.notPhone`
    width: 100%;
  `}
`;

const TabLine = styled.div`
  height: 4px;
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background: #00a8e2;
`;

const Tab = styled.div`
  font-size: 19px;
  font-weight: 500;
  color: ${(props) => props.active ? '#00a8e2' : '#444'};
  text-transform: uppercase;
  padding-top: 22px;
  padding-bottom: 22px;
  padding-left: 0px;
  padding-right: 0px;
  cursor: pointer;
  position: relative;
  margin-right: 50px;

  &:hover {
    color: #00a8e2;
  }

  & > ${TabLine} {
    opacity: ${(props) => props.active ? 1 : 0};
  }

  &:last-child {
    margin-right: 0px;
  }

  ${media.phone`
    font-size: 18px;
    margin-right: 40px;
    padding-top: 20px;
    padding-bottom: 20px;
  `}

  ${media.smallPhone`
    font-size: 16px;
    margin-right: 30px;
  `}
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 30px;
  padding-right: 30px;
`;

const Content = styled.div`
  width: 100%;
  max-width: 1050px;
`;

const Section = styled.div`
  margin-top: 80px;
  padding-bottom: 30px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 15px;
  /* border: solid 1px purple; */

  ${media.phone`
    padding-top: 50px;
  `}

  ${media.smallPhone`
    flex-wrap: wrap;
  `}
`;

const SectionTitle = styled.h2`
  flex: 1;
  color: #555;
  font-size: 31px;
  line-height: 35px;
  font-weight: 400;
  margin: 0;
  margin-right: 20px;
  /* border: solid 1px green; */

  ${media.phone`
    font-size: 32px;
    line-height: 36px;
  `}
`;

const ViewAllButton = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;

  &:hover {
    div {
      color: #00a8e2;
    }
  
    svg {
      fill: #00a8e2;
    }
  }

  ${media.phone`
    margin-top: 10px;
  `}
`;

const ViewAllButtonText = styled.div`
  /* color: #888; */
  color: #00a8e2;
  font-size: 18px;
  font-weight: 300;
  line-height: 16px;
  margin-right: 7px;
`;

const ViewAllButtonIcon = styled.svg`
  /* fill: #888; */
  fill: #00a8e2;
  height: 11px;
  margin-top: -1px;
`;

const SectionContainer = styled.div`
  font-size: 20px;
  color: #999;
  margin-top: 10px;
  display: flex;

  ${media.tablet`
    flex-wrap: wrap;
  `}

  ${media.phone`
    flex-direction: column;
  `}
`;

const Footer = styled.div`
  color: #333;
  font-weight: 400;
  font-size: 17px;
  text-align: center;
  display: inline-block;
  padding-left: 30px;
  padding-right: 30px;
  margin-top: 60px;
  margin-bottom: 50px;
  margin-left: auto;
  margin-right: auto;
`;

class LandingPage extends React.Component {
  componentDidMount() {
    this.props.loadIdeas(1, 4);
    this.props.loadProjects(1, 2);
  }

  openIdea = (id) => () => {
    console.log(id);
    window.history.pushState('page2', 'Title', '/page2.php');
  };

  openProject = (id) => () => {
    console.log(id);
  };

  render() {
    let ideasList = null;
    let projectsList = null;
    const { ideas, loadingIdeas, loadIdeasError, projects, loadingProjects, loadProjectsError } = this.props;

    if (loadingIdeas) {
      ideasList = <div>Loading...</div>;
    } else if (loadIdeasError) {
      ideasList = <div>An error occured</div>;
    } else if (ideas && ideas.size > 0) {
      ideasList = ideas.map((idea) => (
        <Idea key={idea.get('id')} idea={idea.get('attributes')} onClick={this.openIdea(idea.get('id'))}></Idea>
      ));
    }

    if (loadingProjects) {
      projectsList = <div>Loading...</div>;
    } else if (loadProjectsError) {
      projectsList = <div>An error occured</div>;
    } else if (projects && projects.size > 0) {
      projectsList = projects.map((project) => (
        <Project key={project.get('id')} project={project.get('attributes')} onClick={this.openProject(project.get('id'))}></Project>
      ));
    }

    return (
      <div>
        <WatchSagas sagas={sagas} />

        <Container>
          <HeaderContainer>
            <HeaderBackground></HeaderBackground>
            <HeaderOverlay></HeaderOverlay>
            <HeaderTitle>Co-create Oostende</HeaderTitle>
            <HeaderSubtitle>Share your ideas for Oostende and co-create your city</HeaderSubtitle>
          </HeaderContainer>

          <TabBar>
            <TabBarInner>
              <Tab first active>Overview<TabLine /></Tab>
              <Tab>Ideas<TabLine /></Tab>
              <Tab>Projects<TabLine /></Tab>
            </TabBarInner>
          </TabBar>

          <ContentContainer>
            <Content>
              <Section>
                <SectionHeader>
                  <SectionTitle>Ideas for Oostende</SectionTitle>
                  <ViewAllButton>
                    <ViewAllButtonText>View all ideas</ViewAllButtonText>
                    <ViewAllButtonIcon height="100%" viewBox="8.86 6.11 6.279 10.869">
                      <path d="M15.14 11.545L9.705 6.11l-.845.846 4.298 4.306.282.283-.282.283-4.298 4.307.845.844" />
                    </ViewAllButtonIcon>
                  </ViewAllButton>
                </SectionHeader>
                <SectionContainer>
                  {ideasList}
                </SectionContainer>
              </Section>

              <Section>
                <SectionHeader>
                  <SectionTitle>Projects from Oostende</SectionTitle>
                  <ViewAllButton>
                    <ViewAllButtonText>View all projects</ViewAllButtonText>
                    <ViewAllButtonIcon height="100%" viewBox="8.86 6.11 6.279 10.869">
                      <path d="M15.14 11.545L9.705 6.11l-.845.846 4.298 4.306.282.283-.282.283-4.298 4.307.845.844" />
                    </ViewAllButtonIcon>
                  </ViewAllButton>
                </SectionHeader>
                <SectionContainer>
                  {projectsList}
                </SectionContainer>
              </Section>
            </Content>
          </ContentContainer>

          <Footer>Powered by CitizenLab | Geef je feedback over het platform</Footer>
        </Container>
      </div>
    );
  }
}

LandingPage.propTypes = {
  ideas: ImmutablePropTypes.list.isRequired,
  loadingIdeas: PropTypes.bool,
  loadIdeasError: PropTypes.bool.isRequired,
  projects: ImmutablePropTypes.list.isRequired,
  loadingProjects: PropTypes.bool,
  loadProjectsError: PropTypes.bool.isRequired,
  loadIdeas: PropTypes.func.isRequired,
  loadProjects: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectLandingPage,
  ideas: makeSelectIdeas(),
  projects: makeSelectProjects(),
});

const actions = { loadIdeas, loadProjects };

const mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { pageState, ideas, projects } = stateProps;
  return {
    ideas,
    loadingIdeas: pageState.get('loadingIdeas'),
    loadIdeasError: pageState.get('loadIdeasError'),
    projects,
    loadingProjects: pageState.get('loadingProjects'),
    loadProjectsError: pageState.get('loadProjectsError'),
    ...dispatchProps,
    ...ownProps,
  };
};

export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(LandingPage);
