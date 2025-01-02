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

import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { css } from '@linaria/core';
import MainWrapper from '../common/MainWrapper.tsx';
import { jsonFetcher, useAppSwr } from '../common/fetcher.tsx';
import {
  processChainApiBase,
  ProcessChainConfigResponse,
  ProcessChainResponse,
} from './types.ts';
import { Process, processesApiBase } from '../process/types.ts';
import ProcessTable from '../process/ProcessTable.tsx';

export default function ProcessChainList() {
  const navigate = useNavigate();
  const intl = useIntl();
  const { data, mutate, isLoading } =
    useAppSwr<ProcessChainResponse[]>(processChainApiBase);

  const { data: processes, isLoading: loadingProcesses } =
    useAppSwr<Process[]>(processesApiBase);

  const i18n = useIntl();
  const operator = (
    type: 'start' | 'stop' | 'restart',
    processChainId: number,
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
            { v1: type },
          ),
        );
      },
    );

  return (
    <MainWrapper>
      <div className="flex justify-center items-center h-8 ">
        <h2 className="mr-auto">服务链列表</h2>
        <Tooltip title="增加服务链" placement="leftBottom">
          <FileAddOutlined
            onClick={() => {
              navigate('new');
            }}
          />
        </Tooltip>
      </div>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        expandable={{
          expandedRowRender(record: ProcessChainResponse) {
            const processIds: number[] = [];
            const getProcessId = (
              chainConfigs?: ProcessChainConfigResponse[],
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
                  processIds?.includes(process.id),
                )}
              />
            );
          },
          defaultExpandAllRows: false,
        }}
        columns={[
          {
            title: '名称',
            dataIndex: 'name',
            render: (name: string, record: ProcessChainResponse) => (
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
                <Tooltip
                  title={intl.formatMessage({
                    id: 'StartService',
                    defaultMessage: '启动服务',
                  })}
                >
                  <Button
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
            ),
          },
          {
            title: '项目树',
            render: (_, record: ProcessChainResponse) => {
              const getPath = (
                processChainConfigs: ProcessChainConfigResponse[],
                level = 0,
              ) => {
                let path = '';
                processChainConfigs?.forEach((config) => {
                  path +=
                    `\n${'--'.repeat(level)}${
                      processes?.find(
                        (process) => process.id === config.processId,
                      )?.description
                    }` || '';
                  path += getPath(
                    config.childProcessChainConfigs ?? [],
                    level + 1,
                  );
                });
                return path;
              };
              return <pre>{getPath(record.processChainConfigs ?? [])}</pre>;
            },
          },
          {
            title: '操作',
            render: (_: unknown, row: ProcessChainResponse) => (
              <div className="space-x-5">
                <Tooltip title="编辑服务链">
                  <EditOutlined
                    onClick={() => {
                      navigate(`${row.id}`);
                    }}
                  />
                </Tooltip>
                <Tooltip title="删除服务链">
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
                            'DELETE',
                          ).then(() => {
                            message.success(
                              intl.formatMessage({
                                id: 'DeletedSuccessfully',
                                defaultMessage: '删除成功',
                              }),
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
