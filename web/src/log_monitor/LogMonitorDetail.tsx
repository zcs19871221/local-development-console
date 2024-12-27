import {
  Form,
  message,
  Input,
  Card,
  ColorPicker,
  Checkbox,
  Button,
  Skeleton,
  theme,
} from 'antd';
import { Color, ColorPickerProps } from 'antd/es/color-picker';
import { useIntl } from 'react-intl';
import { generate, green, presetPalettes, red, blue } from '@ant-design/colors';
import { useNavigate, useParams } from 'react-router-dom';
import { useLayoutEffect } from 'react';
import {
  LogMonitor,
  logMonitorBaseUrl,
  LogMonitorCreatedOrUpdated,
} from './types.ts';
import { jsonFetcher, useAppSwr } from '../common/fetcher.tsx';
import DetailLayout from '../common/LogMonitorDetail.tsx';

type Presets = Required<ColorPickerProps>['presets'][number];

const genPresets = (presets = presetPalettes) =>
  Object.entries(presets).map<Presets>(([label, colors]) => ({
    label,
    colors,
  }));

export default function LogMonitorDetail() {
  const intl = useIntl();
  const { logMonitorId } = useParams();
  const [form] = Form.useForm<LogMonitorCreatedOrUpdated>();
  const { token } = theme.useToken();

  const { data, isLoading } = useAppSwr<LogMonitor>(
    logMonitorId ? `${logMonitorBaseUrl}/${logMonitorId}` : undefined,
  );

  const presets = genPresets({
    primary: generate(token.colorPrimary),
    red,
    green,
    blue,
  });

  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (isLoading) {
      return;
    }
    if (data) {
      form.setFieldsValue(data);
    }
  }, [data, form, isLoading]);
  return (
    <DetailLayout
      onSubmit={async () => {
        const values = await form.validateFields();

        jsonFetcher(logMonitorBaseUrl, logMonitorId ? 'PUT' : 'POST', {
          ...values,
          id: logMonitorId,
        }).then(() => {
          message.success(
            intl.formatMessage({
              id: 'OperationSuccessful',
              defaultMessage: '操作成功',
            }),
          );
          navigate('..');
        });
      }}
      onCancel={() => {
        navigate('../');
      }}
      title={
        logMonitorId ? `编辑日志监控 - ${data?.name ?? ''}` : '新建日志监控'
      }
    >
      <Skeleton loading={isLoading}>
        <Form layout="horizontal" form={form}>
          <Form.Item
            name="name"
            label={intl.formatMessage({
              id: 'Name',
              defaultMessage: '名称',
            })}
            rules={[{ required: true, message: '请输入名称' }]}
            required
          >
            <Input />
          </Form.Item>
          <Form.Item label="日志状态" required>
            <Form.List
              name="statusConfigurations"
              rules={[
                {
                  validator: async (_, configurations) => {
                    if (!configurations || configurations.length < 1) {
                      return Promise.reject(new Error('至少添加一个日志状态'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <div className="flex flex-col gap-3">
                  {fields.map((field) => (
                    <Card key={field.key}>
                      <Form.Item
                        name={[field.name, 'label']}
                        label={intl.formatMessage({
                          id: 'LabelName',
                          defaultMessage: '标签名',
                        })}
                        rules={[{ required: true, message: '请输入标签名' }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, 'labelColor']}
                        label={intl.formatMessage({
                          id: 'LabelColor',
                          defaultMessage: '标签颜色',
                        })}
                        required
                        getValueFromEvent={(color: Color) =>
                          color.toHexString()
                        }
                        rules={[{ required: true, message: '请输入颜色' }]}
                      >
                        <ColorPicker presets={presets} />
                      </Form.Item>
                      <Form.Item required label="匹配规则组">
                        <Form.List name={[field.name, 'logMatchPatterns']}>
                          {(
                            matcherPatternFields,
                            {
                              add: addMatchPattern,
                              remove: removeMatchPattern,
                            },
                          ) => (
                            <div className="flex flex-col gap-3">
                              {matcherPatternFields.map(
                                (matcherPatternField) => (
                                  <Card key={matcherPatternField.key}>
                                    <Form.Item
                                      name={matcherPatternField.name}
                                      label={intl.formatMessage({
                                        id: 'MatchingRule',
                                        defaultMessage: '匹配规则',
                                      })}
                                      required
                                      rules={[
                                        {
                                          required: true,
                                          message: '请输入匹配规则',
                                        },
                                      ]}
                                    >
                                      <Input />
                                    </Form.Item>
                                    <Button
                                      onClick={() => {
                                        removeMatchPattern(
                                          matcherPatternField.name,
                                        );
                                      }}
                                    >
                                      删除匹配规则
                                    </Button>
                                  </Card>
                                ),
                              )}
                              <Button onClick={() => addMatchPattern()} block>
                                添加匹配规则
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </Form.Item>

                      <Form.Item
                        name={[field.name, 'isErrorStatus']}
                        label="是否是错误匹配"
                        valuePropName="checked"
                      >
                        <Checkbox />
                      </Form.Item>
                      <Button
                        onClick={() => {
                          remove(field.name);
                        }}
                      >
                        删除日志状态配置
                      </Button>
                    </Card>
                  ))}
                  <Button onClick={() => add()} block>
                    添加日志状态配置
                  </Button>
                  <Form.ErrorList errors={errors} />
                </div>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Skeleton>
    </DetailLayout>
  );
}
