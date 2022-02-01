import { useState, useEffect } from 'react';
import { attendancesStream, IAttendance } from 'services/events';
import { isNilOrError } from 'utils/helperUtils';

export type TAttendancesState = IAttendance[] | undefined | null | Error;

interface Props {
  eventId: string;
  pageNumber: number;
  pageSize: number;
}

export default function ({ eventId, pageNumber = 1, pageSize = 4 }: Props) {
  const [attendances, setAttendances] = useState<TAttendancesState>();

  useEffect(() => {
    const queryParameters = {
      'page[number]': pageNumber,
      'page[size]': pageSize,
    };

    attendancesStream(eventId, queryParameters).observable.subscribe(
      (attendances) => {
        isNilOrError(attendances)
          ? setAttendances(attendances)
          : setAttendances(attendances.data);
      }
    );
  }, [eventId, pageNumber, pageSize]);

  return attendances;
}
