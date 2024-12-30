import { useIntl } from 'react-intl';
import {
  AutoComplete,
  Button,
  Form,
  Input,
  Modal,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd';

import {
  BorderOutlined,
  CaretRightOutlined,
  ClearOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  FileAddOutlined,
  FileOutlined,
  FolderOpenOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { ReactNode, useMemo, useRef, useState } from 'react';
import { css } from '@linaria/core';

import Select, { DefaultOptionType } from 'antd/es/select/index';
import useSWR from 'swr';
import {
  base,
  bufferFetcher,
  jsonFetcher,
  useAppSwr,
} from '../common/fetcher.tsx';

import {
  LogInfo,
  Process,
  processesApiBase,
  ProcessesCreatedOrUpdated,
} from './types.ts';
import { AppFormattedMessage, i18n } from '../i18n/index.tsx';
import useDebouncedValue from '../common/useDebouncedValue.tsx';
import safeParse from '../common/safeParse.ts';
import { LogMonitorTable } from '../log_monitor/LogMonitorList.tsx';
import { LogMonitor, logMonitorBaseUrl } from '../log_monitor/types.ts';
import MainWrapper from '../common/MainWrapper.tsx';

const operator = (type: 'start' | 'stop' | 'restart', processesId: number) =>
  jsonFetcher(`${processesApiBase}/${processesId}/${type}`, 'PUT').then(() => {
    message.success(
      i18n.intl.formatMessage(
        {
          id: 'vCommandHasBeenSent',
          defaultMessage: i18n.intl.formatMessage({
            id: 'vCommandHasBeenSent',
            defaultMessage: '{v1}指令已发送',
          }),
        },
        { v1: type },
      ),
    );
  });

const Status = ({
  logInfo,
  process,
  processesId,
  processesName,
  setProcessesId,
  refetchServerInfo,
  onClick,
  refetchLog,
}: {
  logInfo?: LogInfo;
  process?: Process;
  processesId: number;
  setProcessesId: (id: number) => void;
  refetchServerInfo: () => void;
  processesName?: string;
  onClick: () => void;
  refetchLog: () => void;
}) => {
  const intl = useIntl();

  return (
    <div>
      <div className="flex space-x-2 items-center">
        <div>{processesName ?? ''}</div>
        <Tag
          bordered={false}
          color={logInfo?.running ? 'gold' : 'grey'}
          className="flex align-middle cursor-pointer"
          onClick={onClick}
        >
          {logInfo?.running
            ? intl.formatMessage({
                id: 'Running',
                defaultMessage: '运行中',
              })
            : intl.formatMessage({
                id: 'NotRunning',
                defaultMessage: '未运行',
              })}
        </Tag>
        {logInfo?.running && (
          <Tag
            bordered={false}
            color={logInfo?.logStatus?.labelColor}
            className="flex align-middle cursor-pointer"
            onClick={onClick}
          >
            {logInfo?.logStatus?.label}
          </Tag>
        )}
      </div>
      <div className="text-grey mt-2">
        <Tooltip
          title={intl.formatMessage({
            id: 'StartService',
            defaultMessage: '启动服务',
          })}
        >
          <Button
            type="text"
            disabled={logInfo?.running}
            onClick={() => {
              operator('start', processesId).then(() => refetchServerInfo());
            }}
            className="text-green-600 cursor-pointer"
          >
            <CaretRightOutlined />
          </Button>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({
            id: 'StopService',
            defaultMessage: '关闭服务',
          })}
        >
          <Button
            type="text"
            disabled={!logInfo?.running}
            onClick={() => {
              operator('stop', processesId).then(() => refetchServerInfo());
            }}
            className="text-red-500 cursor-pointer"
          >
            <BorderOutlined />
          </Button>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({
            id: 'RestartService',
            defaultMessage: '重启服务',
          })}
        >
          <Button
            type="text"
            disabled={!logInfo?.running}
            onClick={() => {
              operator('restart', processesId).then(() => refetchServerInfo());
            }}
            className="text-green-600 cursor-pointer"
          >
            <RedoOutlined />
          </Button>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({
            id: 'ViewLog',
            defaultMessage: '查看日志',
          })}
        >
          <Button
            type="text"
            onClick={() => {
              setProcessesId(processesId);
            }}
          >
            <FileOutlined />
          </Button>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({
            id: 'ClearLog',
            defaultMessage: '清除日志',
          })}
        >
          <Button
            type="text"
            onClick={() => {
              jsonFetcher(
                `${processesApiBase}/${processesId}/logs`,
                'DELETE',
              ).then(() => refetchLog());
            }}
          >
            <ClearOutlined />
          </Button>
        </Tooltip>
        <Tooltip
          title={intl.formatMessage({
            id: 'OpenDirectory',
            defaultMessage: '打开目录',
          })}
        >
          <Button
            type="text"
            onClick={() => {
              jsonFetcher(
                `/system/run?command=${encodeURIComponent(
                  `code.cmd ${process?.path?.replace(/\\+/g, '/')}`,
                )}`,
                'GET',
              );
            }}
          >
            <FolderOpenOutlined />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default function ProcessesComponent() {
  const intl = useIntl();

  const {
    data,
    isLoading,
    mutate: refreshProcesses,
  } = useAppSwr<Process[]>(processesApiBase);

  const { data: processesInfo, mutate: refetchServerInfo } = useAppSwr<{
    [processesId: number]: LogInfo;
  }>(`${processesApiBase}/runningInfos`, {
    refreshInterval: 2000,
  });

  const [processId, setProcessId] = useState<number | null>(null);

  const { data: log, mutate: refetchLog } = useAppSwr<string>(
    processId !== null ? `${processesApiBase}/${processId}/logs` : undefined,
    processId !== null
      ? {
          fetcher: bufferFetcher,
          refreshInterval: 2000,
          revalidateIfStale: true,
          revalidateOnFocus: true,
          revalidateOnMount: true,
          revalidateOnReconnect: true,
        }
      : {},
  );

  const errorColor = useMemo(() => {
    if (
      processesInfo &&
      processId != null &&
      processesInfo[processId]?.logStatus?.isErrorStatus
    ) {
      return processesInfo[processId].logStatus.labelColor;
    }
    return '';
  }, [processId, processesInfo]);
  const [html, errorAnchorIds] = useMemo(() => {
    const reactNodes: ReactNode[] = [];
    const anchorIds: string[] = [];
    let lastOffset: number = 0;
    log?.replace(
      /(?:<-TAG_WRAPPER>([\s\S]+?)<\/-TAG_WRAPPER>)|(?:<-PATH_WRAPPER row=(\d*) col=(\d*) to-remove=([^>]*)>([\s\S]+?)<\/-PATH_WRAPPER>)/g,
      (_match, errorTag, row, col, toRemove, path, offset) => {
        reactNodes.push(log.slice(lastOffset, offset));
        lastOffset = offset + _match.length;
        if (errorTag) {
          reactNodes.push(
            <span
              id={`error-${anchorIds.length}`}
              style={{
                color: errorColor,
              }}
            >
              {errorTag}
            </span>,
          );
          anchorIds.push(`error-${anchorIds.length}`);
        } else if (path) {
          reactNodes.push(
            <span
              className="text-blue-400 cursor-pointer"
              onClick={() => {
                jsonFetcher(
                  `/system/run?command=${encodeURIComponent(
                    `code.cmd --goto ${path.replace(/\\+/g, '/').replace(toRemove, '')}:${row ?? 0}:${col ?? 0}`,
                  )}`,
                  'GET',
                );
              }}
            >
              {path}
            </span>,
          );
        }
        return '';
      },
    );
    reactNodes.push(log?.slice(lastOffset));
    return [reactNodes, anchorIds];
  }, [errorColor, log]);

  const errorAnchorIndexRef = useRef(0);

  const handleClickStatus = (id: number) => {
    if (processId == null) {
      setProcessId(id);
    }
    if (!errorAnchorIds || errorAnchorIds.length === 0) {
      return;
    }
    window.location.href = `#${errorAnchorIds?.[errorAnchorIndexRef.current]}`;
    errorAnchorIndexRef.current =
      (errorAnchorIndexRef.current + 1) % errorAnchorIds.length;
  };

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

  return (
    <MainWrapper>
      <div className="flex justify-center items-center h-8">
        <h2 className="mr-auto">
          <AppFormattedMessage
            id="ServiceManagement"
            defaultMessage="服务管理"
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
      <Table
        rowKey="id"
        pagination={false}
        dataSource={data}
        loading={isLoading}
        expandable={{
          expandedRowRender(record: Process) {
            return (
              <LogMonitorTable
                data={record.logMonitor ? [record.logMonitor] : []}
                isLoading={false}
              />
            );
          },
          defaultExpandAllRows: false,
        }}
        columns={[
          {
            title: intl.formatMessage({
              id: 'Description',
              defaultMessage: '描述',
            }),
            dataIndex: 'description',
            render: (_val, record: Process) => (
              <div>
                <div>
                  <Status
                    logInfo={processesInfo?.[record.id]}
                    processesId={record.id}
                    process={record}
                    processesName={record.description}
                    onClick={() => handleClickStatus(record.id)}
                    setProcessesId={setProcessId}
                    refetchServerInfo={refetchServerInfo}
                    refetchLog={refetchLog}
                  />
                </div>
              </div>
            ),
          },
          {
            title: intl.formatMessage({
              id: 'Command',
              defaultMessage: '命令',
            }),
            dataIndex: 'command',
          },
          {
            dataIndex: 'path',
            title: intl.formatMessage({
              id: 'Address',
              defaultMessage: '地址',
            }),
          },
          {
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
          },
        ]}
      />
      <Modal
        open={processId !== null && processesInfo !== undefined}
        onCancel={() => setProcessId(null)}
        footer={null}
        title={
          <div className="space-x-5 flex align-middle">
            {processId !== null && (
              <Status
                logInfo={processesInfo?.[processId]}
                processesId={processId}
                refetchLog={refetchLog}
                process={data?.find((d) => d.id === processId)}
                processesName={
                  data?.find((d) => d.id === processId)?.description
                }
                onClick={() => handleClickStatus(processId)}
                setProcessesId={setProcessId}
                refetchServerInfo={refetchServerInfo}
              />
            )}
          </div>
        }
        width="80vw"
        classNames={{
          body: css`
            height: 80vh;
            overflow-y: scroll;
          `,
        }}
        centered
      >
        <pre>{html}</pre>
      </Modal>

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
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={processesForm}
            name="form_in_modal"
            onFinish={(values) => {
              const id = processesForm.getFieldValue('id');

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
          label={intl.formatMessage({
            id: 'NameOrDescription',
            defaultMessage: '名称或描述',
          })}
        >
          <Input />
        </Form.Item>

        <Form.Item name="logMonitorId" label="日志监控">
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
