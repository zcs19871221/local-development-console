import { FormattedMessage } from 'react-intl';
import { Button, Layout } from 'antd';
import { Content, Footer, Header } from 'antd/es/layout/layout';

export default function DetailLayout({
  title,
  children,
  onSubmit,
  onCopy,
  onCancel,
}: {
  title: string;
  children: React.ReactNode;
  onSubmit: () => void;
  onCopy?: () => void;
  onCancel: () => void;
}) {
  return (
    <Layout className="h-full flex flex-col">
      <Header className=" bg-white pl-4">{title}</Header>
      <Content className="flex-auto flex-grow p-4 overflow-auto">
        {children}
      </Content>
      <Footer className="space-x-5 flex h-12 shrink-0 grow-0 p-0 items-center pr-8 pl-4">
        <Button onClick={() => onCancel()} className="ml-auto">
          <FormattedMessage id="key0001" defaultMessage="取消" />
        </Button>
        {onCopy && (
          <Button
            color="primary"
            variant="outlined"
            onClick={() => {
              onCopy();
            }}
          >
            <FormattedMessage id="key0002" defaultMessage="复制" />
          </Button>
        )}
        <Button
          type="primary"
          onClick={() => {
            onSubmit();
          }}
        >
          <FormattedMessage id="key0003" defaultMessage="确定" />
        </Button>
      </Footer>
    </Layout>
  );
}
