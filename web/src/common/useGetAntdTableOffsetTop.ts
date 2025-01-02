import { useEffect, useRef, useState } from 'react';

const useGetAntdTableOffsetTop = (disable: boolean = false) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableDomRef = useRef<any>(null);

  const [tbodyOffsetTop, setTBodyOffsetTop] = useState<number>(0);

  useEffect(() => {
    let timer: number | undefined;

    const getPosition = (num: number) => {
      if (disable) {
        return;
      }
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
  }, [disable, tableDomRef]);

  return { tbodyOffsetTop, tableDomRef };
};

export default useGetAntdTableOffsetTop;
