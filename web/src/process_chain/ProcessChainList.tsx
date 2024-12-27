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

export default function ProcessChainList() {
  const intl = useIntl();
  const navigate = useNavigate();
  const { data, mutate, isLoading } =
    useAppSwr<LogMonitor[]>(logMonitorBaseUrl);

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
      {data !== undefined && (
        <LogMonitorTable data={data} isLoading={isLoading} mutate={mutate} />
      )}
    </MainWrapper>
  );
}
