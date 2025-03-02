import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';

// components
import FileAttachments from 'components/UI/FileAttachments';
import PhaseTitle from './PhaseTitle';

// hooks
import useLocalize from 'hooks/useLocalize';
import usePhase from 'hooks/usePhase';
import useResourceFiles from 'hooks/useResourceFiles';

// style
import styled, { useTheme } from 'styled-components';
import { defaultCardStyle, media } from 'utils/styleUtils';
import T from 'components/T';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div`
  padding: 30px;
  padding-bottom: 35px;
  ${defaultCardStyle};

  ${media.smallerThanMinTablet`
    padding: 20px;
  `}
`;

const StyledFileAttachments = styled(FileAttachments)`
  margin-top: 20px;
  max-width: 520px;
`;

interface Props {
  phaseId: string | null;
  phaseNumber: number;
  className?: string;
  hidden: boolean;
}

const PhaseDescription = ({
  phaseId,
  phaseNumber,
  className,
  hidden,
}: Props) => {
  const theme: any = useTheme();
  const localize = useLocalize();
  const phase = usePhase(phaseId);
  const phaseFiles = useResourceFiles({
    resourceId: phaseId,
    resourceType: 'phase',
  });

  const content = !isNilOrError(phase)
    ? localize(phase.attributes.description_multiloc)
    : '';
  const contentIsEmpty =
    content === '' || content === '<p></p>' || content === '<p><br></p>';
  const descriptionHasContent = !contentIsEmpty || !isEmpty(phaseFiles);

  return (
    <Container
      className={`e2e-phase-description ${className || ''}`}
      role="tabpanel"
      tabIndex={0}
      id={`phase-description-panel-${phaseNumber}`}
      aria-labelledby={`phase-tab-${phaseNumber}`}
      hidden={hidden}
    >
      <PhaseTitle
        phaseNumber={phaseNumber}
        phaseId={phaseId}
        descriptionHasContent={descriptionHasContent}
      />
      {!isNilOrError(phase) && descriptionHasContent && (
        <>
          <QuillEditedContent fontSize="base" textColor={theme.colorText}>
            <T
              value={phase?.attributes?.description_multiloc}
              supportHtml={true}
            />
          </QuillEditedContent>

          {!isNilOrError(phaseFiles) && !isEmpty(phaseFiles) && (
            <StyledFileAttachments files={phaseFiles} />
          )}
        </>
      )}
    </Container>
  );
};

export default PhaseDescription;
