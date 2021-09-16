import React from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'react-router';

import GetPage, { GetPageChildProps } from 'resources/GetPage';
import PageForm, { validatePageForm, FormValues } from 'components/PageForm';
import { Formik, FormikProps } from 'formik';
import PageWrapper from 'components/admin/PageWrapper';
import { fontSizes } from 'utils/styleUtils';
import GoBackButton from 'components/UI/GoBackButton';
import T from 'components/T';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { isCLErrorJSON } from 'utils/errorUtils';
import GetResourceFileObjects, {
  GetResourceFileObjectsChildProps,
} from 'resources/GetResourceFileObjects';
import { CLErrorsJSON } from 'typings';

// services
import { updatePage, IPageData } from 'services/pages';
import {
  getPageFilesToRemovePromises,
  getPageFilesToAddPromises,
} from 'services/pageFiles';

const Title = styled.h1`
  font-size: ${fontSizes.xxxl}px;
  padding: 0;
  width: 100%;
  margin: 1rem 0 3rem 0;
`;

interface InputProps {}

interface DataProps {
  page: GetPageChildProps;
  remotePageFiles: GetResourceFileObjectsChildProps;
}

interface Props extends InputProps, DataProps {}

const EditPageForm = ({ page, remotePageFiles }: Props & WithRouterProps) => {
  const getInitialValues = (
    page: IPageData,
    remotePageFiles: GetResourceFileObjectsChildProps
  ): FormValues => {
    return {
      title_multiloc: page.attributes.title_multiloc,
      body_multiloc: page.attributes.body_multiloc,
      slug: page.attributes.slug,
      local_page_files: remotePageFiles,
    };
  };

  // Still need to handle file saving if we'll use this form.
  // Also change typing of values parameter to something different (probably FormValues) than 'any'
  const handleSubmit = (
    page: IPageData,
    remotePageFiles: GetResourceFileObjectsChildProps
  ) => async (values: FormValues, { setErrors, setSubmitting, setStatus }) => {
    const localPageFiles = values.local_page_files;
    const pageId = page.id;

    try {
      await updatePage(pageId, {
        ...getInitialValues(page, remotePageFiles),
        ...values,
      });

      if (!isNilOrError(localPageFiles)) {
        const filesToAddPromises = getPageFilesToAddPromises(
          pageId,
          localPageFiles,
          remotePageFiles
        );
        const filesToRemovePromises = getPageFilesToRemovePromises(
          pageId,
          localPageFiles,
          remotePageFiles
        );

        if (filesToAddPromises) {
          await Promise.all(filesToAddPromises);
        }
        if (filesToRemovePromises) {
          await Promise.all(filesToRemovePromises);
        }
      }

      setStatus('success');
      setSubmitting(false);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.log(error);

      if (isCLErrorJSON(error)) {
        const apiErrors = (error as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
      } else {
        setStatus('error');
      }
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    clHistory.push('/admin/pages');
  };

  const renderFn = (pageId: string) => (props: FormikProps<FormValues>) => {
    return <PageForm {...props} mode="edit" pageId={pageId} />;
  };

  if (!isNilOrError(page)) {
    const initialValues = getInitialValues(page, remotePageFiles);
    const pageId = page.id;

    return (
      <div>
        <GoBackButton onClick={handleGoBack} />
        <Title>
          <T value={page.attributes.title_multiloc} />
        </Title>
        <PageWrapper>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit(page, remotePageFiles)}
            render={renderFn(pageId)}
            validate={validatePageForm}
          />
        </PageWrapper>
      </div>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  page: ({ params: { pageId }, render }) => (
    <GetPage id={pageId}>{render}</GetPage>
  ),
  remotePageFiles: ({ page, render }) => (
    <GetResourceFileObjects
      resourceId={!isNilOrError(page) ? page.id : null}
      resourceType="page"
    >
      {render}
    </GetResourceFileObjects>
  ),
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps: DataProps) => <EditPageForm {...inputProps} {...dataProps} />}
  </Data>
));
