import React, { useState, useRef, useEffect } from 'react';
import { isEmpty } from 'lodash-es';
import { combineLatest } from 'rxjs';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from 'containers/Admin/dashboard/messages';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import T from 'components/T';

// styling
import { withTheme } from 'styled-components';

// components
import ReportExportMenu from 'components/admin/ReportExportMenu';
import {
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import { Tooltip, LabelList } from 'recharts';
import BarChart, { DEFAULT_MARGIN } from 'components/admin/Graphs/BarChart';
import { Box, colors } from '@citizenlab/cl2-component-library';

// typings
import { IUserCustomFieldData } from '../../../services/userCustomFields';
import { IStreamParams, IStream } from 'utils/streams';

// services
import {
  usersByRegFieldStream,
  usersByRegFieldXlsxEndpoint,
  usersByGenderStream,
  usersByGenderXlsxEndpoint,
  usersByBirthyearStream,
  usersByBirthyearXlsxEndpoint,
  usersByDomicileStream,
  usersByDomicileXlsxEndpoint,
} from 'modules/commercial/user_custom_fields/services/stats';

// utils
import { isNilOrError } from 'utils/helperUtils';
import createConvertAndMergeSeries, {
  ISupportedDataType,
  TOutput,
} from './convertAndMergeSeries';

interface ICustomFieldEndpoint {
  stream: (streamParams: IStreamParams | null) => IStream<ISupportedDataType>;
  xlsxEndpoint: string;
}

type TAllowedCode = 'gender' | 'birthyear' | 'domicile';

const customFieldEndpoints: Record<TAllowedCode, ICustomFieldEndpoint> = {
  gender: {
    stream: usersByGenderStream,
    xlsxEndpoint: usersByGenderXlsxEndpoint,
  },
  birthyear: {
    stream: usersByBirthyearStream,
    xlsxEndpoint: usersByBirthyearXlsxEndpoint,
  },
  domicile: {
    stream: usersByDomicileStream,
    xlsxEndpoint: usersByDomicileXlsxEndpoint,
  },
};

interface InputProps {
  startAt: string;
  endAt: string;
  customField: IUserCustomFieldData;
  currentProject: string | undefined;
  className?: string;
}

type Props = InputProps & InjectedIntlProps & InjectedLocalized;

interface TooltipProps {
  payload?: { name?: string; value?: string; payload?: { total: number } }[];
  label?: string;
  active?: boolean;
  totalLabel: string;
}

const CustomTooltip = ({
  payload,
  label,
  active,
  totalLabel,
}: TooltipProps) => {
  if (active && payload && payload[0]) {
    return (
      <Box bgColor="#fff" border="1px solid #cccccc" p="10px">
        <h4 style={{ fontWeight: 600 }}>{label}</h4>
        <div>{`${payload[0].name} : ${payload[0].value}`}</div>
        <Box
          color={colors.label}
        >{`${totalLabel} : ${payload[0]?.payload?.total}`}</Box>
      </Box>
    );
  }

  return null;
};

const createCombinedStream = (
  customField: IUserCustomFieldData,
  { startAt, endAt }: { startAt: string; endAt: string },
  currentProject?: string
) => {
  const { code } = customField.attributes;

  const stream =
    code && code in customFieldEndpoints
      ? customFieldEndpoints[code as TAllowedCode].stream
      : usersByRegFieldStream;

  const totalUsersStream = stream(null, customField.id);

  const participantsStream = stream(
    {
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        project: currentProject,
      },
    },
    customField.id
  );

  return combineLatest([
    totalUsersStream.observable,
    participantsStream.observable,
  ]);
};

const CustomFieldsGraph = ({
  startAt,
  endAt,
  customField,
  currentProject,
  localize,
  intl: { formatMessage },
  className,
  theme: { barSize },
}: Props & { theme: any }) => {
  const [serie, setSerie] = useState<TOutput | null>(null);
  const currentChartRef = useRef();
  const convertAndMergeSeriesRef = useRef(
    createConvertAndMergeSeries({
      localize,
      formatMessage,
    })
  );
  const convertAndMergeSeries = convertAndMergeSeriesRef.current;

  useEffect(() => {
    const combinedStream = createCombinedStream(
      customField,
      { startAt, endAt },
      currentProject
    );

    const subscription = combinedStream.subscribe(
      ([totalSerie, participantSerie]) => {
        if (!isNilOrError(totalSerie) && !isNilOrError(participantSerie)) {
          const { code } = customField.attributes;

          const convertedAndMergedSeries = convertAndMergeSeries(
            totalSerie,
            participantSerie,
            code
          );

          setSerie(convertedAndMergedSeries);
        }
      }
    );

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customField, currentProject, startAt, endAt]);

  const noData =
    !serie || serie.every((item) => isEmpty(item)) || serie.length <= 0;

  const { code } = customField.attributes;

  const xlsxEndpoint =
    code && code in customFieldEndpoints
      ? customFieldEndpoints[code as TAllowedCode].xlsxEndpoint
      : usersByRegFieldXlsxEndpoint(customField.id);

  return (
    <GraphCard className={`dynamicHeight ${className}`}>
      <GraphCardInner>
        <GraphCardHeader>
          <GraphCardTitle>
            <T value={customField.attributes.title_multiloc} />
          </GraphCardTitle>
          {!noData && (
            <ReportExportMenu
              name={formatMessage(messages.customFieldTitleExport, {
                fieldName: localize(customField.attributes.title_multiloc),
              })}
              svgNode={currentChartRef}
              xlsxEndpoint={xlsxEndpoint}
              currentProjectFilter={currentProject}
            />
          )}
        </GraphCardHeader>
        <BarChart
          height={serie && serie.length > 1 ? serie.length * 50 : 100}
          data={serie}
          layout="horizontal"
          innerRef={currentChartRef}
          margin={{
            ...DEFAULT_MARGIN,
            left: 20,
          }}
          bars={{ name: formatMessage(messages.participants), size: barSize }}
          mapping={{ length: 'participants' }}
          yaxis={{ width: 150, tickLine: false }}
          renderTooltip={() => (
            <>
              <Tooltip
                content={({ active, payload, label }: TooltipProps) => (
                  <CustomTooltip
                    label={label}
                    active={active}
                    payload={payload}
                    totalLabel={formatMessage(messages.totalUsers)}
                  />
                )}
              />
            </>
          )}
          renderLabels={(props) => <LabelList {...props} position="right" />}
        />
      </GraphCardInner>
    </GraphCard>
  );
};

export default injectLocalize<InputProps>(
  injectIntl<InputProps & InjectedLocalized>(
    withTheme(CustomFieldsGraph as any) as any
  )
);
