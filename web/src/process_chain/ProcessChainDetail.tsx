/* eslint-disable no-param-reassign */
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Skeleton,
} from 'antd';
import { useIntl } from 'react-intl';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLayoutEffect, useState } from 'react';

import { FormListProps } from 'antd/es/form/FormList';
import { jsonFetcher, useAppSwr } from '../common/fetcher.tsx';
import DetailLayout from '../common/DetailLayout.tsx';
import {
  processChainApiBase,
  ProcessChainCreateOrUpdateRequest,
  ProcessChainResponse,
} from './types.ts';
import { Process, processesApiBase } from '../process/types.ts';
import safeParse from '../common/safeParse.ts';

export default function ProcessChainDetail() {
  const intl = useIntl();
  const { processChainId } = useParams();
  const [params] = useSearchParams();
  const initFormData = decodeURIComponent(params.get('data') ?? '');
  const [form] = Form.useForm<ProcessChainCreateOrUpdateRequest>();
  const { data, isLoading } = useAppSwr<ProcessChainResponse>(
    processChainId ? `${processChainApiBase}/${processChainId}` : undefined,
  );

  const navigate = useNavigate();
  const [selectedProcessId, setSelectedProcessId] = useState<Set<number>>(
    new Set(),
  );
  const { data: processes } = useAppSwr<Process[]>(processesApiBase);
  useLayoutEffect(() => {
    if (isLoading) {
      return;
    }
    if (data) {
      form.setFieldsValue(data);
    } else if (initFormData) {
      form.setFieldsValue(safeParse(initFormData));
    }
  }, [data, form, initFormData, isLoading]);

  const handleChildrenProcess: FormListProps['children'] = (
    fields,
    { add, remove },
    { errors },
  ) => (
    <div className="flex flex-col gap-3">
      {fields.map((field) => (
        <Card key={field.key}>
          <Form.Item
            name={[field.name, 'processId']}
            label={'服务'}
            required
            rules={[{ required: true, message: '请选择服务' }]}
          >
            <Select
              onChange={(processId, ...rest) => {
                console.log(rest);
                setSelectedProcessId((prev) => new Set([...prev, processId]));
              }}
            >
              {processes?.map((process) => (
                <Select.Option
                  key={process.id}
                  value={process.id}
                  disabled={selectedProcessId.has(process.id)}
                >
                  {process.description}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name={[field.name, 'delayInMilliseconds']}
            label="等待毫秒启动"
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            name={[field.name, 'waitForPreviousCompletion']}
            label="等待父亲服务结束后启动"
            valuePropName="checked"
          >
            <Checkbox />
          </Form.Item>
          <Form.Item required label="子服务配置">
            <Form.List name={[field.name, 'childProcessChainConfigs']}>
              {handleChildrenProcess}
            </Form.List>
          </Form.Item>
          <Button
            onClick={() => {
              remove(field.name);
            }}
          >
            删除日志状态配置
          </Button>
        </Card>
      ))}
      <Button onClick={() => add()} block>
        添加子服务
      </Button>
      <Form.ErrorList errors={errors} />
    </div>
  );

  return (
    <DetailLayout
      onCopy={async () => {
        const values = await form.validateFields();
        const newValues = { ...values };
        delete newValues.id;
        delete newValues.version;

        const copyAndDelIdAndVersion = (
          processChainConfigs: typeof values.processChainConfigs,
        ) =>
          processChainConfigs?.map((config) => {
            config = { ...config };
            delete config.id;
            delete config.version;
            config.childProcessChainConfigs = copyAndDelIdAndVersion(
              config.childProcessChainConfigs,
            );
            return config;
          });
        newValues.processChainConfigs = copyAndDelIdAndVersion(
          newValues.processChainConfigs,
        );
        navigate(
          `../new?data=${encodeURIComponent(JSON.stringify(newValues))}`,
        );
      }}
      onSubmit={async () => {
        const values = await form.validateFields();

        jsonFetcher(processChainApiBase, processChainId ? 'PUT' : 'POST', {
          ...values,
          id: processChainId,
          ...(data?.version !== undefined && { version: data?.version }),
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
      title={processChainId ? `编辑服务链 - ${data?.name ?? ''}` : '新建服务链'}
    >
      <Skeleton loading={isLoading}>
        <Form layout="horizontal" form={form}>
          <Form.Item
            name="name"
            label="服务链名称"
            rules={[{ required: true, message: '请输入服务链名称' }]}
            required
          >
            <Input />
          </Form.Item>
          <Form.Item label="服务配置" required>
            <Form.List
              name="processChainConfigs"
              rules={[
                {
                  validator: async (_, configurations) => {
                    if (!configurations || configurations.length < 1) {
                      return Promise.reject(new Error('至少添加一个日志状态'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              {handleChildrenProcess}
            </Form.List>
          </Form.Item>
        </Form>
      </Skeleton>
    </DetailLayout>
  );
}
