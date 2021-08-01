import { defineMessages } from 'react-intl';

export default defineMessages({
  verifyGentRrn: {
    id: 'app.modules.id_gent_rrn.verifyGentRrn',
    defaultMessage: 'Verify using social security number',
  },
  rrnLabel: {
    id: 'app.modules.id_gent_rrn.rrnLabel',
    defaultMessage: 'Social security number',
  },
  rrnTooltip: {
    id: 'app.modules.id_gent_rrn.rrnTooltip',
    defaultMessage:
      'We ask your social security number to verify whether you are a citizen of Ghent, older than 14 year old.',
  },
  showGentRrnHelp: {
    id: 'app.modules.id_gent_rrn.showGentRrnHelp',
    defaultMessage: 'Where can I find my social security number?',
  },
  gentRrnHelp: {
    id: 'app.modules.id_gent_rrn.gentRrnHelp',
    defaultMessage:
      'Your social security number is shown on the back of your digital identity card',
  },
  emptyFieldError: {
    id: 'app.modules.id_gent_rrn.emptyFieldError',
    defaultMessage: 'This field cannot be empty.',
  },
  invalidRrnError: {
    id: 'app.modules.id_gent_rrn.invalidRrnError',
    defaultMessage: 'Invalid social security number',
  },
  verifyYourIdentity: {
    id: 'app.modules.id_gent_rrn.verifyYourIdentity',
    defaultMessage: 'Verify your identity',
  },
  takenFormError: {
    id: 'app.modules.id_gent_rrn.takenFormError',
    defaultMessage: 'Already taken.',
  },
  noMatchFormError: {
    id: 'app.modules.id_gent_rrn.noMatchFormError',
    defaultMessage: 'No match was found.',
  },
  notEntitledFormError: {
    id: 'app.modules.id_gent_rrn.notEntitledFormError',
    defaultMessage:
      "We can't verify you because you either live outside of Ghent or are younger than 14 years.",
  },
  somethingWentWrongError: {
    id: 'app.modules.id_gent_rrn.somethingWentWrongError',
    defaultMessage: "We can't verify you because something went wrong",
  },
  submit: {
    id: 'app.modules.id_gent_rrn.submit',
    defaultMessage: 'Submit',
  },
  cancel: {
    id: 'app.modules.id_gent_rrn.cancel',
    defaultMessage: 'Cancel',
  },
});
