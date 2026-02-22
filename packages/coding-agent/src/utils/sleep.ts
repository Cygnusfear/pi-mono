/**
 * Sleep helper that respects abort signal.
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(new Error("Aborted"));
			return;
		}

		// Avoid creating a closure over `resolve`/`reject` that keeps the
		// surrounding scope alive for the lifetime of the signal. Using a
		// named handler + { once: true } lets the listener be GC'd promptly.
		const onAbort = () => {
			clearTimeout(timeout);
			reject(new Error("Aborted"));
		};
		const timeout = setTimeout(() => {
			signal?.removeEventListener("abort", onAbort);
			resolve();
		}, ms);

		signal?.addEventListener("abort", onAbort, { once: true });
	});
}
