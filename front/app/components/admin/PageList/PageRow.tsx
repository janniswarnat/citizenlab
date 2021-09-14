import React from 'react';
import styled from 'styled-components';

// components
import { Icon } from 'cl2-component-library';
import { Row, TextCell } from 'components/admin/ResourceList';
import Button from 'components/UI/Button';
import T from 'components/T';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// typings
import { IPageData } from 'services/pages';

const LockIcon = styled(Icon)`
  height: 18px;
  margin-right: 16px;
`;

export interface IPagePermissions {
  locked?: boolean;
  editable?: boolean;
}

interface Props {
  pageData: IPageData;
  pagePermissions: IPagePermissions;
}

export default injectIntl(({
  pageData,
  pagePermissions,
  // intl: { formatMessage }
}: Props & InjectedIntlProps) => {
  return (
    <Row id={pageData.id}>
      <TextCell className="expand">
        {pagePermissions.locked && (
          <LockIcon name="lock" />
        )}
        <T value={pageData.attributes.title_multiloc} />
      </TextCell>

      {pagePermissions.editable && (
        <Button
          linkTo={`/admin/pages/${pageData.id}`}
          buttonStyle="secondary"
          icon="edit"
        >
          <FormattedMessage {...messages.editButtonLabel} />
        </Button>
      )}
    </Row>
  );
}
);