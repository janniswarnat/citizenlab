import React, { PureComponent } from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import ContentContainer from 'components/ContentContainer';
import Link from 'utils/cl-router/Link';
import Button from 'components/UI/Button';
import CloseIconButton from 'components/UI/CloseIconButton';
import styled from 'styled-components';
import { media, fontSizes, colors, isRtl } from 'utils/styleUtils';
import { rgba } from 'polished';

const Container = styled.div`
  position: fixed;
  bottom: 0;
  color: white;
  background: ${colors.adminTextColor};
  font-size: ${fontSizes.base};
  z-index: 1001;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 20px;

  ${media.smallerThanMaxTablet`
    bottom: ${(props) => props.theme.mobileMenuHeight}px;
  `}
`;

const ContentContainerInner = styled.div`
  display: flex;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.smallerThanMinTablet`
    max-width: auto;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
  `}
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: 40px;

  ${media.smallerThanMinTablet`
    margin-right: 0px;
    margin-bottom: 20px;
  `}

  ${isRtl`
    margin-right: 0;
    margin-left: 40px;

    ${media.smallerThanMinTablet`
        margin-left: 0px;
    `}
  `}
`;

const Line = styled.div`
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  &.first {
    margin-bottom: 4px;
  }

  ${media.phone`
    &.second {
      display: none;
    }
  `}
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: underline;

  &:hover,
  &:focus {
    color: white;
    text-decoration: underline;
  }
`;

const ButtonContainer = styled.div`
  display: flex;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const PreferencesButton = styled(Button)`
  margin-right: 10px;

  ${media.smallerThanMinTablet`
    margin-right: 0px;
    order: 2;
  `}

  ${isRtl`
    margin-right: 0;
    margin-left: 10px;

    ${media.smallerThanMinTablet`
        margin-left: 0px;
    `}
  `}
`;

const AcceptButton = styled(Button)`
  ${media.smallerThanMinTablet`
    margin-right: 10px;
    order: 1;
  `}
`;

const StyledCloseIconButton = styled(CloseIconButton)`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;

  ${media.smallerThan1280px`
    display: none;
  `}
`;

interface Props {
  onAccept: () => void;
  onChangePreferences: () => void;
}

class Banner extends PureComponent<Props> {
  render() {
    const { onAccept, onChangePreferences } = this.props;

    const policyLink = (
      <StyledLink to="/pages/cookie-policy">
        <FormattedMessage {...messages.policyLink} />
      </StyledLink>
    );

    return (
      <Container tabIndex={0} role="dialog" id="e2e-cookie-banner">
        <ContentContainer mode="page">
          <ContentContainerInner>
            <Left>
              <Line className="first">
                <FormattedMessage
                  {...messages.mainText}
                  values={{ policyLink }}
                />
              </Line>
              <Line className="second">
                <FormattedMessage {...messages.subText} />
              </Line>
            </Left>
            <ButtonContainer>
              <PreferencesButton
                borderColor="transparent"
                textColor="#fff"
                bgColor={colors.adminTextColor}
                bgHoverColor={rgba(255, 255, 255, 0.15)}
                onClick={onChangePreferences}
                className="integration-open-modal"
              >
                <FormattedMessage {...messages.manage} />
              </PreferencesButton>
              <AcceptButton
                className="e2e-accept-cookies-btn"
                buttonStyle="primary-inverse"
                textColor={colors.adminTextColor}
                textHoverColor={colors.adminTextColor}
                onClick={onAccept}
              >
                <FormattedMessage {...messages.accept} />
              </AcceptButton>
            </ButtonContainer>
          </ContentContainerInner>
        </ContentContainer>
        <StyledCloseIconButton
          a11y_buttonActionMessage={messages.ariaButtonClose}
          onClick={onAccept}
          iconColor={rgba(255, 255, 255, 0.7)}
          iconColorOnHover={'#fff'}
        />
      </Container>
    );
  }
}

export default Banner;
