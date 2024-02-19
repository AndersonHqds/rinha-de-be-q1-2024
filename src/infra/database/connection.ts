export default interface Connection {
  connect(): Promise<
    [
      {
        query: (statement: string, params?: any) => Promise<any>;
      },
      close: () => void
    ]
  >;
}
