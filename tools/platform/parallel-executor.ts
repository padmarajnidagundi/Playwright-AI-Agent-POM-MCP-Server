export interface ParallelResult<T> {
  shard: string;
  success: boolean;
  output: T;
}

export async function runInParallel<T>(
  shards: string[],
  worker: (shard: string) => Promise<T>
): Promise<ParallelResult<T>[]> {
  const sortedShards = [...shards].sort((a, b) => a.localeCompare(b));
  const results = await Promise.all(
    sortedShards.map(async shard => {
      try {
        const output = await worker(shard);
        return { shard, success: true, output } as ParallelResult<T>;
      } catch (error) {
        return {
          shard,
          success: false,
          output: (error as Error).message as T,
        } as ParallelResult<T>;
      }
    })
  );

  return results.sort((a, b) => a.shard.localeCompare(b.shard));
}
