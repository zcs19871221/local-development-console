export type MakeTypeOptionalRecursively<T, TYPE> = T extends TYPE
  ? {
      [K in keyof Omit<T, keyof TYPE>]: MakeTypeOptionalRecursively<T[K], TYPE>;
    } & Partial<TYPE>
  : T extends (infer U)[]
    ? MakeTypeOptionalRecursively<U, TYPE>[]
    : T;
