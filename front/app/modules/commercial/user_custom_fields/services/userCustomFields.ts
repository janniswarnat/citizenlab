import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Locale, Multiloc } from 'typings';
import { JsonSchema7, Layout } from '@jsonforms/core';

export const userCustomFieldsSchemaApiEndpoint = `${API_PATH}/users/custom_fields/schema`;
export const userCustomFieldsJSONSchemaApiEndpoint = `${API_PATH}/users/custom_fields/json_forms_schema`;

export type IUserCustomFieldInputType =
  | 'text'
  | 'number'
  | 'multiline_text'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'date';

export type TCustomFieldCode =
  | 'gender'
  | 'birthyear'
  | 'domicile'
  | 'education'
  | 'title'
  | 'body'
  | 'topic_ids'
  | 'location'
  | 'proposed_budget'
  | 'images'
  | 'attachments';

export interface IUserCustomFieldData {
  id: string;
  type: string;
  attributes: {
    key: string;
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    input_type: IUserCustomFieldInputType;
    required: boolean;
    code: TCustomFieldCode | null;
    enabled: boolean;
    ordering: number;
    hidden: boolean;
    created_at: string;
    updated_at: string;
  };
  relationships?: {
    custom_field_options: {
      data: IRelationship;
    };
  };
}

export interface IUserCustomField {
  data: IUserCustomFieldData;
}

export interface IUserCustomFields {
  data: IUserCustomFieldData[];
}

export interface UserCustomFieldsInfos {
  schema: any;
  uiSchema: any;
  hasRequiredFields: boolean;
  hasCustomFields: boolean;
}

export interface IUserJsonFormSchemas {
  json_schema_multiloc: {
    [key in Locale]?: JsonSchema7;
  };
  ui_schema_multiloc: { [key in Locale]?: Layout };
}

export function isBuiltInField(field: IUserCustomFieldData) {
  return !!field.attributes.code;
}

export function isHiddenField(field: IUserCustomFieldData) {
  return !!field.attributes.hidden;
}

export interface IUserCustomField {
  data: IUserCustomFieldData;
}

export interface IUserCustomFields {
  data: IUserCustomFieldData[];
}

export function userCustomFieldStream(
  customFieldId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUserCustomField>({
    apiEndpoint: `${API_PATH}/users/custom_fields/${customFieldId}`,
    ...streamParams,
  });
}

export function userCustomFieldsStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUserCustomFields>({
    apiEndpoint: `${API_PATH}/users/custom_fields`,
    ...streamParams,
  });
}

export function customFieldsSchemaForUsersStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<any>({
    apiEndpoint: userCustomFieldsSchemaApiEndpoint,
    ...streamParams,
  });
}

export function userJsonFormSchemasStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUserJsonFormSchemas>({
    apiEndpoint: userCustomFieldsJSONSchemaApiEndpoint,
    ...streamParams,
  });
}

export function addCustomFieldForUsers(data) {
  return streams.add<IUserCustomField>(`${API_PATH}/users/custom_fields`, {
    custom_field: data,
  });
}

export function updateCustomFieldForUsers(customFieldId: string, object) {
  return streams.update<IUserCustomField>(
    `${API_PATH}/users/custom_fields/${customFieldId}`,
    customFieldId,
    { custom_field: object }
  );
}

export function reorderCustomFieldForUsers(customFieldId: string, object) {
  return streams.update<IUserCustomField>(
    `${API_PATH}/users/custom_fields/${customFieldId}/reorder`,
    customFieldId,
    { custom_field: object }
  );
}

export function deleteUserCustomField(customFieldId: string) {
  return streams.delete(
    `${API_PATH}/users/custom_fields/${customFieldId}`,
    customFieldId
  );
}
