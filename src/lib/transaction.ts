export interface TransactionContext<T> {
  id: string;
  data: T;
  rollbackActions: (() => Promise<void>)[];
}

export const runTransactionalOperation = async <T, R>(
  data: T,
  operation: (data: T, context: TransactionContext<T>) => Promise<R>,
  rollback: (data: T) => Promise<void>
): Promise<R> => {
  const context: TransactionContext<T> = {
    id: Math.random().toString(36).substring(7),
    data,
    rollbackActions: [],
  };

  try {
    return await operation(data, context);
  } catch (error) {
    console.error(`[TRANSACTION ERROR] ${context.id}:`, error);
    // Execute rollbacks in reverse order
    for (const action of context.rollbackActions.reverse()) {
      try {
        await action();
      } catch (rollbackError) {
        console.error(`[ROLLBACK FAILURE] ${context.id}:`, rollbackError);
      }
    }
    throw error;
  }
};
