import { defineMessages } from 'react-intl';

export default defineMessages({
  nlpFlaggedWarningText: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.nlpFlaggedWarningText',
    defaultMessage: 'Inappropriate content auto-detected',
  },
  userFlaggedWarningText: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.userFlaggedWarningText',
    defaultMessage: 'Reported: {reason}',
  },
  removeWarning: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.removeWarning',
    defaultMessage:
      'Remove {numberOfItems, plural, one {warning} other {# warnings}}',
  },
  warnings: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.warnings',
    defaultMessage: 'Warnings',
  },
  noWarningItems: {
    id:
      'app.modules.commercial.flag_inappropriate_content.admin.components.noWarningItems',
    defaultMessage: 'There are no items with content warning',
  },
});
