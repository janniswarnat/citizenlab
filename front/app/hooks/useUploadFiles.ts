import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { projectFilesStream } from 'services/projectFiles';
import { phaseFilesStream } from 'services/phaseFiles';
import { pageFilesStream } from 'services/pageFiles';
import { eventFilesStream } from 'services/eventFiles';
import { ideaFilesStream } from 'services/ideaFiles';
import { initiativeFilesStream } from 'services/initiativeFiles';
import { convertUrlToUploadFileObservable } from 'utils/fileTools';
import { UploadFile } from 'typings';
import { InputProps } from 'resources/GetResourceFileObjects';

function useUploadFiles({
  resourceId,
  resourceType,
  resetOnChange = true,
}: InputProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[] | null>(null);

  useEffect(() => {
    if (resetOnChange) {
      setUploadFiles(null);
    }
    const streamFn = {
      project: projectFilesStream,
      phase: phaseFilesStream,
      event: eventFilesStream,
      page: pageFilesStream,
      idea: ideaFilesStream,
      initiative: initiativeFilesStream,
    }[resourceType];
    const observable = streamFn(resourceId).observable.pipe(
      switchMap((files) => {
        const filesData = files?.data;
        if (filesData && filesData.length > 0) {
          return combineLatest(
            filesData.map((file) =>
              convertUrlToUploadFileObservable(
                file.attributes.file.url,
                file.id,
                file.attributes.name
              )
            )
          );
        }

        return of(null);
      })
    );

    const subscription = observable.subscribe((files) => {
      setUploadFiles(
        files
          ? (files.filter((file) => !isNilOrError(file)) as UploadFile[])
          : null
      );
    });

    return () => subscription.unsubscribe();
  }, [resourceType, resourceId, resetOnChange]);

  return uploadFiles;
}

export default useUploadFiles;
