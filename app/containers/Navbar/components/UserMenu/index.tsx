import React from 'react';
import { Subscription } from 'rxjs';

// components
import Button from 'components/UI/Button';
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';
import Popover from 'components/Popover';
import HasPermission from 'components/HasPermission';

// services
import { authUserStream, signOut } from 'services/auth';
import { IUser } from 'services/users';

// style
import styled from 'styled-components';
import { darken } from 'polished';
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

const Container = styled.div`
  display: flex;
  margin-left: 0px;
  position: relative;
  cursor: pointer;
  outline: none;

  * {
    user-select: none;
  }
`;

const OpenMenuButton = styled.button`
  background: none;
  padding: 0;
  transition: all .2s;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: ${colors.label};
  max-width: 150px;

  &:hover,
  &:focus {
    color: ${darken(0.2, colors.label)};
    svg, img {
      border-color: ${darken(0.2, colors.label)};
    }
    svg {
      fill: ${darken(0.2, colors.label)};
    }
  }
  span {
    margin-top: 2px;
    margin-right: 5px;
    text-align: right;
  }
`;

const StyledAvatar = styled(Avatar) `
  height: 27px;
  width: 27px;
  svg, img {
    height: 27px;
    width: 27px;
    border: 0;
    border: 1px solid transparent;
    border-radius: 50%;
  }
  svg {
    fill: ${colors.label};
  }
`;

const StyledPopover = styled(Popover) `
  display: flex;
  flex-direction: column;
  z-index: 5;
`;

const PopoverItem = styled(Button) `
  background: #fff;
  border-radius: 5px;
  transition: all 80ms ease-out;

  &:hover,
  &:focus {
    background: #f6f6f6;
  }
`;

type Props = {};

type State = {
  authUser: IUser | null;
  opened: boolean;
};

export default class UserMenu extends React.PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      authUser: null,
      opened: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const authUser$ = authUserStream().observable;

    this.subscriptions = [
      authUser$.subscribe(authUser => this.setState({ authUser }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  togglePopover = (event: React.FormEvent) => {
    event.preventDefault();
    this.setState(({ opened }) => ({ opened: !opened }));
  }

  closePopover = () => {
    this.setState({ opened: false });
  }

  signOut = () => {
    signOut();
  }

  render() {
    const { authUser, opened } = this.state;
    const userId = (authUser ? authUser.data.id : null);
    const userSlug = (authUser ? authUser.data.attributes.slug : null);

    if (authUser && userId) {
      return (
        <Container id="e2e-user-menu-container">
          <OpenMenuButton onClick={this.togglePopover}>
            {
              <>
                <UserName user={authUser.data} />
                <StyledAvatar userId={userId} size="small" />
              </>
            }
          </OpenMenuButton>
          <StyledPopover
            id="e2e-user-menu-dropdown"
            open={opened}
            onCloseRequest={this.closePopover}
          >
            <HasPermission item={{ type: 'route', path: '/admin' }} action="access">
              <PopoverItem
                id="admin-link"
                linkTo={'/admin'}
                onClick={this.closePopover}
                style="text"
                icon="admin"
                iconPos="right"
                iconSize="20px"
                padding="11px 11px"
                size="2"
                justify="space-between"
              >
                <FormattedMessage {...messages.admin} />
              </PopoverItem>

              <HasPermission.No>
                {/* Display the project moderation page for moderators, they don't have access to the dashboard */}
                <HasPermission item={{ type: 'route', path: '/admin/projects' }} action="access">
                  <PopoverItem
                    id="e2e-projects-admin-link"
                    linkTo={'/admin/projects'}
                    onClick={this.closePopover}
                    style="text"
                    icon="admin"
                    iconPos="right"
                    iconSize="20px"
                    padding="11px 11px"
                    size="2"
                    justify="space-between"
                  >
                    <FormattedMessage {...messages.projectsModeration} />
                  </PopoverItem>
                </HasPermission>
              </HasPermission.No>
            </HasPermission>

            <PopoverItem
              id="e2e-profile-profile-link"
              linkTo={`/profile/${userSlug}`}
              onClick={this.closePopover}
              style="text"
              icon="user"
              iconPos="right"
              iconSize="20px"
              padding="11px 11px"
              size="2"
              justify="space-between"
            >
              <FormattedMessage {...messages.profilePage} />
            </PopoverItem>

            <PopoverItem
              id="e2e-profile-edit-link"
              linkTo={'/profile/edit'}
              onClick={this.closePopover}
              style="text"
              icon="settings"
              iconPos="right"
              iconSize="20px"
              padding="11px 11px"
              size="2"
              justify="space-between"
            >
              <FormattedMessage {...messages.editProfile} />
            </PopoverItem>

            <PopoverItem
              id="e2e-sign-out-link"
              onClick={this.signOut}
              style="text"
              icon="power"
              iconPos="right"
              iconSize="20px"
              padding="11px 11px"
              size="2"
              justify="space-between"
            >
              <FormattedMessage {...messages.signOut} />
            </PopoverItem>
          </StyledPopover>
        </Container>
      );
    }

    return null;
  }
}
