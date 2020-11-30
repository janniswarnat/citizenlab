import React from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import isFieldEnabled from '../isFieldEnabled';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styles
import { colors, fontSizes } from 'utils/styleUtils';

// components
import Status from './Status';
import Location from './Location';
import Attachments from './Attachments';
import Topics from 'components/PostShowComponents/Topics';
import SimilarIdeas from './SimilarIdeas';
import PostedBy from './PostedBy';

// hooks
import useIdea from 'hooks/useIdea';
import useLocale from 'hooks/useLocale';
import useIdeaCustomFieldsSchemas from 'hooks/useIdeaCustomFieldsSchemas';
import useIdeaStatus from 'hooks/useIdeaStatus';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Item = styled.div<{ isFirstItem?: boolean }>`
  border-top: ${({ isFirstItem }) =>
    isFirstItem ? `1px solid #e0e0e0` : 'none'};
  border-bottom: 1px solid #e0e0e0;
  padding-top: 20px;
  padding-bottom: 23px;
`;

const StyledPostedBy = styled(PostedBy)`
  margin-top: -4px;
`;

export const Header = styled.h3`
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  color: ${(props) => props.theme.colorText};
  padding: 0;
  margin: 0;
  margin-bottom: 12px;
`;

export const NoContent = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: normal;
`;

interface InputProps {
  className?: string;
  ideaId: string;
  authorId: string | null;
  projectId: string;
  statusId: string;
}

interface DataProps {
  similarIdeasEnabled: GetFeatureFlagChildProps;
}

interface Props extends InputProps, DataProps {}

const MetaInformation = ({
  className,
  ideaId,
  projectId,
  statusId,
  authorId,
  similarIdeasEnabled,
}: Props) => {
  const idea = useIdea({ ideaId });
  const locale = useLocale();
  const ideaCustomFieldsSchemas = useIdeaCustomFieldsSchemas({ projectId });
  const ideaStatus = useIdeaStatus({ statusId });

  if (
    !isNilOrError(idea) &&
    !isNilOrError(locale) &&
    !isNilOrError(ideaCustomFieldsSchemas)
  ) {
    const topicIds =
      idea.relationships.topics?.data.map((item) => item.id) || [];
    const address = idea.attributes.location_description || null;
    const geoPosition = idea.attributes.location_point_geojson || null;

    const topicsEnabled = isFieldEnabled(
      'topic_ids',
      ideaCustomFieldsSchemas,
      locale
    );
    const locationEnabled = isFieldEnabled(
      'location',
      ideaCustomFieldsSchemas,
      locale
    );
    const attachmentsEnabled = isFieldEnabled(
      'attachments',
      ideaCustomFieldsSchemas,
      locale
    );

    return (
      <Container className={className}>
        <Item isFirstItem>
          <Header>
            <FormattedMessage {...messages.postedBy} />
          </Header>
          <StyledPostedBy authorId={authorId} ideaId={ideaId} />
        </Item>
        {!isNilOrError(ideaStatus) && (
          <Item>
            <Header>
              <FormattedMessage {...messages.currentStatus} />
            </Header>
            <Status ideaStatus={ideaStatus} />
          </Item>
        )}
        {topicsEnabled && topicIds.length > 0 && (
          <Item>
            <Header>
              <FormattedMessage {...messages.topics} />
            </Header>
            <Topics postType="idea" topicIds={topicIds} />
          </Item>
        )}
        {locationEnabled && address && geoPosition && (
          <Item>
            <Header>
              <FormattedMessage {...messages.location} />
            </Header>
            <Location
              position={geoPosition}
              address={address}
              projectId={projectId}
            />
          </Item>
        )}
        {attachmentsEnabled && (
          <Item>
            <Attachments ideaId={ideaId} />
          </Item>
        )}
        {similarIdeasEnabled && (
          <Item>
            <Header>
              <FormattedMessage {...messages.similarIdeas} />
            </Header>
            <SimilarIdeas ideaId={ideaId} />
          </Item>
        )}
      </Container>
    );
  }

  return null;
};

const Data = adopt({
  similarIdeasEnabled: <GetFeatureFlag name="similar_ideas" />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {({ similarIdeasEnabled }) => (
      <MetaInformation
        {...inputProps}
        similarIdeasEnabled={similarIdeasEnabled}
      />
    )}
  </Data>
);
