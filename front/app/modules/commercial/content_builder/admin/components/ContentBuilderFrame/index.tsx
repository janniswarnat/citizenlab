import React, { useEffect } from 'react';
import { Frame, Element, useEditor } from '@craftjs/core';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useLocale from 'hooks/useLocale';
import useContentBuilderLayout from '../../../hooks/useContentBuilder';
import { PROJECT_DESCRIPTION_CODE } from '../../../services/contentBuilder';

const ContentBuilderFrame = ({ projectId }: { projectId: string }) => {
  const { actions } = useEditor();
  const data = useContentBuilderLayout({
    projectId,
    code: PROJECT_DESCRIPTION_CODE,
  });
  const locale = useLocale();

  useEffect(() => {
    const editorData =
      !isNilOrError(data) && !isNilOrError(locale)
        ? data.data.attributes.craftjs_jsonmultiloc[locale]
        : undefined;
    if (editorData) {
      actions.deserialize(editorData);
    }
  }, [actions, data, locale]);

  return (
    <Frame>
      <Element
        is="div"
        canvas
        style={{
          padding: '4px',
          minHeight: '160px',
          backgroundColor: '#fff',
        }}
      />
    </Frame>
  );
};

export default ContentBuilderFrame;
