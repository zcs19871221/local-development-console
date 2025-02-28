import { FormattedMessage, useIntl } from 'react-intl';
import {
  AutoComplete,
  Button,
  Form,
  Input,
  Modal,
  Tooltip,
  message,
} from 'antd';

import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  FileAddOutlined,
} from '@ant-design/icons';
import { useRef, useState } from 'react';

import Select, { DefaultOptionType } from 'antd/es/select/index';
import useSWR from 'swr';
import {
  base,
  bufferFetcher,
  jsonFetcher,
  useAppSwr,
} from '../common/fetcher.tsx';

import {
  Process,
  processesApiBase,
  ProcessesCreatedOrUpdated,
} from './types.ts';
import { i18n } from '../../i18n/index.tsx';
import useDebouncedValue from '../common/useDebouncedValue.tsx';
import safeParse from '../common/safeParse.ts';
import { LogMonitor, logMonitorBaseUrl } from '../log_monitor/types.ts';
import MainWrapper from '../common/MainWrapper.tsx';
import ProcessTable from './ProcessTable.tsx';

export default function ProcessesComponent() {
  const intl = useIntl();

  const {
    data,
    isLoading,
    mutate: refreshProcesses,
  } = useAppSwr<Process[]>(processesApiBase);

  const [showProcessesForm, setShowProcessesForm] = useState(false);

  const [processesForm] = Form.useForm<ProcessesCreatedOrUpdated>();

  const path = useDebouncedValue(Form.useWatch('path', processesForm));

  const { data: pkgJson } = useSWR(
    path
      ? `${base}/system/read?path=${encodeURIComponent(`${path}/package.json`)}`
      : undefined,
    bufferFetcher,
  );

  const { data: logMonitors } = useAppSwr<LogMonitor[]>(logMonitorBaseUrl);

  const { data: paths } = useAppSwr<string[]>(
    `${processesApiBase}/distinctProcessPaths`,
  );

  const isCopyingRef = useRef(false);
  const [, setRenderFlag] = useState(0);
  return (
    <MainWrapper>
      <div className="flex justify-center items-center h-8">
        <h2 className="mr-auto">
          <FormattedMessage
            id="ServiceManagement"
            defaultMessage={intl.formatMessage({
              id: 'ServiceManagement',
              defaultMessage: '服务管理',
            })}
          />
        </h2>
        <Tooltip
          title={intl.formatMessage({
            id: 'AddService',
            defaultMessage: '添加服务',
          })}
          placement="leftBottom"
        >
          <Button
            type="text"
            onClick={() => {
              processesForm.resetFields();
              setShowProcessesForm(true);
            }}
          >
            <FileAddOutlined />
          </Button>
        </Tooltip>
      </div>
      <ProcessTable
        processes={data}
        isLoading={isLoading}
        operatorColumn={{
          title: i18n.intl.formatMessage({
            id: 'Operation',
            defaultMessage: '操作',
          }),
          render: (_, processesRecord: Process) => (
            <div className="flex flex-wrap gap-4">
              <Tooltip
                title={i18n.intl.formatMessage({
                  id: 'DeleteService',
                  defaultMessage: '删除服务',
                })}
              >
                <Button
                  type="text"
                  onClick={() => {
                    Modal.confirm({
                      title: i18n.intl.formatMessage({
                        id: 'DeleteService',
                        defaultMessage: '是否删除服务?',
                      }),
                      icon: <ExclamationCircleFilled />,
                      onOk() {
                        jsonFetcher(
                          `${processesApiBase}/${processesRecord.id}`,
                          'DELETE',
                        ).then(() => {
                          message.success(
                            i18n.intl.formatMessage({
                              id: 'DeletedSuccessfully',
                              defaultMessage: '删除成功',
                            }),
                          );
                          refreshProcesses();
                        });
                      },
                    });
                  }}
                >
                  <DeleteOutlined />
                </Button>
              </Tooltip>
              <Tooltip
                title={i18n.intl.formatMessage({
                  id: 'EditService',
                  defaultMessage: '编辑服务',
                })}
              >
                <Button
                  type="text"
                  onClick={() => {
                    processesForm.setFieldsValue({
                      ...processesRecord,
                      logMonitorId: processesRecord.logMonitor?.id,
                    });
                    setShowProcessesForm(true);
                  }}
                >
                  <EditOutlined />
                </Button>
              </Tooltip>
            </div>
          ),
        }}
      />
      <Modal
        open={showProcessesForm}
        title={
          processesForm.getFieldValue('id') === undefined
            ? intl.formatMessage({
                id: 'CreateANewService',
                defaultMessage: '新建服务',
              })
            : intl.formatMessage({
                id: 'EditService',
                defaultMessage: '编辑服务',
              })
        }
        okButtonProps={{ autoFocus: true, htmlType: 'submit' }}
        onCancel={() => setShowProcessesForm(false)}
        destroyOnClose
        footer={[
          <Button onClick={() => setShowProcessesForm(false)}>
            <FormattedMessage id="key0001" defaultMessage="取消" />
          </Button>,
          <Button
            onClick={() => {
              isCopyingRef.current = true;
            }}
            color="primary"
            variant="outlined"
            htmlType="submit"
          >
            <FormattedMessage id="key0002" defaultMessage="复制" />
          </Button>,
          <Button htmlType="submit" type="primary">
            <FormattedMessage id="key0025" defaultMessage="提交" />
          </Button>,
        ]}
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={processesForm}
            name="form_in_modal"
            onFinish={(values) => {
              const id = processesForm.getFieldValue('id');
              if (isCopyingRef.current) {
                isCopyingRef.current = false;
                processesForm.setFieldValue('id', undefined);
                setRenderFlag((prev) => prev + 1);
                return;
              }
              jsonFetcher<ProcessesCreatedOrUpdated>(
                processesApiBase,
                id !== undefined ? 'PUT' : 'POST',
                {
                  ...values,
                  id,
                },
              ).then(() => {
                message.success(
                  intl.formatMessage({
                    id: 'OperationSuccessful',
                    defaultMessage: '操作成功',
                  }),
                );
                refreshProcesses();
                setShowProcessesForm(false);
              });
            }}
          >
            {dom}
          </Form>
        )}
      >
        <Form.Item
          name="path"
          label={intl.formatMessage({
            id: 'Path',
            defaultMessage: '路径',
          })}
          normalize={(v) => v?.trim()?.replace(/[\\/]+/g, '/')}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'PathCannotBeEmpty',
                defaultMessage: '路径不能为空',
              }),
            },
          ]}
        >
          <AutoComplete
            options={
              paths?.map((p) => ({
                label: p,
                value: p,
              })) ?? []
            }
          />
        </Form.Item>
        <Form.Item
          name="command"
          label={intl.formatMessage({
            id: 'Command',
            defaultMessage: '命令',
          })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: 'CommandCannotBeEmpty',
                defaultMessage: '命令不能为空',
              }),
            },
          ]}
        >
          <AutoComplete
            options={
              pkgJson
                ? Object.keys(safeParse(pkgJson).scripts ?? {}).reduce(
                    (commands, command) => {
                      commands.push({
                        label: command,
                        value: `npm run ${command}`,
                      });
                      return commands;
                    },
                    [] as DefaultOptionType[],
                  )
                : []
            }
          />
        </Form.Item>
        <Form.Item
          name="description"
          required
          label={intl.formatMessage({
            id: 'Name',
            defaultMessage: '名称',
          })}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="logMonitorId"
          label={intl.formatMessage({
            id: 'key0006',
            defaultMessage: '日志监控',
          })}
        >
          <Select
            allowClear
            options={logMonitors?.map((status) => ({
              label: (
                <span>
                  {status.name}-
                  {status.statusConfigurations?.map((m) => (
                    <span
                      style={{ color: m.labelColor }}
                      key={m.label + m.labelColor}
                    >
                      {m.label}
                    </span>
                  ))}
                </span>
              ),
              value: status.id,
            }))}
          />
        </Form.Item>
      </Modal>
    </MainWrapper>
  );
}
