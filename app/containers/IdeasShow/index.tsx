import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import scrollToComponent from 'react-scroll-to-component';
import * as bowser from 'bowser';

// router
import { Link, browserHistory } from 'react-router';
import { Location } from 'history';

// components
import VoteControl from 'components/VoteControl';
import Avatar from 'components/Avatar';
import StatusBadge from 'components/StatusBadge';
import Error from 'components/UI/Error';
import Icon from 'components/UI/Icon';
import Comments from './CommentsContainer';
import Sharing from './Sharing';
import Author from './Author';
import IdeaMeta from './IdeaMeta';
import Unauthenticated from './Unauthenticated';
import IdeaMap from './IdeaMap';
import Activities from './Activities';
import Button from 'components/UI/Button';
import UserName from 'components/UI/UserName';
import HasPermission from 'components/HasPermission';

// services
import { localeStream } from 'services/locale';
import { ideaByIdStream, IIdea } from 'services/ideas';
import { userByIdStream, IUser } from 'services/users';
import { ideaImageStream, IIdeaImage } from 'services/ideaImages';
import { ideaStatusStream } from 'services/ideaStatuses';
import { commentsForIdeaStream, commentStream, IComments, IComment } from 'services/comments';
import { projectByIdStream, IProject } from 'services/projects';

// i18n
import T from 'components/T';
import { FormattedRelative } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// animations
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled, { css } from 'styled-components';
import { media, color } from 'utils/styleUtils';
import { darken } from 'polished';
import { hasPermission } from 'services/permissions';

const Container = styled.div``;

const IdeaContainer = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  margin: 0;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
  padding-top: 60px;
  padding-bottom: 60px;
  padding-left: 30px;
  padding-right: 30px;
  position: relative;

  ${media.smallerThanMaxTablet`
    padding-top: 30px;
  `}
`;

const BelongsToProject = styled.p`
  width: 100%;
  color: ${props => props.theme.colors.label};
  font-weight: 300;
  font-size: 16px;
  line-height: 21px;
  margin-bottom: 15px;
`;

const ProjectLink = styled(Link)`
  color: inherit;
  font-weight: 400;
  font-size: inherit;
  line-height: inherit;
  transition: all 100ms ease-out;
  margin-left: 4px;

  &:hover {
    color: ${(props) => darken(0.2, props.theme.colors.label)};
    text-decoration: underline;
  }
`;

const Header = styled.div`
  margin-bottom: 45px;
  display: flex;
  flex-direction: column;

  ${media.smallerThanMaxTablet`
    margin-bottom: 30px;
  `}
`;

const IdeaTitle = styled.h1`
  width: 100%;
  color: #444;
  font-size: 34px;
  font-weight: 500;
  line-height: 42px;
  margin: 0;
  padding: 0;
  padding-right: 250px;

  ${media.smallerThanMaxTablet`
    font-size: 28px;
    line-height: 34px;
    padding: 0;
    margin-right: 12px;
  `}
`;

const VoteControlMobile = styled(VoteControl)`
  display: none;
  margin-top: 20px;

  ${media.smallerThanMaxTablet`
    display: flex;
  `}
`;

const Content = styled.div`
  width: 100%;
  display: flex;

  ${media.smallerThanMaxTablet`
    flex-direction: column;
  `}
`;

const LeftColumn = styled.div`
  flex-grow: 1;
  margin: 0;
  padding: 0;
  min-width: 0;
`;

const IdeaImage = styled.img`
  width: 100%;
  margin: 0 0 2rem;
  padding: 0;
  border-radius: 8px;
  border: 1px solid ${color('separation')};
`;

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
`;

const AuthorAndAdressWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 25px;
`;

const LocationLabel = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: 15px;
  font-weight: 300;
  margin-right: 6px;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const LocationLabelMobile = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: 14px;
  font-weight: 300;
  margin-right: 6px;

  ${media.biggerThanMinTablet`
    display: none;
  `}
`;

const LocationIcon = styled(Icon)`
  height: 20px;
  fill: ${(props) => props.theme.colors.label};
`;

const LocationButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    ${LocationLabel} {
      color: ${(props) => darken(0.2, props.theme.colors.label)};
    }

    ${LocationIcon} {
      fill: ${(props) => darken(0.2, props.theme.colors.label)};
    }
  }
`;

const MapWrapper = styled.div`
  border-radius: 8px;
  border: 1px solid ${color('separation')};
  height: 265px;
  position: relative;
  overflow: hidden;
  will-change: auto;

  &.map-enter {
    height: 0;
    opacity: 0;
    will-change: height, opacity;

    &.map-enter-active {
      height: 265px;
      opacity: 1;
      transition: all 300ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.map-exit {
    height: 265px;
    opacity: 1;
    will-change: height, opacity;

    &.map-exit-active {
      height: 0;
      opacity: 0;
      transition: all 300ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }
`;

const MapPaddingBottom = styled.div`
  width: 100%;
  height: 30px;
`;

const AddressWrapper = styled.p`
  background: rgba(255, 255, 255, .7);
  border-top: 1px solid #EAEAEA;
  bottom: 0;
  left: 0;
  margin: 0;
  padding: .5rem;
  position: absolute;
  right: 0;
  z-index: 999;
`;

const AuthorAvatar = styled(Avatar)`
  width: 31px;
  height: 31px;
  margin-right: 8px;
  margin-top: 0px;
`;

const AuthorMeta = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0 0 calc(100% - 39px);
  min-width: 0;
`;

const AuthorName = styled(Link) `
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: #333;
    text-decoration: underline;
  }

  ${media.smallerThanMaxTablet`
    font-size: 14px;
    line-height: 18px;
  `}
`;

const TimeAgo = styled.div`
  color: #999;
  font-size: 13px;
  line-height: 17px;
  font-weight: 300;
  margin-top: 2px;

  ${media.smallerThanMaxTablet`
    margin-top: 0px;
  `}
`;

const IdeaBody = styled.div`
  color: #474747;
  font-size: 18px;
  line-height: 30px;
  font-weight: 400;

  p {
    margin-bottom: 25px;
  }
`;

const SeparatorColumn = styled.div`
  flex-shrink: 0;
  flex-grow: 0;
  flex-basis: 1px;
  margin: 0;
  margin-left: 25px;
  margin-right: 25px;
  background: transparent;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const SeparatorRow = styled.div`
  width: 100%;
  height: 1px;
  margin: 0;
  margin-top: 45px;
  margin-bottom: 25px;
  background: #e0e0e0;
  background: #fff;

  ${media.smallerThanMaxTablet`
    margin-top: 20px;
    margin-bottom: 20px;
  `}
`;

const RightColumn = styled.div`
  flex: 0 0 160px;
  margin: 0;
  padding: 0;
`;

const RightColumnDesktop: any = RightColumn.extend`
  &.notSafari {
    position: sticky;
    top: 100px;
    align-self: flex-start;
  }

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const MetaContent = styled.div`
  width: 200px;
  display: flex;
  flex-direction: column;
`;

const VoteLabel = styled.div`
  color: #84939E;
  font-size: 15px;
  font-weight: 400;
  margin-bottom: 12px;
  display: none;

  ${media.smallerThanMaxTablet`
    display: block;
  `}
`;

const StatusContainer = styled.div`
  margin-top: 35px;
`;

const StatusContainerMobile = styled(StatusContainer)`
  margin-top: -20px;
  margin-bottom: 35px;
  transform-origin: top left;
  transform: scale(0.9);

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const StatusTitle = styled.h4`
  color: #84939d;
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  margin-bottom: 8px;
  padding: 0;
`;

const SharingWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledSharing: any = styled(Sharing)`
  margin-top: 45px;
  margin-bottom: 0px;
`;

const StyledSharingMobile = styled(StyledSharing)`
  margin: 0;
  margin-bottom: 30px;
  padding: 0;
  padding-top: 25px;
  padding-bottom: 10px;
  border-top: solid 1px #e0e0e0;
  border-bottom: solid 1px #e0e0e0;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const IconWrapper = styled.div`
  width: 30px;
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  justify-content: flex-start;

  svg {
    width: 20px;
    fill: #84939E;
    transition: all 100ms ease-out;
  }
`;

const GiveOpinionText = styled.div`
  color: #84939E;
  font-size: 15px;
  font-weight: 300;
  white-space: nowrap;
  transition: all 100ms ease-out;
`;

const GiveOpinion = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 100ms ease-out;
  margin: 0;
  padding: 0;

  &:hover {
    ${IconWrapper} svg {
      fill: #333;
    }

    ${GiveOpinionText} {
      color: #333;
    }
  }

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

type Props = {
  ideaId: string;
};

type State = {
  locale: string | null;
  idea: IIdea | null;
  ideaAuthor: IUser | null;
  ideaImage: IIdeaImage | null;
  ideaComments: IComments | null;
  project: IProject | null;
  loading: boolean;
  unauthenticatedError: boolean;
  showMap: boolean;
};

class IdeasShow extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      idea: null,
      ideaAuthor: null,
      ideaImage: null,
      ideaComments: null,
      project: null,
      loading: true,
      unauthenticatedError: false,
      showMap: false,
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { ideaId } = this.props;
    const locale$ = localeStream().observable;
    const comments$ = commentsForIdeaStream(ideaId).observable;
    const idea$ = ideaByIdStream(ideaId).observable.switchMap((idea) => {
      const ideaImages = idea.data.relationships.idea_images.data;
      const ideaImageId = (ideaImages.length > 0 ? ideaImages[0].id : null);
      const ideaAuthorId = idea.data.relationships.author.data ? idea.data.relationships.author.data.id : null;
      const ideaStatusId = (idea.data.relationships.idea_status ? idea.data.relationships.idea_status.data.id : null);
      const ideaImage$ = (ideaImageId ? ideaImageStream(ideaId, ideaImageId).observable : Rx.Observable.of(null));
      const ideaAuthor$ = ideaAuthorId ? userByIdStream(ideaAuthorId).observable : Rx.Observable.of(null);
      const ideaStatus$ = (ideaStatusId ? ideaStatusStream(ideaStatusId).observable : Rx.Observable.of(null));
      const project$ = (idea.data.relationships.project && idea.data.relationships.project.data ? projectByIdStream(idea.data.relationships.project.data.id).observable : Rx.Observable.of(null));

      return Rx.Observable.combineLatest(
        ideaImage$,
        ideaAuthor$,
        ideaStatus$,
        project$,
      ).map(([ideaImage, ideaAuthor, ideaStatus, project]) => ({ idea, ideaImage, ideaAuthor, project }));
    });

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        idea$
      ).subscribe(([locale, { idea, ideaImage, ideaAuthor, project }]) => {
        this.setState({ locale, idea, ideaImage, ideaAuthor, project, loading: false });
      }),

      comments$.subscribe(ideaComments => {
        this.setState({ ideaComments });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  goToUserProfile = () => {
    const { ideaAuthor } = this.state;

    if (ideaAuthor) {
      browserHistory.push(`/profile/${ideaAuthor.data.attributes.slug}`);
    }
  }

  unauthenticatedVoteClick = () => {
    this.setState({ unauthenticatedError: true });
  }

  scrollToCommentForm = (event) => {
    event.preventDefault();

    const element = document.querySelector('.ideaCommentForm');

    if (element) {
      const textarea = element.querySelector('textarea');
      textarea && textarea.focus();
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  handleMapToggle = () => {
    this.setState({ showMap: !this.state.showMap });
  }

  render() {
    const { locale, idea, ideaImage, ideaAuthor, ideaComments, project, loading, unauthenticatedError, showMap } = this.state;

    if (!loading && idea !== null) {
      const authorId = ideaAuthor ? ideaAuthor.data.id : null;
      const firstName = ideaAuthor ? ideaAuthor.data.attributes.first_name : null;
      const lastName = ideaAuthor ? ideaAuthor.data.attributes.last_name : null;
      const createdAt = idea.data.attributes.created_at;
      const titleMultiloc = idea.data.attributes.title_multiloc;
      const bodyMultiloc = idea.data.attributes.body_multiloc;
      const statusId = (idea.data.relationships.idea_status && idea.data.relationships.idea_status.data ? idea.data.relationships.idea_status.data.id : null);
      const ideaImageLarge = (ideaImage && _.has(ideaImage, 'data.attributes.versions.large') ? ideaImage.data.attributes.versions.large : null);
      const ideaImageMedium = (ideaImage && _.has(ideaImage, 'data.attributes.versions.medium') ? ideaImage.data.attributes.versions.medium : null);
      const isSafari = bowser.safari;
      const ideaLocation = idea.data.attributes.location_point_geojson || null;
      const ideaAdress = idea.data.attributes.location_description || null;
      const projectTitleMultiloc = (project && project.data ? project.data.attributes.title_multiloc : null);

      const ideaMetaContent = (
        <MetaContent>
          <VoteLabel>
            <FormattedMessage {...messages.voteOnThisIdea} />
          </VoteLabel>

          {!unauthenticatedError &&
            <VoteControl
              ideaId={idea.data.id}
              unauthenticatedVoteClick={this.unauthenticatedVoteClick}
              size="normal"
            />
          }

          {unauthenticatedError && <Unauthenticated />}

          {statusId &&
            <StatusContainer>
              <StatusTitle><FormattedMessage {...messages.ideaStatus} /></StatusTitle>
              <StatusBadge statusId={statusId} />
            </StatusContainer>
          }

          <SharingWrapper>
            <StyledSharing imageUrl={ideaImageMedium} />

            <GiveOpinion onClick={this.scrollToCommentForm}>
              <IconWrapper>
                <Icon name="comments" />
              </IconWrapper>
              <GiveOpinionText>
                <FormattedMessage {...messages.commentsTitle} />
              </GiveOpinionText>
            </GiveOpinion>
          </SharingWrapper>
        </MetaContent>
      );

      return (
        <Container>
          <IdeaMeta ideaId={idea.data.id} />

          <IdeaContainer id="e2e-idea-show">
            {project && projectTitleMultiloc &&
              <BelongsToProject>
                <FormattedMessage {...messages.postedIn} />
                <ProjectLink to={`/projects/${project.data.attributes.slug}`}>
                  <T value={projectTitleMultiloc} />
                </ProjectLink>
              </BelongsToProject>
            }
            <Header>
              <IdeaTitle>
                <T value={titleMultiloc} />
              </IdeaTitle>
            </Header>

            <Content>
              <LeftColumn>
                {statusId &&
                  <StatusContainerMobile>
                    {/* <StatusTitle><FormattedMessage {...messages.ideaStatus} /></StatusTitle> */}
                    <StatusBadge statusId={statusId} />
                  </StatusContainerMobile>
                }

                {ideaImageLarge ? <IdeaImage src={ideaImageLarge} /> : null}

                <AuthorAndAdressWrapper>
                  <AuthorContainer>
                    <AuthorAvatar userId={authorId} size="small" onClick={authorId ? this.goToUserProfile : () => {}} />
                    <AuthorMeta>
                      <AuthorName to={ideaAuthor ?  `/profile/${ideaAuthor.data.attributes.slug}` :  ''}>
                        <FormattedMessage {...messages.byAuthorName} values={{ authorName: <UserName user={ideaAuthor} /> }} />
                      </AuthorName>
                      {createdAt &&
                        <TimeAgo>
                          <FormattedRelative value={createdAt} />
                          <Activities ideaId={this.props.ideaId} />
                        </TimeAgo>
                      }
                    </AuthorMeta>
                  </AuthorContainer>

                  {ideaLocation && !showMap &&
                    <LocationButton onClick={this.handleMapToggle}>
                      <LocationLabel><FormattedMessage {...messages.openMap} /></LocationLabel>
                      <LocationLabelMobile><FormattedMessage {...messages.Map} /></LocationLabelMobile>
                      <LocationIcon name="position" />
                    </LocationButton>
                  }

                  {ideaLocation && showMap &&
                    <LocationButton onClick={this.handleMapToggle}>
                      <LocationLabel><FormattedMessage {...messages.closeMap} /></LocationLabel>
                      <LocationLabelMobile><FormattedMessage {...messages.Map} /></LocationLabelMobile>
                      <LocationIcon name="close" />
                    </LocationButton>
                  }
                </AuthorAndAdressWrapper>

                {ideaLocation &&
                  <TransitionGroup>
                    {showMap &&
                      <CSSTransition
                        classNames="map"
                        timeout={300}
                        mountOnEnter={true}
                        unmountOnExit={true}
                        exit={true}
                      >
                        <MapWrapper>
                          {ideaAdress && <AddressWrapper>{ideaAdress}</AddressWrapper>}
                          <IdeaMap location={ideaLocation} />
                        </MapWrapper>
                      </CSSTransition>
                    }
                  </TransitionGroup>
                }

                {ideaLocation && showMap &&
                  <MapPaddingBottom />
                }

                <IdeaBody>
                  <T value={bodyMultiloc} />
                </IdeaBody>

                <SeparatorRow />

                <StyledSharingMobile imageUrl={ideaImageMedium} />

                {ideaComments && <Comments ideaId={idea.data.id} />}
              </LeftColumn>

              <SeparatorColumn />

              <RightColumnDesktop className={!isSafari ? 'notSafari' : ''}>
                {ideaMetaContent}
              </RightColumnDesktop>
            </Content>
          </IdeaContainer>
        </Container>
      );
    }

    return null;
  }
}

export default IdeasShow;
