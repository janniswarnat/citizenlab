import React from 'react';
import { isEqual } from 'lodash-es';
import { Subscription, BehaviorSubject, of, combineLatest } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { ITopicData, topicByIdStream, topicsStream } from 'services/topics';
import { isNilOrError, NilOrError, reduceErrors } from 'utils/helperUtils';
import { Parameters as InputProps } from 'hooks/useTopics';

type children = (renderProps: GetTopicsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  topics: ITopicData[] | NilOrError;
}

export type GetTopicsChildProps = ITopicData[] | NilOrError;

export default class GetTopics extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      topics: undefined,
    };
  }

  setTopics(topics: ITopicData[] | NilOrError) {
    this.setState({ topics });
  }

  componentDidMount() {
    const { topicIds, code, exclude_code, sort, for_homepage_filter } =
      this.props;

    this.inputProps$ = new BehaviorSubject({
      topicIds,
      code,
      exclude_code,
      sort,
      for_homepage_filter,
    });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => isEqual(prev, next)),
          switchMap(({ topicIds, ...queryParameters }) => {
            if (topicIds) {
              if (topicIds.length > 0) {
                return combineLatest(
                  topicIds.map((id) => {
                    return topicByIdStream(id).observable.pipe(
                      map((topic) =>
                        !isNilOrError(topic) ? topic.data : topic
                      )
                    );
                  })
                );
              }

              return of(null);
            } else {
              return topicsStream({ queryParameters }).observable.pipe(
                map((topics) => topics.data)
              );
            }
          })
        )
        .subscribe(reduceErrors<ITopicData>(this.setTopics.bind(this))),
    ];
  }

  componentDidUpdate() {
    const { topicIds, code, exclude_code, sort, for_homepage_filter } =
      this.props;
    this.inputProps$.next({
      topicIds,
      code,
      exclude_code,
      sort,
      for_homepage_filter,
    });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { topics } = this.state;
    return (children as children)(topics);
  }
}
