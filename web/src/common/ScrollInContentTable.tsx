import { Table } from 'antd';
import { useMemo } from 'react';
import useGetAntdTableOffsetTop from './useGetAntdTableOffsetTop.ts';

export default function ScrollInContentTable({
  tableBottomToView,
  ...props
}: React.ComponentProps<typeof Table> & {
  tableBottomToView?: number;
}) {
  const disabled =
    tableBottomToView === null || tableBottomToView === undefined;
  const { tableDomRef, tbodyOffsetTop } = useGetAntdTableOffsetTop(disabled);
  const scroll = useMemo(() => {
    const curScroll = props.scroll ?? {};
    if (!disabled) {
      curScroll.y = window.innerHeight - tbodyOffsetTop - 20;
    }
    return curScroll;
  }, [disabled, props.scroll, tbodyOffsetTop]);

  return <Table ref={tableDomRef} {...props} scroll={scroll} />;
}
