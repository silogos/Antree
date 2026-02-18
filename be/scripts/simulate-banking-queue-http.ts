#!/usr/bin/env node

/**
 * Script Simulasi Antrian Bank (Versi HTTP yang Ditingkatkan)
 * Menggunakan API HTTP (fetch) bukan akses database langsung
 *
 * Fitur:
 * - TypeScript dengan tipe yang jelas (tidak menggunakan `any`)
 * - Pola delay yang realistis (distribusi Poisson untuk kedatangan)
 * - Mode dry-run untuk pengujian
 * - Indikator progres
 * - Parameter simulasi yang dapat dikonfigurasi
 */

// ============================================================================
// TIPE & INTERFACE
// ============================================================================

interface APIResponse<T = unknown> {
	ok: boolean;
	status: number;
	data: T;
}

interface QueueItem {
	id: string;
	queueId: string;
	queueNumber: string;
	name: string;
	statusId: string;
	metadata: Record<string, unknown> | null;
	createdAt: string;
	updatedAt: string;
}

interface Queue {
	id: string;
	name: string;
	templateId: string;
	createdBy: string | null;
	updatedBy: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface Batch {
	id: string;
	queueId: string;
	name: string;
	status: "active" | "closed";
	createdAt: string;
	updatedAt: string;
}

interface Status {
	id: string;
	queueId: string;
	templateStatusId: string | null;
	label: string;
	color: string;
	order: number;
	createdAt: string;
	updatedAt: string;
}

interface Board {
	queueId: string;
	queueName: string;
	templateId: string;
	hasActiveBatch: boolean;
	activeBatchId: string | null;
	batchName: string | null;
	statuses: Status[];
}

interface SuccessResponse<T> {
	success: true;
	data: T;
	total: number;
	message?: string;
}

interface ErrorResponse {
	success: false;
	error: string;
	data: [];
}

type SimulationResult<T> = SuccessResponse<T> | ErrorResponse;

interface SimulationConfig {
	apiBaseUrl: string;
	dryRun: boolean;
	verbose: boolean;
	randomSeed?: number;
}

// ============================================================================
// KONFIGURASI & UTILITIES
// ============================================================================

const config: SimulationConfig = {
	apiBaseUrl: process.env.API_URL || "http://localhost:3001",
	dryRun: process.env.DRY_RUN === "true",
	verbose: process.env.VERBOSE === "true",
	randomSeed: process.env.RANDOM_SEED
		? parseInt(process.env.RANDOM_SEED)
		: undefined,
};

/**
 * Generate random delay antara min dan max (distribusi seragam)
 */
function randomDelay(minMs: number, maxMs: number): number {
	if (config.randomSeed !== undefined) {
		// Gunakan random dengan seed untuk reproducibility
		const seed = config.randomSeed;
		const random = () => {
			const x = Math.sin(seed++) * 10000;
			return x - Math.floor(x);
		};
		return minMs + random() * (maxMs - minMs);
	}
	return minMs + Math.random() * (maxMs - minMs);
}

/**
 * Generate delay dengan distribusi Poisson (lebih realistis untuk kedatangan)
 * Menggunakan distribusi eksponensial (sifat tanpa memori dari proses Poisson)
 */
function poissonDelay(avgMs: number): number {
	const lambda = 1 / avgMs;
	const u = Math.random();
	return -Math.log(1 - u) / lambda;
}

/**
 * Generate delay dengan distribusi terbobot (weighted)
 * Pola umum: sebagian besar delay dekat rata-rata, ada yang lebih pendek, ada yang lebih panjang
 */
function weightedDelay(avgMs: number, variancePercent: number = 50): number {
	const variance = avgMs * (variancePercent / 100);
	// Transformasi Box-Muller untuk distribusi normal
	const u1 = Math.random();
	const u2 = Math.random();
	const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
	const result = avgMs + z * (variance / 2);
	return Math.max(100, result); // Minimum 100ms
}

/**
 * Format durasi dalam format yang mudah dibaca
 */
function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
	return `${(ms / 60000).toFixed(1)}min`;
}

// ============================================================================
// KLIEN HTTP API
// ============================================================================

/**
 * Buat request HTTP menggunakan built-in fetch
 */
async function fetchAPI<T = unknown>(
	endpoint: string,
	options: RequestInit = {},
): Promise<APIResponse<T>> {
	const url = `${config.apiBaseUrl}${endpoint}`;

	if (config.verbose) {
		console.log(`📡 ${options.method || "GET"} ${url}`);
	}

	try {
		const response = await fetch(url, {
			...options,
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
		});

		const data = (await response.json()) as T;

		if (config.verbose) {
			console.log(`📡 Response: ${response.status}`, data);
		}

		return {
			ok: response.ok,
			status: response.status,
			data,
		};
	} catch (error) {
		console.error(`❌ Request gagal ke ${url}:`, error);
		throw error;
	}
}

/**
 * Fetch dry-run (tidak membuat panggilan API yang sebenarnya)
 */
async function dryRunFetch<T = unknown>(
	endpoint: string,
	options: RequestInit = {},
): Promise<APIResponse<T>> {
	console.log(
		`🔍 [DRY RUN] ${options.method || "GET"} ${config.apiBaseUrl}${endpoint}`,
	);

	if (options.method === "POST" && options.body) {
		const body = JSON.parse(options.body as string);
		console.log(`   Payload:`, JSON.stringify(body, null, 2));
	}

	// Simulasi delay jaringan
	await new Promise((resolve) => setTimeout(resolve, 100));

	// Return respons sukses palsu
	return {
		ok: true,
		status: 200,
		data: {
			success: true,
			data: [] as T,
		} as T,
	};
}

// ============================================================================
// OPERASI QUEUE
// ============================================================================

/**
 * Dapatkan semua board antrian yang tersedia melalui HTTP API
 */
export async function getBoardsByList(): Promise<SimulationResult<Board[]>> {
	try {
		console.log(
			`📋 Mengambil daftar queue dari ${config.apiBaseUrl}/queues...\n`,
		);

		const fetchFn = config.dryRun ? dryRunFetch : fetchAPI;
		const result = await fetchAPI<{
			success: boolean;
			data: Queue[];
			total: number;
		}>("/queues");

		if (!result.ok || !result.data.success) {
			return {
				success: false,
				error:
					result.data.error || result.data.message || "Gagal mengambil queue",
				data: [],
			};
		}

		// Untuk setiap queue, dapatkan active batch dengan statuses
		const boards = await Promise.all(
			result.data.data.map(async (queue: Queue): Promise<Board> => {
				const batchResult = await fetchFn<{
					success: boolean;
					data: {
						batch: Batch;
						statuses: Status[];
					};
				}>(`/queues/${queue.id}/active-batch`);

				if (
					!batchResult.ok ||
					!batchResult.data.success ||
					!batchResult.data.data
				) {
					return {
						queueId: queue.id,
						queueName: queue.name,
						templateId: queue.templateId,
						hasActiveBatch: false,
						activeBatchId: null,
						batchName: null,
						statuses: [],
					};
				}

				const batch = batchResult.data.data.batch;
				const statuses = batchResult.data.data.statuses || [];

				return {
					queueId: queue.id,
					queueName: queue.name,
					templateId: queue.templateId,
					hasActiveBatch: true,
					activeBatchId: batch.id,
					batchName: batch.name,
					statuses: statuses.map((s: Status) => ({
						id: s.id,
						label: s.label,
						color: s.color,
						order: s.order,
					})),
				};
			}),
		);

		return {
			success: true,
			data: boards,
			total: boards.length,
		};
	} catch (error) {
		console.error("[getBoardsByList] Error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Error tidak diketahui",
			data: [],
		};
	}
}

/**
 * Simulasi antrian bank dengan delay yang dapat dikonfigurasi antar customer
 */
export async function simulateBankQueue(
	boardId: string,
	delayMs: number,
	customerCount: number = 10,
	delayPattern: "fixed" | "random" | "poisson" | "weighted" = "fixed",
	variancePercent: number = 50,
): Promise<SimulationResult<QueueItem[]>> {
	try {
		console.log(
			`\n${config.dryRun ? "🔍 [DRY RUN]" : "🏦"} Memulai Simulasi Antrian Bank...`,
		);
		console.log(`   ID Queue: ${boardId}`);
		console.log(`   Jumlah Customer: ${customerCount}`);
		console.log(`   Pola Delay: ${delayPattern}`);
		console.log(
			`   ${delayPattern === "fixed" ? `Delay: ${formatDuration(delayMs)}` : `Delay Rata-rata: ${formatDuration(delayMs)}`}`,
		);
		console.log(`   Variasi: ${variancePercent}%`);
		console.log(`   API: ${config.apiBaseUrl}\n`);

		const fetchFn = config.dryRun ? dryRunFetch : fetchAPI;

		// Dapatkan active batch dan statuses
		const batchResult = await fetchFn<{
			success: boolean;
			data: {
				batch: Batch;
				statuses: Status[];
			};
		}>(`/queues/${boardId}/active-batch`);

		if (
			!batchResult.ok ||
			!batchResult.data.success ||
			!batchResult.data.data
		) {
			return {
				success: false,
				error: `Tidak ada batch aktif untuk queue ${boardId}. Silakan buat batch aktif terlebih dah.`,
				data: [],
			};
		}

		const batch = batchResult.data.data.batch;
		const statuses = batchResult.data.data.statuses || [];

		if (statuses.length === 0) {
			return {
				success: false,
				error: `No statuses found for batch ${batch.id}. Cannot create queue items.`,
				data: [],
			};
		}

		// PERBAIKAN: queueItems.queueId references queueBatches.id, bukan queues.id
		// Jadi kita harus menggunakan batch.id (batch UUID), bukan batch.queueId (queue UUID)
		const batchQueueId = batch.id; // Batch ID untuk queue items

		if (statuses.length === 0) {
			return {
				success: false,
				error: `No statuses found for batch ${batch.id}. Cannot create queue items.`,
				data: [],
			};
		}

		const firstStatusId = statuses[0].id;
		const firstStatusLabel = statuses[0].label;

		// Daftar nama customer untuk simulasi
		const customerNames = [
			"Budi Santoso",
			"Siti Rahayu",
			"Ahmad Wijaya",
			"Dewi Lestari",
			"Agus Setiawan",
			"Rina Melati",
			"Dedi Kurniawan",
			"Maya Putri",
			"Indra Pratama",
			"Sarah Amalia",
			"Eko Prasetyo",
			"Lestari Ayu",
			"Hendra Gunawan",
			"Wulan Sari",
			"Rizky Firmansyah",
		];

		const createdItems: QueueItem[] = [];

		// Simulasi customer datang satu per satu
		for (let i = 1; i <= customerCount; i++) {
			const customerName = customerNames[(i - 1) % customerNames.length];
			const queueNumber = `A${String(i).padStart(3, "0")}`;

			// Hitung delay berdasarkan pola
			let actualDelay = delayMs;
			switch (delayPattern) {
				case "random":
					actualDelay = randomDelay(delayMs * 0.5, delayMs * 1.5);
					break;
				case "poisson":
					actualDelay = poissonDelay(delayMs);
					break;
				case "weighted":
					actualDelay = weightedDelay(delayMs, variancePercent);
					break;
				case "fixed":
				default:
					actualDelay = delayMs;
					break;
			}

			// Buat queue item melalui API
			const queueItemData = {
				queueId: boardId, // PERBAIKAN: Gunakan queue ID, bukan batch ID
				batchId: batchQueueId, // PERBAIKAN: Gunakan queue ID, bukan batch ID
				queueNumber: queueNumber,
				name: customerName,
				statusId: firstStatusId,
				metadata: {
					arrivalTime: new Date().toISOString(),
					customerType: "walk-in",
					serviceType: "general",
					delayUsed: actualDelay,
				},
			};

			const createResult = await fetchFn<{ success: boolean; data: QueueItem }>(
				"/queue-items",
				{
					method: "POST",
					body: JSON.stringify(queueItemData),
				},
			);

			if (!createResult.ok || !createResult.data.success) {
				console.error(
					`❌ Gagal membuat customer ${i}:`,
					createResult.data.error || createResult.data.message,
				);
				continue;
			}

			createdItems.push(createResult.data.data);
			const progressPercent = Math.round((i / customerCount) * 100);
			console.log(
				`✅ [${progressPercent}%] ${i}/${customerCount}: ${queueNumber} - ${customerName} [${firstStatusLabel}] (${formatDuration(actualDelay)})`,
			);

			// Tambahkan delay antar customer (tapi tidak setelah yang terakhir)
			if (i < customerCount && actualDelay > 0) {
				await new Promise((resolve) => setTimeout(resolve, actualDelay));
			}
		}

		console.log(
			`\n🎉 Simulasi selesai! ${createdItems.length} customer ditambahkan ke queue.\n`,
		);

		return {
			success: true,
			data: createdItems,
			total: createdItems.length,
			message: `${createdItems.length} customer berhasil disimulasikan untuk queue ${boardId}`,
		};
	} catch (error) {
		console.error("[simulateBankQueue] Error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Error tidak diketahui",
			data: [],
		};
	}
}

/**
 * Simulasi perubahan status - pindahkan queue item dari satu status ke status lain
 */
export async function simulateStatusProgression(
	boardId: string,
	fromStatusLabel: string,
	toStatusLabel: string,
	itemCount?: number,
	delay: number = 500,
	delayPattern: "fixed" | "random" | "weighted" = "fixed",
	variancePercent: number = 30,
): Promise<SimulationResult<QueueItem[]>> {
	try {
		console.log(
			`\n${config.dryRun ? "🔍 [DRY RUN]" : "🔄"} Memulai Simulasi Perubahan Status...`,
		);
		console.log(`   ID Queue: ${boardId}`);
		console.log(`   Dari status: ${fromStatusLabel}`);
		console.log(`   Ke status: ${toStatusLabel}`);
		console.log(`   Items: ${itemCount || "semua"}`);
		console.log(`   Delay: ${formatDuration(delay)}`);
		console.log(`   Pola Delay: ${delayPattern}`);
		console.log(`   API: ${config.apiBaseUrl}\n`);

		const fetchFn = config.dryRun ? dryRunFetch : fetchAPI;

		// Dapatkan active batch dan statuses
		const batchResult = await fetchFn<{
			success: boolean;
			data: {
				batch: Batch;
				statuses: Status[];
			};
		}>(`/queues/${boardId}/active-batch`);

		if (
			!batchResult.ok ||
			!batchResult.data.success ||
			!batchResult.data.data
		) {
			return {
				success: false,
				error: `Tidak ada batch aktif untuk queue ${boardId}.`,
				data: [],
			};
		}

		const batch = batchResult.data.data.batch;
		const statuses = batchResult.data.data.statuses || [];

		// Cari ID status dari dan ke
		const fromStatus = statuses.find(
			(s: Status) => s.label === fromStatusLabel,
		);
		const toStatus = statuses.find((s: Status) => s.label === toStatusLabel);

		if (!fromStatus) {
			return {
				success: false,
				error: `Status "${fromStatusLabel}" tidak ditemukan. Status tersedia: ${statuses.map((s: Status) => s.label).join(", ")}`,
				data: [],
			};
		}

		if (!toStatus) {
			return {
				success: false,
				error: `Status "${toStatusLabel}" tidak ditemukan. Status tersedia: ${statuses.map((s: Status) => s.label).join(", ")}`,
				data: [],
			};
		}

		// Dapatkan queue item di status asal
		const itemsResult = await fetchFn<{
			success: boolean;
			data: QueueItem[];
		}>(`/queue-items?queueId=${batch.id}&statusId=${fromStatus.id}`);

		if (!itemsResult.ok || !itemsResult.data.success) {
			return {
				success: false,
				error: `Gagal mengambil queue items: ${itemsResult.data.error || itemsResult.data.message}`,
				data: [],
			};
		}

		const itemsToMove = itemsResult.data.data || [];

		if (itemsToMove.length === 0) {
			console.log(
				`ℹ️  Tidak ada item di status "${fromStatusLabel}". Tidak ada yang dipindahkan.\n`,
			);
			return {
				success: true,
				data: [],
				total: 0,
				message: `Tidak ada item untuk dipindahkan dari ${fromStatusLabel} ke ${toStatusLabel}`,
			};
		}

		// Tentukan berapa item yang akan dipindahkan
		const itemsCount = itemCount
			? Math.min(itemCount, itemsToMove.length)
			: itemsToMove.length;
		const itemsToProcess = itemsToMove.slice(0, itemsCount);

		console.log(
			`Ditemukan ${itemsToMove.length} item di status "${fromStatusLabel}".`,
		);
		console.log(
			`Memindahkan ${itemsCount} item ke status "${toStatusLabel}"...\n`,
		);

		const updatedItems: QueueItem[] = [];

		// Update setiap item satu per satu dengan delay
		for (let i = 0; i < itemsToProcess.length; i++) {
			const item = itemsToProcess[i];

			// Hitung delay berdasarkan pola
			let actualDelay = delay;
			switch (delayPattern) {
				case "random":
					actualDelay = randomDelay(delay * 0.5, delay * 1.5);
					break;
				case "weighted":
					actualDelay = weightedDelay(delay, variancePercent);
					break;
				case "fixed":
				default:
					actualDelay = delay;
					break;
			}

			// Update status queue item melalui API
			const updateResult = await fetchFn<{ success: boolean; data: QueueItem }>(
				`/queue-items/${item.id}`,
				{
					method: "PUT",
					body: JSON.stringify({
						statusId: toStatus.id,
						metadata: {
							...item.metadata,
							statusUpdated: new Date().toISOString(),
							previousStatus: fromStatusLabel,
						},
					}),
				},
			);

			if (!updateResult.ok || !updateResult.data.success) {
				console.error(
					`❌ Gagal mengupdate ${item.queueNumber}:`,
					updateResult.data.error || updateResult.data.message,
				);
				continue;
			}

			updatedItems.push(updateResult.data.data);
			const progressPercent = Math.round(((i + 1) / itemsCount) * 100);
			console.log(
				`✅ [${progressPercent}%] ${i + 1}/${itemsCount}: ${item.queueNumber} - ${item.name} [${fromStatusLabel} → ${toStatusLabel}] (${formatDuration(actualDelay)})`,
			);

			// Tambahkan delay antar update (tapi tidak setelah yang terakhir)
			if (i < itemsToProcess.length - 1 && actualDelay > 0) {
				await new Promise((resolve) => setTimeout(resolve, actualDelay));
			}
		}

		console.log(
			`\n🎉 Perubahan status selesai! ${updatedItems.length} item dipindahkan.\n`,
		);

		return {
			success: true,
			data: updatedItems,
			total: updatedItems.length,
			message: `${updatedItems.length} item dipindahkan dari ${fromStatusLabel} ke ${toStatusLabel}`,
		};
	} catch (error) {
		console.error("[simulateStatusProgression] Error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Error tidak diketahui",
			data: [],
		};
	}
}

/**
 * Simulasi workflow lengkap - tambahkan customer dan pindahkan melalui semua statuses
 * Workflow ini otomatis mendapatkan statuses dari queue dan memindahkan items dari status awal sampai akhir
 */
export async function simulateFullWorkflow(
	boardId: string,
	customerCount: number = 5,
	addDelay: number = 1500,
	serveDelay: number = 3000,
	serveProgressDelay: number = 2000,
	delayPattern: "fixed" | "random" | "poisson" | "weighted" = "fixed",
	variancePercent: number = 30,
): Promise<
	SimulationResult<{
		added: QueueItem[];
		allMoved: QueueItem[][];
		statusProgression: string[];
	}>
> {
	try {
		console.log(
			`\n${config.dryRun ? "🔍 [DRY RUN]" : "🎬"} Memulai Simulasi Workflow Queue Lengkap...`,
		);
		console.log(`   ID Queue: ${boardId}`);
		console.log(`   Jumlah Customer: ${customerCount}`);
		console.log(`   Delay Tambah: ${formatDuration(addDelay)}`);
		console.log(`   Delay Mulai Melayani: ${formatDuration(serveDelay)}`);
		console.log(
			`   Delay Progres Melayani: ${formatDuration(serveProgressDelay)}`,
		);
		console.log(`   Pola Delay: ${delayPattern}\n`);

		const fetchFn = config.dryRun ? dryRunFetch : fetchAPI;

		// Dapatkan statuses dari queue untuk menentukan workflow
		const batchResult = await fetchFn<{
			success: boolean;
			data: {
				batch: Batch;
				statuses: Status[];
			};
		}>(`/queues/${boardId}/active-batch`);

		if (
			!batchResult.ok ||
			!batchResult.data.success ||
			!batchResult.data.data
		) {
			return {
				success: false,
				error: `Tidak ada batch aktif untuk queue ${boardId}.`,
				data: [],
			};
		}

		const statuses = batchResult.data.data.statuses || [];

		if (statuses.length === 0) {
			return {
				success: false,
				error: `Tidak ada status yang ditemukan untuk queue ${boardId}.`,
				data: [],
			};
		}

		// Sort statuses berdasarkan order field
		const sortedStatuses = [...statuses].sort((a, b) => a.order - b.order);
		const statusLabels = sortedStatuses.map((s) => s.label);

		console.log(`   Status Workflow: ${statusLabels.join(" → ")}\n`);

		// Langkah 1: Tambahkan customer
		console.log(`\n📍 Langkah 1: Menambahkan customer ke queue...`);
		const addResult = await simulateBankQueue(
			boardId,
			addDelay,
			customerCount,
			delayPattern,
			variancePercent,
		);

		if (!addResult.success) {
			return {
				success: false,
				error: addResult.error,
				data: [],
			};
		}

		// Langkah 2: Pindahkan items melalui semua statuses (dari status 1 ke 2, 2 ke 3, dst)
		console.log(`\n📍 Langkah 2: Memindahkan items melalui semua statuses...`);

		const allMovedItems: QueueItem[][] = [];

		// Tunggu sebelum mulai memindahkan
		await new Promise((resolve) => setTimeout(resolve, serveDelay));

		// Pindahkan items dari satu status ke status berikutnya secara berurutan
		for (let i = 0; i < sortedStatuses.length - 1; i++) {
			const fromStatus = sortedStatuses[i];
			const toStatus = sortedStatuses[i + 1];
			const stepNumber = i + 1;
			const totalSteps = sortedStatuses.length - 1;

			console.log(
				`\n   Step ${stepNumber}/${totalSteps}: ${fromStatus.label} → ${toStatus.label}`,
			);

			const progressResult = await simulateStatusProgression(
				boardId,
				fromStatus.label,
				toStatus.label,
				customerCount,
				serveProgressDelay,
				delayPattern,
				variancePercent,
			);

			if (!progressResult.success) {
				console.error(
					`   ❌ Gagal memindahkan dari ${fromStatus.label} ke ${toStatus.label}:`,
					progressResult.error,
				);
				continue;
			}

			allMovedItems.push(progressResult.data);

			// Tunggu sebelum memindahkan ke status berikutnya (kecuali ini step terakhir)
			if (i < sortedStatuses.length - 2) {
				await new Promise((resolve) => setTimeout(resolve, serveDelay));
			}
		}

		console.log(`\n🎊 Simulasi workflow lengkap selesai!\n`);

		return {
			success: true,
			data: {
				added: addResult.data,
				allMoved: allMovedItems,
				statusProgression: statusLabels,
			},
			total: customerCount,
			message: `Simulasi workflow selesai: ${customerCount} customer ditambahkan dan dipindahkan melalui ${sortedStatuses.length} statuses`,
		};
	} catch (error) {
		console.error("[simulateFullWorkflow] Error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Error tidak diketahui",
			data: [],
		};
	}
}

// ============================================================================
// ENTRY POINT CLI
// ============================================================================

interface CLICommand {
	name: string;
	description: string;
	handler: () => Promise<void>;
}

const commands: CLICommand[] = [
	{
		name: "list",
		description: "Tampilkan semua queue board yang tersedia",
		handler: async () => {
			console.log("📋 Queue Board yang Tersedia:\n");
			const result = await getBoardsByList();

			if (!result.success) {
				console.error("❌ Error:", result.error);
				process.exit(1);
			}

			if (result.data.length === 0) {
				console.log("Tidak ada queue aktif.");
				process.exit(0);
			}

			result.data.forEach((board: any, index: number) => {
				console.log(`${index + 1}. ${board.queueName} (${board.queueId})`);
				if (board.hasActiveBatch) {
					console.log(
						`   Batch Aktif: ${board.batchName} (${board.activeBatchId})`,
					);
					console.log(
						`   Status: ${board.statuses.map((s: any) => s.label).join(" → ")}`,
					);
				} else {
					console.log(
						"   ⚠️  Tidak ada batch aktif - silakan buat batch aktif terlebih dah",
					);
				}
				console.log("");
			});

			process.exit(0);
		},
	},
	{
		name: "simulate",
		description: "Tambah customer baru ke queue",
		handler: async () => {
			const args = process.argv.slice(3);
			const boardId = args[0];
			const delay = parseInt(args[1]) || 2000;
			const customerCount = parseInt(args[2]) || 10;
			const delayPattern =
				(args[3] as "fixed" | "random" | "poisson" | "weighted") || "fixed";
			const variancePercent = parseInt(args[4]) || 50;

			if (!boardId) {
				console.error("❌ Error: boardId diperlukan");
				console.log(
					"\nPenggunaan: npm run simulate simulate <boardId> [delay] [customers] [pattern] [variance]",
				);
				console.log(
					"Contoh: npm run simulate simulate queue-id-123 2000 10 random 50",
				);
				process.exit(1);
			}

			const result = await simulateBankQueue(
				boardId,
				delay,
				customerCount,
				delayPattern,
				variancePercent,
			);

			if (!result.success) {
				console.error("❌ Error:", result.error);
				process.exit(1);
			}

			process.exit(0);
		},
	},
	{
		name: "progress",
		description: "Pindahkan customer dari satu status ke status lain",
		handler: async () => {
			const args = process.argv.slice(3);
			const boardId = args[0];
			const fromStatusLabel = args[1];
			const toStatusLabel = args[2];
			const itemCount = parseInt(args[3]) || undefined;
			const delay = parseInt(args[4]) || 500;
			const delayPattern =
				(args[5] as "fixed" | "random" | "weighted") || "fixed";
			const variancePercent = parseInt(args[6]) || 30;

			if (!boardId || !fromStatusLabel || !toStatusLabel) {
				console.error(
					"❌ Error: boardId, fromStatusLabel, dan toStatusLabel diperlukan",
				);
				console.log(
					"\nPenggunaan: npm run simulate progress <boardId> <dari> <ke> [jumlah] [delay] [pattern] [variance]",
				);
				console.log(
					'Contoh: npm run simulate progress queue-id-123 "Menunggu" "Dilayani" 5 500 random 30',
				);
				process.exit(1);
			}

			const result = await simulateStatusProgression(
				boardId,
				fromStatusLabel,
				toStatusLabel,
				itemCount,
				delay,
				delayPattern,
				variancePercent,
			);

			if (!result.success) {
				console.error("❌ Error:", result.error);
				process.exit(1);
			}

			process.exit(0);
		},
	},
	{
		name: "workflow",
		description:
			"Simulasi lengkap: tambah customer dan pindahkan melalui semua statuses",
		handler: async () => {
			const args = process.argv.slice(3);
			const boardId = args[0];
			const customerCount = parseInt(args[1]) || 5;
			const addDelay = parseInt(args[2]) || 1500;
			const serveDelay = parseInt(args[3]) || 3000;
			const serveProgressDelay = parseInt(args[4]) || 2000;
			const delayPattern =
				(args[5] as "fixed" | "random" | "poisson" | "weighted") || "fixed";
			const variancePercent = parseInt(args[6]) || 30;

			if (!boardId) {
				console.error("❌ Error: boardId diperlukan");
				console.log(
					"\nPenggunaan: npm run simulate workflow <boardId> [customers] [addDelay] [serveDelay] [serveProgressDelay] [pattern] [variance]",
				);
				console.log(
					"Contoh: npm run simulate workflow queue-id-123 5 1500 3000 2000 random 30",
				);
				process.exit(1);
			}

			const result = await simulateFullWorkflow(
				boardId,
				customerCount,
				addDelay,
				serveDelay,
				serveProgressDelay,
				delayPattern,
				variancePercent,
			);

			if (!result.success) {
				console.error("❌ Error:", result.error);
				process.exit(1);
			}

			process.exit(0);
		},
	},
];

async function main() {
	const commandName = process.argv[2];

	if (!commandName) {
		showHelp();
		process.exit(0);
	}

	const command = commands.find(
		(c) => c.name === commandName || c.name === commandName.substring(0, 3),
	);

	if (!command) {
		console.error(`❌ Perintah tidak dikenal: ${commandName}`);
		showHelp();
		process.exit(1);
	}

	await command.handler();
}

function showHelp() {
	console.log(`
🏦 Script Simulasi Antrian Bank (Versi HTTP Ditingkatkan)

${config.dryRun ? "🔍 MODE DRY RUN - Tidak ada panggilan API yang sebenarnya\n" : ""}Penggunaan:
  npm run simulate <perintah> [opsi]

Perintah:
  list                                Tampilkan semua queue board yang tersedia
  simulate <id> [delay] [customers] [pattern] [variance]
                                      Tambah customer baru ke queue
  progress <id> <dari> <ke> [jumlah] [delay] [pattern] [variance]
                                      Pindahkan customer antar status
   workflow <id> [customers] [addDelay] [serveDelay] [serveProgressDelay] [pattern] [variance]
                                       Simulasi lengkap: tambah customer dan pindahkan melalui semua statuses

Contoh:
  # Tampilkan queue
  pnpm simulate list

  # Tambah 10 customer dengan delay 2 detik (tetap)
  pnpm simulate simulate queue-id-123 2000 10

  # Tambah customer dengan delay random (lebih realistis)
  pnpm simulate simulate queue-id-123 2000 10 random 50

  # Tambah customer dengan distribusi Poisson (paling realistis untuk kedatangan)
  pnpm simulate simulate queue-id-123 2000 10 poisson

  # Pindahkan 5 customer dari "Menunggu" ke "Dilayani" (delay tetap)
  pnpm simulate progress queue-id-123 "Menunggu" "Dilayani" 5 500

  # Pindahkan dengan delay random (layanan waktu bervariasi)
  pnpm simulate progress queue-id-123 "Menunggu" "Dilayani" 5 1000 random 30

  # Workflow lengkap dengan delay realistis
  pnpm simulate workflow queue-id-123 5 1500 3000 2000 random 30

Pola Delay:
  fixed       - Delay konstan (default, paling bisa diprediksi)
  random       - Distribusi random seragam (±50%)
  poisson      - Distribusi eksponensial (paling realistis untuk kedatangan)
  weighted     - Distribusi normal dengan variansi (paling realistis untuk waktu layanan)

Environment Variables:
  API_URL       URL API backend (default: http://localhost:3001)
  DRY_RUN       Mode dry-run (true/false)
  VERBOSE       Logging detail (true/false)
  RANDOM_SEED   Seed untuk random (untuk reproducibilitas)

Catatan:
  - Pastikan server backend berjalan sebelum menjalankan script ini
  - Script menggunakan API HTTP (bukan akses database langsung)
  - Semua perubahan terlihat real-time via SSE
  - Script ini 100% kompatibel dengan perintah lama

Parameter tambahan (opsional):
  pattern     - Pola delay (fixed, random, poisson, weighted)
  variance     - Persentase variansi untuk random/weighted (default: 50/30)
`);
}

// Jalankan jika dipanggil langsung
main().catch((error) => {
	console.error("Error fatal:", error);
	process.exit(1);
});

export { main };
