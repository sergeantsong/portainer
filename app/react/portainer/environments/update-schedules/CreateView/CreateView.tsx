import { Settings } from 'lucide-react';
import { Formik, Form as FormikForm } from 'formik';
import { useRouter } from '@uirouter/react';

import { notifySuccess } from '@/portainer/services/notifications';
import { withLimitToBE } from '@/react/hooks/useLimitToBE';
import { isoDate } from '@/portainer/filters/filters';

import { PageHeader } from '@@/PageHeader';
import { Widget } from '@@/Widget';
import { LoadingButton } from '@@/buttons';
import { TextTip } from '@@/Tip/TextTip';

import { ScheduleType } from '../types';
import { useCreateMutation } from '../queries/create';
import { FormValues } from '../common/types';
import { validation } from '../common/validation';
import { ScheduleTypeSelector } from '../common/ScheduleTypeSelector';
import { useList } from '../queries/list';
import { NameField } from '../common/NameField';
import { EdgeGroupsField } from '../common/EdgeGroupsField';
import { BetaAlert } from '../common/BetaAlert';

export default withLimitToBE(CreateView);

function CreateView() {
  const initialValues: FormValues = {
    name: '',
    groupIds: [],
    type: ScheduleType.Update,
    version: '',
    scheduledTime: isoDate(Date.now() + 24 * 60 * 60 * 1000),
  };

  const schedulesQuery = useList();

  const createMutation = useCreateMutation();
  const router = useRouter();

  if (!schedulesQuery.data) {
    return null;
  }

  const schedules = schedulesQuery.data;

  return (
    <>
      <PageHeader
        title="Update & Rollback"
        breadcrumbs="Edge agent update and rollback"
      />

      <BetaAlert />

      <div className="row">
        <div className="col-sm-12">
          <Widget>
            <Widget.Title title="Update & Rollback Scheduler" icon={Settings} />
            <Widget.Body>
              <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validateOnMount
                validationSchema={() => validation(schedules)}
              >
                {({ isValid, setFieldValue, values, handleBlur, errors }) => (
                  <FormikForm className="form-horizontal">
                    <NameField />
                    <EdgeGroupsField
                      onChange={(value) => setFieldValue('groupIds', value)}
                      value={values.groupIds}
                      onBlur={handleBlur}
                      error={errors.groupIds}
                    />

                    <TextTip color="blue">
                      You can upgrade from any agent version to 2.17 or later
                      only. You can not upgrade to an agent version prior to
                      2.17 . The ability to rollback to originating version is
                      for 2.15.0+ only.
                    </TextTip>

                    <ScheduleTypeSelector />

                    <div className="form-group">
                      <div className="col-sm-12">
                        <LoadingButton
                          disabled={!isValid}
                          isLoading={createMutation.isLoading}
                          loadingText="Creating..."
                        >
                          Create Schedule
                        </LoadingButton>
                      </div>
                    </div>
                  </FormikForm>
                )}
              </Formik>
            </Widget.Body>
          </Widget>
        </div>
      </div>
    </>
  );

  function handleSubmit(values: FormValues) {
    createMutation.mutate(values, {
      onSuccess() {
        notifySuccess('Success', 'Created schedule successfully');
        router.stateService.go('^');
      },
    });
  }
}
