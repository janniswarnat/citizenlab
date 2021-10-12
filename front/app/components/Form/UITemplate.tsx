import { Box } from 'cl2-component-library';
import { FormLabelValue } from 'components/UI/FormComponents';
import { uniq } from 'lodash-es';
import React from 'react';
import {
  FieldTemplateProps,
  ObjectFieldTemplateProps,
} from 'react-jsonschema-form';
import Error from 'components/UI/Error';
import { IdeaformSection } from 'components/IdeaForm';

export const FieldTemplate = (props: FieldTemplateProps) => {
  const { id, label, description, rawErrors, children, required } = props;
  const errors: any = uniq(rawErrors);

  if (props.hidden !== true) {
    const descriptionJSX = description?.props?.description?.length > 0 && (
      <div
        dangerouslySetInnerHTML={{ __html: description.props.description }}
      />
    );
    return (
      <Box marginBottom="30px">
        {props.schema.type !== 'boolean' &&
          props.schema.type !== 'object' &&
          renderLabel(id, label, required, descriptionJSX)}

        {children}

        {errors &&
          errors.length > 0 &&
          errors.map((value, index) => {
            return <Error key={index} marginTop="10px" text={value} />;
          })}
      </Box>
    );
  }

  return null;
};

export const ObjectFieldTemplate = (props: ObjectFieldTemplateProps) => {
  const Container =
    props?.uiSchema?.Template === 'SectionForm' ? IdeaformSection : Box;

  return (
    <>
      {props.title && <h1>{props.title}</h1>}
      {props.properties.map((element, index) => (
        <Container key={index}>{element.content}</Container>
      ))}
    </>
  );
};

function renderLabel(id, label, required, descriptionJSX) {
  if (label && label.length > 0) {
    return (
      <FormLabelValue
        htmlFor={id}
        labelValue={label}
        optional={!required}
        subtextValue={descriptionJSX}
      />
    );
  }
  return;
}
