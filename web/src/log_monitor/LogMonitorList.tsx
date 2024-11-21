import { useIntl } from 'react-intl';
import { Modal, Table, Tooltip, message } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  FileAddOutlined,
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';
import { KeyedMutator } from 'swr';
import { useAppSwr, jsonFetcher } from '../common/fetcher.tsx';
import { logMonitorBaseUrl, LogMonitor, LogStatus } from './types.ts';
import { i18n } from '../i18n/index.tsx';
import MainWrapper from '../common/MainWrapper.tsx';

export const logStatusColumn = () => [
  {
    dataIndex: 'label',
    title: '标签',
    render: (label: string, r: LogStatus) => (
      <span style={{ color: r.labelColor }}>{label}</span>
    ),
  },
  {
    dataIndex: 'logMatchPatterns',
    title: '匹配规则',
    render: (values: string[]) => values.map((v) => <div>{v}</div>),
  },
  {
    dataIndex: 'isErrorStatus',
    title: '是否错误状态',
    render: (val: boolean) => (val ? '是' : '否'),
  },
  {
    dataIndex: 'clearLogOnMatch',
    title: '匹配时是否清除之前日志',
    render: (val: boolean) =>
      val
        ? i18n.intl.formatMessage({
            id: 'ClearLog',
            defaultMessage: '清除日志',
          })
        : i18n.intl.formatMessage({
            id: 'DoNotClearTheLog',
            defaultMessage: '不清除日志',
          }),
  },
];

export const LogMonitorTable = ({
  data,
  isLoading,
  mutate,
}: {
  data: LogMonitor[];
  isLoading: boolean;
  mutate?: KeyedMutator<LogMonitor[]>;
}) => {
  const intl = useIntl();
  const navigate = useNavigate();

  return (
    <Table
      rowKey="id"
      dataSource={data}
      loading={isLoading}
      pagination={false}
      expandable={{
        expandedRowRender(record: LogMonitor) {
          return (
            <Table
              rowKey="id"
              columns={logStatusColumn()}
              dataSource={record.statusConfigurations}
              pagination={false}
            />
          );
        },
        defaultExpandAllRows: true,
      }}
      columns={
        [
          {
            title: '名称',
            dataIndex: 'name',
          },
          mutate && {
            title: intl.formatMessage({
              id: 'Operation',
              defaultMessage: '操作',
            }),
            render: (_: unknown, row: LogMonitor) => (
              <div className="space-x-5">
                <Tooltip
                  title={intl.formatMessage({
                    id: 'EditProject',
                    defaultMessage: '编辑日志监控配置',
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
                    id: 'DeleteLogStatusConfiguration',
                    defaultMessage: '删除日志监控配置',
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
                            `${logMonitorBaseUrl}/${row.id}`,
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ].filter(Boolean) as any
      }
    />
  );
};

export default function LogMonitorList() {
  const intl = useIntl();
  const navigate = useNavigate();
  const { data, mutate, isLoading } =
    useAppSwr<LogMonitor[]>(logMonitorBaseUrl);

  return (
    <MainWrapper>
      <div className="flex justify-center items-center h-8 ">
        <h2 className="mr-auto">日志监控配置</h2>
        <Tooltip
          title={intl.formatMessage({
            id: 'AddLogStatus',
            defaultMessage: '增加日志监控',
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
      {data !== undefined && (
        <LogMonitorTable data={data} isLoading={isLoading} mutate={mutate} />
      )}
    </MainWrapper>
  );
}
