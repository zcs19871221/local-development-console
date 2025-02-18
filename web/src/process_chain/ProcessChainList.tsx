import { Button, message, Modal, Table, Tooltip } from 'antd';
import {
  BorderOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  FileAddOutlined,
  RedoOutlined,
} from '@ant-design/icons';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { css } from '@linaria/core';
import { useMemo } from 'react';
import MainWrapper from '../common/MainWrapper.tsx';
import { jsonFetcher, useAppSwr } from '../common/fetcher.tsx';
import {
  processChainApiBase,
  ProcessChainConfigResponse,
  ProcessChainResponse,
} from './types.ts';
import { LogInfo, Process, processesApiBase } from '../process/types.ts';
import ProcessTable, { RunningTag } from '../process/ProcessTable.tsx';

export default function ProcessChainList() {
  const navigate = useNavigate();
  const intl = useIntl();
  const { data, mutate, isLoading } =
    useAppSwr<ProcessChainResponse[]>(processChainApiBase);
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: processes, isLoading: loadingProcesses } =
    useAppSwr<Process[]>(processesApiBase);

  const processChains = useMemo(
    () =>
      data?.map((chain) => {
        const processIds: number[] = [];
        const getProcessId = (chainConfigs?: ProcessChainConfigResponse[]) => {
          chainConfigs?.forEach((chainConfig) => {
            processIds.push(chainConfig.processId);
            getProcessId(chainConfig.childProcessChainConfigs);
          });
        };
        getProcessId(chain.processChainConfigs);
        return {
          ...chain,
          processIds,
        };
      }) ?? [],
    [data]
  );
  const i18n = useIntl();
  const operator = (
    type: 'start' | 'stop' | 'restart',
    processChainId: number
  ) =>
    jsonFetcher(`${processChainApiBase}/${processChainId}/${type}`, 'PUT').then(
      () => {
        message.success(
          i18n.formatMessage(
            {
              id: 'vCommandHasBeenSent',
              defaultMessage: i18n.formatMessage({
                id: 'vCommandHasBeenSent',
                defaultMessage: '{v1}指令已发送',
              }),
            },
            { v1: type }
          )
        );
      }
    );

  const { data: processesInfo } = useAppSwr<{
    [processesId: number]: LogInfo;
  }>(`${processesApiBase}/runningInfos`, {
    refreshInterval: 2000,
  });

  return (
    <MainWrapper>
      <div className="flex justify-center items-center h-8 ">
        <h2 className="mr-auto">
          <FormattedMessage id="key0037" defaultMessage="服务链列表" />
        </h2>
        <Tooltip
          title={intl.formatMessage({
            id: 'key0038',
            defaultMessage: '增加服务链',
          })}
          placement="leftBottom"
        >
          <FileAddOutlined
            onClick={() => {
              navigate('new');
            }}
          />
        </Tooltip>
      </div>
      <Table
        className="overflow-y-auto"
        pagination={false}
        loading={isLoading}
        rowKey="id"
        dataSource={processChains}
        expandable={{
          expandedRowKeys: searchParams
            .get('expandIds')
            ?.split(',')
            .map(Number),
          onExpand: (expanded, record) => {
            const newSearchParams = new URLSearchParams(searchParams);
            const ids =
              newSearchParams
                .get('expandIds')
                ?.split(',')
                ?.filter(Boolean)
                ?.map(Number) ?? [];
            if (expanded) {
              ids?.push(record.id);
            } else {
              ids?.splice(ids.indexOf(record.id), 1);
            }
            const newExpandIds = ids?.join(',') ?? '';
            newSearchParams.set('expandIds', newExpandIds);
            setSearchParams(newSearchParams);
          },
          expandedRowRender(record: ProcessChainResponse) {
            const processIds: number[] = [];
            const getProcessId = (
              chainConfigs?: ProcessChainConfigResponse[]
            ) => {
              chainConfigs?.forEach((chainConfig) => {
                processIds.push(chainConfig.processId);
                getProcessId(chainConfig.childProcessChainConfigs);
              });
            };
            getProcessId(record.processChainConfigs);

            return (
              <ProcessTable
                isLoading={loadingProcesses}
                processes={processes?.filter((process) =>
                  processIds?.includes(process.id)
                )}
              />
            );
          },
          defaultExpandAllRows: false,
        }}
        columns={[
          {
            title: intl.formatMessage({
              id: 'Name',
              defaultMessage: '名称',
            }),
            dataIndex: 'name',
            render: (name: string, record: ProcessChainResponse) => {
              const isProcessChainRunning =
                Object.keys(processesInfo ?? {})
                  .sort()
                  .join(',') ===
                [...(record.processIds ?? [])].sort().join(',');

              return (
                <div
                  className={css`
                    display: flex;
                    align-items: center;
                    button {
                      display: flex;
                      align-items: center;
                    }
                  `}
                >
                  {name}
                  <RunningTag
                    style={{ marginLeft: '10px' }}
                    running={isProcessChainRunning}
                  />
                  <Tooltip
                    title={intl.formatMessage({
                      id: 'StartService',
                      defaultMessage: '启动服务',
                    })}
                  >
                    <Button
                      disabled={
                        isProcessChainRunning &&
                        record.processIds?.every(
                          (id) => processesInfo?.[id]?.running
                        )
                      }
                      type="text"
                      onClick={() => {
                        operator('start', record.id);
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
                      disabled={
                        !isProcessChainRunning ||
                        record.processIds?.every(
                          (id) => !processesInfo?.[id]?.running
                        )
                      }
                      onClick={() => {
                        operator('stop', record.id);
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
                      onClick={() => {
                        operator('restart', record.id);
                      }}
                      className="text-green-600 cursor-pointer"
                    >
                      <RedoOutlined />
                    </Button>
                  </Tooltip>
                </div>
              );
            },
          },
          {
            title: intl.formatMessage({
              id: 'key0039',
              defaultMessage: '服务依赖关系树',
            }),
            render: (_, record: ProcessChainResponse) => {
              const getPath = (
                processChainConfigs: ProcessChainConfigResponse[],
                level = 0
              ) => {
                let path = '';
                processChainConfigs?.forEach((config) => {
                  path +=
                    `\n${'--'.repeat(level)}${
                      processes?.find(
                        (process) => process.id === config.processId
                      )?.description
                    }` || '';
                  path += getPath(
                    config.childProcessChainConfigs ?? [],
                    level + 1
                  );
                });
                return path;
              };
              return <pre>{getPath(record.processChainConfigs ?? [])}</pre>;
            },
          },
          {
            title: intl.formatMessage({
              id: 'Operation',
              defaultMessage: '操作',
            }),
            render: (_: unknown, row: ProcessChainResponse) => (
              <div className="space-x-5">
                <Tooltip
                  title={intl.formatMessage({
                    id: 'key0040',
                    defaultMessage: '编辑服务链',
                  })}
                >
                  <EditOutlined
                    onClick={() => {
                      navigate(`${row.id}`);
                    }}
                  />
                </Tooltip>
                <Tooltip
                  title={intl.formatMessage({
                    id: 'key0041',
                    defaultMessage: '删除服务链',
                  })}
                >
                  <DeleteOutlined
                    onClick={() => {
                      Modal.confirm({
                        title: intl.formatMessage({
                          id: 'DoYouWantToDeleteTheProject',
                          defaultMessage: '是否删除?',
                        }),
                        icon: <ExclamationCircleFilled />,
                        onOk() {
                          jsonFetcher(
                            `${processChainApiBase}/${row.id}`,
                            'DELETE'
                          ).then(() => {
                            message.success(
                              intl.formatMessage({
                                id: 'DeletedSuccessfully',
                                defaultMessage: '删除成功',
                              })
                            );
                            mutate?.();
                          });
                        },
                      });
                    }}
                  />
                </Tooltip>
              </div>
            ),
          },
        ]}
      />
    </MainWrapper>
  );
}
