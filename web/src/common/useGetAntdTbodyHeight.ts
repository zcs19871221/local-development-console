import { Table } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

const useGetAntdTbodyHeight = (tableToBottom: number) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableDomRef = useRef<any>(null);

  const [tbodyOffsetTop, setTBodyOffsetTop] = useState<number>(0);
  const [recalculateFlag, setRecalculateFlag] = useState(0);
  useEffect(() => {
    let timer: number | undefined;

    const getPosition = (num: number) => {
      if (!tableDomRef.current) {
        return;
      }
      if (num < 1) {
        return;
      }
      const header =
        tableDomRef.current.parentNode.querySelector('.ant-table-header');
      if (header === null) {
        timer = setTimeout(() => {
          getPosition(num - 1);
        }, 500);
        return;
      }

      const headerInfo = header.getBoundingClientRect();
      setTBodyOffsetTop(headerInfo.top + headerInfo.height);

      timer = setTimeout(() => {
        getPosition(num - 1);
      }, 500);
    };

    getPosition(4);

    return () => clearTimeout(timer);
  }, [tableDomRef, recalculateFlag]);

  console.log(tbodyOffsetTop);
  const scroll: React.ComponentProps<typeof Table>['scroll'] = useMemo(
    () => ({
      y: window.innerHeight - tbodyOffsetTop - tableToBottom,
    }),
    [tableToBottom, tbodyOffsetTop],
  );
  return {
    scroll,
    tableDomRef,
    recalculate: () => setRecalculateFlag((prev) => prev + 1),
  };
};

export default useGetAntdTbodyHeight;
