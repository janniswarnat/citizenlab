import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/topics`;

export interface ITopicData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: {
      [key: string]: string;
    };
    description_multiloc: {
      [key: string]: string;
    };
    icon: string;
  };
}

export interface ITopic {
  data: ITopicData;
}

export interface ITopics {
  data: ITopicData[];
}

export function observeTopics(streamParams: IStreamParams<ITopics> | null = null) {
  return streams.create<ITopics>({ apiEndpoint, ...streamParams });
}
