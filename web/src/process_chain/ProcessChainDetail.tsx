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
import { FormattedMessage, useIntl } from 'react-intl';
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
import { i18n } from '../i18n/index.tsx';

export default function ProcessChainDetail() {
  const intl = useIntl();
  const { processChainId } = useParams();
  const [params] = useSearchParams();
  const initFormData = decodeURIComponent(params.get('data') ?? '');
  const [form] = Form.useForm<ProcessChainCreateOrUpdateRequest>();
  const { data, isLoading } = useAppSwr<ProcessChainResponse>(
    processChainId ? `${processChainApiBase}/${processChainId}` : undefined
  );

  const navigate = useNavigate();
  const [selectedProcessId, setSelectedProcessId] = useState<Set<number>>(
    new Set()
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
    { errors }
  ) => (
    <div className="flex flex-col gap-3">
      {fields.map((field) => (
        <Card key={field.key}>
          <Form.Item
            name={[field.name, 'processId']}
            label={i18n.intl.formatMessage({
              id: 'Service',
              defaultMessage: '服务',
            })}
            required
            rules={[
              {
                required: true,
                message: i18n.intl.formatMessage({
                  id: 'key0026',
                  defaultMessage: '请选择服务',
                }),
              },
            ]}
          >
            <Select
              onChange={(processId) => {
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
            label={i18n.intl.formatMessage({
              id: 'key0027',
              defaultMessage: '等待毫秒启动',
            })}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            name={[field.name, 'waitForPreviousCompletion']}
            label={i18n.intl.formatMessage({
              id: 'key0028',
              defaultMessage: '等待父亲服务结束后启动',
            })}
            valuePropName="checked"
          >
            <Checkbox />
          </Form.Item>
          <Form.Item
            label={i18n.intl.formatMessage({
              id: 'key0029',
              defaultMessage: '子服务配置',
            })}
          >
            <Form.List name={[field.name, 'childProcessChainConfigs']}>
              {handleChildrenProcess}
            </Form.List>
          </Form.Item>
          <Button
            onClick={() => {
              remove(field.name);
            }}
          >
            <FormattedMessage id="key0030" defaultMessage="删除子服务" />
          </Button>
        </Card>
      ))}
      <Button onClick={() => add()} block>
        <FormattedMessage id="key0031" defaultMessage="添加子服务" />
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
          processChainConfigs: typeof values.processChainConfigs
        ) =>
          processChainConfigs?.map((config) => {
            config = { ...config };
            delete config.id;
            delete config.version;
            config.childProcessChainConfigs = copyAndDelIdAndVersion(
              config.childProcessChainConfigs
            );
            return config;
          });
        newValues.processChainConfigs = copyAndDelIdAndVersion(
          newValues.processChainConfigs
        );
        navigate(
          `../new?data=${encodeURIComponent(JSON.stringify(newValues))}`
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
            })
          );
          navigate('..');
        });
      }}
      onCancel={() => {
        navigate('../');
      }}
      title={
        processChainId
          ? intl.formatMessage(
              {
                id: 'key0032',
                defaultMessage: '编辑服务链 - {v1}',
              },
              { v1: data?.name ?? '' }
            )
          : intl.formatMessage({
              id: 'key0033',
              defaultMessage: '新建服务链',
            })
      }
    >
      <Skeleton loading={isLoading}>
        <Form layout="horizontal" form={form}>
          <Form.Item
            name="name"
            label={intl.formatMessage({
              id: 'key0034',
              defaultMessage: '服务链名称',
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'key0035',
                  defaultMessage: '请输入服务链名称',
                }),
              },
            ]}
            required
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: 'key0036',
              defaultMessage: '服务配置',
            })}
            required
          >
            <Form.List
              name="processChainConfigs"
              rules={[
                {
                  validator: async (_, configurations) => {
                    if (!configurations || configurations.length < 1) {
                      return Promise.reject(
                        new Error(
                          intl.formatMessage({
                            id: 'key0011',
                            defaultMessage: '至少添加一个日志状态',
                          })
                        )
                      );
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
