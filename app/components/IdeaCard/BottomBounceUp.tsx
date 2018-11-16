import React from 'react';
import styled, { keyframes } from 'styled-components';
import Icon, { IconNames } from 'components/UI/Icon';

const doubleBounce = keyframes`
  0% {
    transform: scale(1, 0);
    opacity: 0;
  }
  5% { transform: scale(1,0.17942745647835484); }
  10% { transform: scale(1,0.5453767165955569); }
  15% { transform: scale(1,0.894404964443162); }
  20% { transform: scale(1,1.1203760160160154); }
  25% { transform: scale(1,1.2051533263082377); }
  30% { transform: scale(1,1.1848074616294655); }
  35% { transform: scale(1,1.1134007773010595); }
  40% { transform: scale(1,1.037247338664745); }
  45% { transform: scale(1,0.9833121263387835); }
  50% { transform: scale(1,0.9591514931191875); opacity: 1; }
  55% { transform: scale(1,0.9592070055589312); }
  60% { transform: scale(1,0.9725345308087797); }
  65% { transform: scale(1,0.9888015967917715); }
  70% { transform: scale(1,1.0013794350134355); }
  75% { transform: scale(1,1.0078326552211365); }
  80% { transform: scale(1,1.008821093113004); }
  85% { transform: scale(1,1.0064881982177143); }
  90% { transform: scale(1,1.0030929569279976); }
  95% { transform: scale(1,1.00022141474777); }
  100% {
    transform: scale(1, 1);
  }
`;

const Container = styled.div`
  background-color: #fff;
  position: relative;
  animation: ${doubleBounce} 450ms linear;
  transform-origin: bottom;
  border-top: solid 1px #e5e5e5;
  background: #fff;
  will-change: transform;
`;

const IconWrapper = styled.div`
  position: absolute;
  top: -18px;
  right: 25px;
  width: 40px;
  height: 40px;
  display:flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border-radius: 50%;
  border: solid 1px #e5e5e5;
  background: #fff;
`;

const StyledIcon = styled(Icon) `
  height: 20px;
  fill: #333;
`;

const ContentWrapper = styled.div``;

type Props = {
  icon?: IconNames;
  children?: JSX.Element | null;
};

export default class BottomBounceUp extends React.PureComponent<Props> {
  render() {
    return (
      <Container>
        {this.props.icon &&
          <IconWrapper>
            <StyledIcon name={this.props.icon} />
          </IconWrapper>
        }
        <ContentWrapper>
          {this.props.children}
        </ContentWrapper>
      </Container>
    );
  }
}
