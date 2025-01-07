import { useIntl } from 'react-intl';
import { Button, Modal, Table, Tag, Tooltip, message } from 'antd';

import {
  BorderOutlined,
  CaretRightOutlined,
  ClearOutlined,
  FileOutlined,
  FolderOpenOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { ReactNode, useMemo, useRef, useState } from 'react';
import { css } from '@linaria/core';

import { ColumnsType } from 'antd/es/table/InternalTable';
import { bufferFetcher, jsonFetcher, useAppSwr } from '../common/fetcher.tsx';

import { LogInfo, Process, processesApiBase } from './types.ts';
import { i18n } from '../i18n/index.tsx';
import { LogMonitorTable } from '../log_monitor/LogMonitorList.tsx';

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

export const RunningTag = ({
  running,
  onClick,
  style,
}: {
  running?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}) => {
  const intl = useIntl();
  return (
    <Tag
      bordered={false}
      style={style ?? {}}
      color={running ? 'gold' : 'grey'}
      className="flex items-center cursor-pointer"
      onClick={() => onClick?.()}
    >
      {running
        ? intl.formatMessage({
            id: 'Running',
            defaultMessage: '运行中',
          })
        : intl.formatMessage({
            id: 'NotRunning',
            defaultMessage: '未运行',
          })}
    </Tag>
  );
};
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

        <RunningTag running={logInfo?.running} onClick={onClick} />
        {logInfo?.running && (
          <Tag
            bordered={false}
            color={logInfo?.logStatus?.labelColor}
            className="flex items-center cursor-pointer"
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

export default function ProcessTable({
  processes,
  isLoading,
  operatorColumn,
  onReceiveRunningInfo,
}: {
  processes?: Process[];
  isLoading: boolean;
  operatorColumn?: ColumnsType<Process> extends (infer U)[] ? U : unknown;
  onReceiveRunningInfo?: (
    data:
      | {
          [processesId: number]: LogInfo;
        }
      | undefined,
  ) => void;
}) {
  const intl = useIntl();

  const { data: processesInfo, mutate: refetchServerInfo } = useAppSwr<{
    [processesId: number]: LogInfo;
  }>(`${processesApiBase}/runningInfos`, {
    refreshInterval: 2000,
    onSuccess: () => onReceiveRunningInfo?.(processesInfo),
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

  return (
    <>
      <Table
        rowKey="id"
        pagination={false}
        dataSource={processes}
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
          operatorColumn || {},
        ]}
      />
      <Modal
        open={processId !== null && processesInfo !== undefined}
        onCancel={() => setProcessId(null)}
        footer={null}
        title={
          <div className="space-x-5 flex items-center">
            {processId !== null && (
              <Status
                logInfo={processesInfo?.[processId]}
                processesId={processId}
                refetchLog={refetchLog}
                process={processes?.find((d) => d.id === processId)}
                processesName={
                  processes?.find((d) => d.id === processId)?.description
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
    </>
  );
}
