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
      <Header className=" bg-white">{title}</Header>
      <Content className="flex-auto flex-grow p-4 overflow-scroll">
        {children}
      </Content>
      <Footer className="space-x-5 flex">
        <Button onClick={() => onCancel()} className="ml-auto">
          取消
        </Button>
        {onCopy && (
          <Button
            color="primary"
            variant="outlined"
            onClick={() => {
              onCopy();
            }}
          >
            复制
          </Button>
        )}
        <Button
          type="primary"
          onClick={() => {
            onSubmit();
          }}
        >
          确定
        </Button>
      </Footer>
    </Layout>
  );
}
