import {
  CaretRightOutlined,
  BorderOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { Tooltip, Button, message } from 'antd';
import { useIntl } from 'react-intl';
import { jsonFetcher } from '../common/fetcher.tsx';
import { i18n } from '../../i18n/index.tsx';
import { processChainApiBase } from './types.ts';

export default function ProcessChainOperators({
  processChainId,
}: {
  processChainId: number;
}) {
  const intl = useIntl();

  const operator = (type: 'start' | 'stop' | 'restart') =>
    jsonFetcher(`${processChainApiBase}/${processChainId}/${type}`, 'PUT').then(
      () => {
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
      },
    );

  return (
    <>
      <Tooltip
        title={intl.formatMessage({
          id: 'StartService',
          defaultMessage: '启动服务',
        })}
      >
        <Button
          type="text"
          onClick={() => {
            operator('start');
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
            operator('stop');
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
            operator('restart');
          }}
          className="text-green-600 cursor-pointer"
        >
          <RedoOutlined />
        </Button>
      </Tooltip>
    </>
  );
}
