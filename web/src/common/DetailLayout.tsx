import { Button, Layout } from 'antd';
import { Content, Footer, Header } from 'antd/es/layout/layout';

export default function DetailLayout({
  title,
  children,
  onSubmit,
  onCancel,
}: {
  title: string;
  children: React.ReactNode;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <Layout className="h-full flex flex-col">
      <Header className=" bg-white">{title}</Header>
      <Content className="flex-auto flex-grow p-4 overflow-scroll">
        {children}
      </Content>
      <Footer className="space-x-5 flex">
        <Button
          type="primary"
          className="ml-auto"
          onClick={() => {
            onSubmit();
          }}
        >
          确定
        </Button>
        <Button onClick={() => onCancel()}>取消</Button>
      </Footer>
    </Layout>
  );
}
