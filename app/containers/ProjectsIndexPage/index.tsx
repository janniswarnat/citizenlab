import React from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectAndFolderCards from 'components/ProjectAndFolderCards';
import CityLogoSection from 'components/CityLogoSection';
import ProjectsIndexMeta from './ProjectsIndexMeta';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, fontSizes, colors } from 'utils/styleUtils';

const Container = styled.main`
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: ${colors.background};

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  flex: 1 1 auto;
  padding-top: 60px;
  padding-bottom: 100px;

  ${media.smallerThanMinTablet`
    padding-top: 30px;
  `}
`;

const PageTitle = styled.div`
  & h1 {
    color: ${colors.text};
    font-size: ${fontSizes.xxxxl}px;
    line-height: normal;
    font-weight: 500;
  }
  text-align: center;
  margin: 0;
  padding: 0;
  margin-bottom: 40px;

  ${media.smallerThanMaxTablet`
    text-align: left;
    margin-bottom: 20px;
  `}

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.xxxl}px;
  `}
`;

export default React.memo(() => (
  <>
    <ProjectsIndexMeta />
    <Container>
      <StyledContentContainer mode="page">
        <PageTitle>
          <FormattedMessage tagName="h1" {...messages.pageTitle} />
        </PageTitle>
        <ProjectAndFolderCards
          showTitle={false}
          layout="threecolumns"
          publicationStatusFilter={['published', 'archived']}
        />
      </StyledContentContainer>
      <CityLogoSection />
    </Container>
  </>
));
