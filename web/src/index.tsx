import { useIntl } from 'react-intl';
import { ConfigProvider, Layout, Menu, message, Select, Alert } from 'antd';
import { CloudServerOutlined } from '@ant-design/icons';
import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { SWRConfig } from 'swr';

import './index.css';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { jsonFetcher } from './common/fetcher.tsx';
import {
  AppFormattedMessage,
  LocaleProvider,
  useLocale,
} from './i18n/index.tsx';
import LogMonitor from './log_monitor/index.tsx';
import ProcessChain from './process_chain/index.tsx';

export type AvailableLocale = 'zh-CN' | 'en-US';

const { Option } = Select;
const { Sider, Content, Header } = Layout;
const { ErrorBoundary } = Alert;

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json().then((d) => d.data));

const Processes = lazy(() => import('./process/index.tsx'));

export const App = () => {
  const intl = useIntl();

  const navigate = useNavigate();

  const { locale, setLocale } = useLocale();

  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true,
        revalidateOnMount: true,
        revalidateOnReconnect: true,
        revalidateIfStale: false,
      }}
    >
      <ConfigProvider
        locale={{ locale: 'en-us' }}
        theme={{
          token: {
            // Seed Token
            colorPrimary: '#7939cb',
            borderRadius: 2,
            fontSize: 16,
          },
        }}
      >
        <Layout className="h-full ">
          <Header className="text-white flex items-center">
            <div>
              <AppFormattedMessage
                id="FrontendManagementSystem"
                defaultMessage="前端管理系统"
              />
            </div>
            <div
              className="ml-auto cursor-pointer"
              onClick={() => {
                jsonFetcher('/system/shutdown', 'PUT').then((res) => {
                  message.success({ duration: 2, content: res });
                });
              }}
            >
              <AppFormattedMessage
                id="ShutdownSystem"
                defaultMessage="关闭系统"
              />
            </div>
            <Select onChange={setLocale} value={locale} className="ml-5 w-28">
              <Option value="en-us">English</Option>
              <Option value="zh-cn">
                <AppFormattedMessage id="Chinese" defaultMessage="中文" />
              </Option>
            </Select>
          </Header>
          <Layout>
            <Sider>
              <Menu
                mode="inline"
                onClick={(item) => {
                  navigate(item.key);
                }}
                items={[
                  {
                    key: 'process',
                    label: intl.formatMessage({
                      id: 'Service',
                      defaultMessage: '服务',
                    }),
                    icon: <CloudServerOutlined />,
                  },
                  {
                    key: 'logMonitor',
                    label: '日志监控',
                    icon: <CloudServerOutlined />,
                  },
                  {
                    key: 'processChain',
                    label: '服务链',
                    icon: <CloudServerOutlined />,
                  },
                ]}
              />
            </Sider>
            <Layout>
              <Content>
                <Suspense fallback={<div>loading</div>}>
                  <Routes>
                    <Route path="/process" element={<Processes />} />
                    <Route path="/logMonitor/*" element={<LogMonitor />} />
                    <Route path="/processChain/*" element={<ProcessChain />} />
                    <Route path="/" element={<Navigate to="/process" />} />
                    <Route path="*" element={<div>404</div>} />
                  </Routes>
                </Suspense>
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </ConfigProvider>
    </SWRConfig>
  );
};

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <LocaleProvider defaultLocale="zh-cn">
          <App />
        </LocaleProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
