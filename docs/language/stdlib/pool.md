# Worker & Task Pool (`pool`)

The `pool` module provides high-level task scheduling, multi-threaded parallel computation, and synchronized worker pools.

---

## Functions

### `pool.new(workers: Int) -> ZyraWorkerPool`
Creates and initializes a thread pool with the specified number of worker threads.

```zyra
const p = pool.new(4)
```

### `pool.submit(pool: ZyraWorkerPool, task: Fn)`
Submits a closure task to be executed asynchronously by an available worker thread.

```zyra
pool.submit(p, || {
  print("Worker executing task in background")
})
```

### `pool.map(pool: ZyraWorkerPool, items: Vec[T], transform: Fn(T) -> U) -> Vec[U]`
Executes a transformation function across all elements in parallel and aggregates the results.

```zyra
const results = pool.map(p, [1, 2, 3, 4], |x| {
  return x * 10
})
```

### `pool.wait_all(pool: ZyraWorkerPool)`
Blocks until all currently queued and running tasks in the pool complete execution.

```zyra
pool.wait_all(p)
```
