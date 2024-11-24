import { Form, message, Skeleton } from 'antd';
import { useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';
import { useLayoutEffect } from 'react';

import { jsonFetcher, useAppSwr } from '../common/fetcher.tsx';
import DetailLayout from '../common/LogMonitorDetail.tsx';

export default function LogMonitorDetail() {
  const intl = useIntl();
  const { logMonitorId } = useParams();
  const [form] = Form.useForm<LogMonitorCreatedOrUpdated>();

  const { data, isLoading } = useAppSwr<LogMonitor>(
    logMonitorId ? `${logMonitorBaseUrl}/${logMonitorId}` : undefined,
  );

  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (isLoading) {
      return;
    }
    if (data) {
      form.setFieldsValue(data);
    }
  }, [data, form, isLoading]);

  return (
    <DetailLayout
      onSubmit={async () => {
        const values = await form.validateFields();

        jsonFetcher(logMonitorBaseUrl, logMonitorId ? 'PUT' : 'POST', {
          ...values,
          id: logMonitorId,
        }).then(() => {
          message.success(
            intl.formatMessage({
              id: 'OperationSuccessful',
              defaultMessage: '操作成功',
            }),
          );
          navigate('..');
        });
      }}
      onCancel={() => {
        navigate('../');
      }}
      title={
        logMonitorId ? `编辑日志监控 - ${data?.name ?? ''}` : '新建日志监控'
      }
    >
      <Skeleton>
        <Form layout="horizontal" form={form}></Form>
      </Skeleton>
    </DetailLayout>
  );
}
