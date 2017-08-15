import React from 'react';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router';

import home from './home.svg';
import ideas from './ideas.svg';
import projects from './projects.svg';
import profile from './profile.svg';

import messages from '../../messages';

const Container = styled.div`
  position: fixed;

  height: 80px;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  box-shadow: 0px -3px 20px rgba(0,0,0,0.25);

  padding: 4px 0;

  display: flex;
  justify-content: space-around;

  ${media.notPhone`
    display: none;
  `}
`;

const NavigationItem = styled(Link)`
  display:flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  cursor: pointer;
  opacity: 0.6;

  &.active {
    opacity: 1;
  }
`;

const NavigationIcon = styled.img`
  height: 26px;
`;

const NavigationLabel = styled.div`
  font-size: 14px;
  color: #000000;

  ${NavigationItem}.active & {
    font-weight: bold;
  }
`;


class MobileNavigation extends React.PureComponent {

  render() {
    return (
      <Container>
        <NavigationItem to="/" activeClassName="active">
          <NavigationIcon src={home} />
          <NavigationLabel>
            <FormattedMessage {...messages.mobilePageHome} />
          </NavigationLabel>
        </NavigationItem>
        <NavigationItem to="/ideas" activeClassName="active">
          <NavigationIcon src={ideas} />
          <NavigationLabel>
            <FormattedMessage {...messages.mobilePageIdeas} />
          </NavigationLabel>
        </NavigationItem>
        <NavigationItem to="/projects" activeClassName="active">
          <NavigationIcon src={projects} />
          <NavigationLabel>
            <FormattedMessage {...messages.mobilePageProjects} />
          </NavigationLabel>
        </NavigationItem>
        <NavigationItem to="/profile/edit" activeClassName="active">
          <NavigationIcon src={profile} />
          <NavigationLabel>
            <FormattedMessage {...messages.mobilePageProfile} />
          </NavigationLabel>
        </NavigationItem>
      </Container>
    );
  }
}

export default MobileNavigation;
