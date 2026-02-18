import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { db } from "../db/index.js";
import {
	queueBatches,
	queueStatuses,
	queues,
	queueTemplateStatuses,
	queueTemplates,
} from "../db/schema.js";

async function seedRealWorldTemplates() {
	console.log("🌱 Seeding real-world queue templates...");

	// ============================================================================
	// 1. RESTAURANT WAITLIST
	// ============================================================================
	const restaurantTemplateId = uuidv7();
	const restaurantTemplateStatuses = [
		{
			id: uuidv7(),
			templateId: restaurantTemplateId,
			label: "Waiting",
			color: "#F59E0B", // Amber
			order: 1,
		},
		{
			id: uuidv7(),
			templateId: restaurantTemplateId,
			label: "Seated",
			color: "#3B82F6", // Blue
			order: 2,
		},
		{
			id: uuidv7(),
			templateId: restaurantTemplateId,
			label: "Ordering",
			color: "#8B5CF6", // Purple
			order: 3,
		},
		{
			id: uuidv7(),
			templateId: restaurantTemplateId,
			label: "Eating",
			color: "#10B981", // Green
			order: 4,
		},
		{
			id: uuidv7(),
			templateId: restaurantTemplateId,
			label: "Paid",
			color: "#EC4899", // Pink
			order: 5,
		},
		{
			id: uuidv7(),
			templateId: restaurantTemplateId,
			label: "Completed",
			color: "#6B7280", // Gray
			order: 6,
		},
	];

	await db.insert(queueTemplates).values({
		id: restaurantTemplateId,
		name: "Restaurant Waitlist",
		description: "Template for restaurant customer waitlist management",
		isSystemTemplate: false,
		isActive: true,
	});
	await db.insert(queueTemplateStatuses).values(restaurantTemplateStatuses);
	console.log("✅ Restaurant Waitlist template created");

	// ============================================================================
	// 2. HOSPITAL EMERGENCY / TRIAGE
	// ============================================================================
	const hospitalTemplateId = uuidv7();
	const hospitalTemplateStatuses = [
		{
			id: uuidv7(),
			templateId: hospitalTemplateId,
			label: "Registration",
			color: "#F59E0B", // Amber
			order: 1,
		},
		{
			id: uuidv7(),
			templateId: hospitalTemplateId,
			label: "Triage",
			color: "#EF4444", // Red
			order: 2,
		},
		{
			id: uuidv7(),
			templateId: hospitalTemplateId,
			label: "Waiting",
			color: "#FCD34D", // Yellow
			order: 3,
		},
		{
			id: uuidv7(),
			templateId: hospitalTemplateId,
			label: "In Treatment",
			color: "#3B82F6", // Blue
			order: 4,
		},
		{
			id: uuidv7(),
			templateId: hospitalTemplateId,
			label: "Discharged",
			color: "#10B981", // Green
			order: 5,
		},
		{
			id: uuidv7(),
			templateId: hospitalTemplateId,
			label: "Admitted",
			color: "#8B5CF6", // Purple
			order: 6,
		},
	];

	await db.insert(queueTemplates).values({
		id: hospitalTemplateId,
		name: "Hospital Emergency",
		description: "Template for hospital emergency and triage management",
		isSystemTemplate: false,
		isActive: true,
	});
	await db.insert(queueTemplateStatuses).values(hospitalTemplateStatuses);
	console.log("✅ Hospital Emergency template created");

	// ============================================================================
	// 3. PHARMACY
	// ============================================================================
	const pharmacyTemplateId = uuidv7();
	const pharmacyTemplateStatuses = [
		{
			id: uuidv7(),
			templateId: pharmacyTemplateId,
			label: "Waiting",
			color: "#F59E0B", // Amber
			order: 1,
		},
		{
			id: uuidv7(),
			templateId: pharmacyTemplateId,
			label: "Prescription Review",
			color: "#3B82F6", // Blue
			order: 2,
		},
		{
			id: uuidv7(),
			templateId: pharmacyTemplateId,
			label: "Preparing",
			color: "#8B5CF6", // Purple
			order: 3,
		},
		{
			id: uuidv7(),
			templateId: pharmacyTemplateId,
			label: "Ready for Pickup",
			color: "#10B981", // Green
			order: 4,
		},
		{
			id: uuidv7(),
			templateId: pharmacyTemplateId,
			label: "Completed",
			color: "#6B7280", // Gray
			order: 5,
		},
	];

	await db.insert(queueTemplates).values({
		id: pharmacyTemplateId,
		name: "Pharmacy",
		description: "Template for pharmacy prescription management",
		isSystemTemplate: false,
		isActive: true,
	});
	await db.insert(queueTemplateStatuses).values(pharmacyTemplateStatuses);
	console.log("✅ Pharmacy template created");

	// ============================================================================
	// 4. CUSTOMER SERVICE
	// ============================================================================
	const csTemplateId = uuidv7();
	const csTemplateStatuses = [
		{
			id: uuidv7(),
			templateId: csTemplateId,
			label: "Waiting",
			color: "#F59E0B", // Amber
			order: 1,
		},
		{
			id: uuidv7(),
			templateId: csTemplateId,
			label: "Assigned",
			color: "#3B82F6", // Blue
			order: 2,
		},
		{
			id: uuidv7(),
			templateId: csTemplateId,
			label: "In Progress",
			color: "#8B5CF6", // Purple
			order: 3,
		},
		{
			id: uuidv7(),
			templateId: csTemplateId,
			label: "Escalated",
			color: "#EF4444", // Red
			order: 4,
		},
		{
			id: uuidv7(),
			templateId: csTemplateId,
			label: "Resolved",
			color: "#10B981", // Green
			order: 5,
		},
		{
			id: uuidv7(),
			templateId: csTemplateId,
			label: "Closed",
			color: "#6B7280", // Gray
			order: 6,
		},
	];

	await db.insert(queueTemplates).values({
		id: csTemplateId,
		name: "Customer Service",
		description: "Template for customer service ticket management",
		isSystemTemplate: false,
		isActive: true,
	});
	await db.insert(queueTemplateStatuses).values(csTemplateStatuses);
	console.log("✅ Customer Service template created");

	// ============================================================================
	// 5. BANK TELLER
	// ============================================================================
	const bankTemplateId = uuidv7();
	const bankTemplateStatuses = [
		{
			id: uuidv7(),
			templateId: bankTemplateId,
			label: "Waiting",
			color: "#F59E0B", // Amber
			order: 1,
		},
		{
			id: uuidv7(),
			templateId: bankTemplateId,
			label: "Called",
			color: "#3B82F6", // Blue
			order: 2,
		},
		{
			id: uuidv7(),
			templateId: bankTemplateId,
			label: "In Service",
			color: "#8B5CF6", // Purple
			order: 3,
		},
		{
			id: uuidv7(),
			templateId: bankTemplateId,
			label: "Completed",
			color: "#10B981", // Green
			order: 4,
		},
	];

	await db.insert(queueTemplates).values({
		id: bankTemplateId,
		name: "Bank Teller",
		description: "Template for bank teller queue management",
		isSystemTemplate: false,
		isActive: true,
	});
	await db.insert(queueTemplateStatuses).values(bankTemplateStatuses);
	console.log("✅ Bank Teller template created");

	// ============================================================================
	// 6. GOVERNMENT SERVICES (KTP/Paspor/Layanan Publik)
	// ============================================================================
	const govTemplateId = uuidv7();
	const govTemplateStatuses = [
		{
			id: uuidv7(),
			templateId: govTemplateId,
			label: "Waiting",
			color: "#F59E0B", // Amber
			order: 1,
		},
		{
			id: uuidv7(),
			templateId: govTemplateId,
			label: "Document Review",
			color: "#3B82F6", // Blue
			order: 2,
		},
		{
			id: uuidv7(),
			templateId: govTemplateId,
			label: "Processing",
			color: "#8B5CF6", // Purple
			order: 3,
		},
		{
			id: uuidv7(),
			templateId: govTemplateId,
			label: "Under Review",
			color: "#FCD34D", // Yellow
			order: 4,
		},
		{
			id: uuidv7(),
			templateId: govTemplateId,
			label: "Ready for Pickup",
			color: "#10B981", // Green
			order: 5,
		},
		{
			id: uuidv7(),
			templateId: govTemplateId,
			label: "Completed",
			color: "#6B7280", // Gray
			order: 6,
		},
	];

	await db.insert(queueTemplates).values({
		id: govTemplateId,
		name: "Government Services",
		description: "Template for government service queue (KTP, Paspor, dll)",
		isSystemTemplate: false,
		isActive: true,
	});
	await db.insert(queueTemplateStatuses).values(govTemplateStatuses);
	console.log("✅ Government Services template created");

	// ============================================================================
	// 7. SCHOOL REGISTRATION
	// ============================================================================
	const schoolTemplateId = uuidv7();
	const schoolTemplateStatuses = [
		{
			id: uuidv7(),
			templateId: schoolTemplateId,
			label: "Waiting",
			color: "#F59E0B", // Amber
			order: 1,
		},
		{
			id: uuidv7(),
			templateId: schoolTemplateId,
			label: "Document Check",
			color: "#3B82F6", // Blue
			order: 2,
		},
		{
			id: uuidv7(),
			templateId: schoolTemplateId,
			label: "Interview",
			color: "#8B5CF6", // Purple
			order: 3,
		},
		{
			id: uuidv7(),
			templateId: schoolTemplateId,
			label: "Under Review",
			color: "#FCD34D", // Yellow
			order: 4,
		},
		{
			id: uuidv7(),
			templateId: schoolTemplateId,
			label: "Accepted",
			color: "#10B981", // Green
			order: 5,
		},
		{
			id: uuidv7(),
			templateId: schoolTemplateId,
			label: "Rejected",
			color: "#EF4444", // Red
			order: 6,
		},
	];

	await db.insert(queueTemplates).values({
		id: schoolTemplateId,
		name: "School Registration",
		description: "Template for school registration and enrollment",
		isSystemTemplate: false,
		isActive: true,
	});
	await db.insert(queueTemplateStatuses).values(schoolTemplateStatuses);
	console.log("✅ School Registration template created");

	// ============================================================================
	// 8. EVENT CHECK-IN
	// ============================================================================
	const eventTemplateId = uuidv7();
	const eventTemplateStatuses = [
		{
			id: uuidv7(),
			templateId: eventTemplateId,
			label: "Waiting",
			color: "#F59E0B", // Amber
			order: 1,
		},
		{
			id: uuidv7(),
			templateId: eventTemplateId,
			label: "Checking In",
			color: "#3B82F6", // Blue
			order: 2,
		},
		{
			id: uuidv7(),
			templateId: eventTemplateId,
			label: "Checked In",
			color: "#10B981", // Green
			order: 3,
		},
	];

	await db.insert(queueTemplates).values({
		id: eventTemplateId,
		name: "Event Check-in",
		description: "Template for event check-in and attendance management",
		isSystemTemplate: false,
		isActive: true,
	});
	await db.insert(queueTemplateStatuses).values(eventTemplateStatuses);
	console.log("✅ Event Check-in template created");

	console.log("\n📝 Creating queues from templates...\n");

	// ============================================================================
	// CREATE QUEUES FROM TEMPLATES
	// ============================================================================

	const queuesToCreate = [
		{
			id: uuidv7(),
			templateId: restaurantTemplateId,
			name: "Restaurant A - Main Floor",
		},
		{
			id: uuidv7(),
			templateId: restaurantTemplateId,
			name: "Restaurant B - Outdoor",
		},
		{
			id: uuidv7(),
			templateId: hospitalTemplateId,
			name: "RS Harapan - Emergency",
		},
		{
			id: uuidv7(),
			templateId: pharmacyTemplateId,
			name: "Apotek Sehat - Main",
		},
		{
			id: uuidv7(),
			templateId: csTemplateId,
			name: "Customer Support - Priority",
		},
		{
			id: uuidv7(),
			templateId: csTemplateId,
			name: "Customer Support - Regular",
		},
		{
			id: uuidv7(),
			templateId: bankTemplateId,
			name: "BCA Branch Jakarta - Teller",
		},
		{
			id: uuidv7(),
			templateId: govTemplateId,
			name: "Kecamatan Tebet - Layanan KTP",
		},
		{
			id: uuidv7(),
			templateId: govTemplateId,
			name: "Kantor Imigrasi - Paspor",
		},
		{
			id: uuidv7(),
			templateId: schoolTemplateId,
			name: "SMA Negeri 1 - PPDB 2026",
		},
		{
			id: uuidv7(),
			templateId: eventTemplateId,
			name: "Tech Conference 2026 - Check-in",
		},
	];

	await db.insert(queues).values(
		queuesToCreate.map((q) => ({
			...q,
			isActive: true,
		})),
	);
	console.log(`✅ Created ${queuesToCreate.length} queues from templates`);

	// ============================================================================
	// CREATE ACTIVE BATCHES FOR ALL QUEUES
	// ============================================================================

	console.log("\n📦 Creating active batches for queues...\n");

	const batches = await Promise.all(
		queuesToCreate.map(async (queue) => {
			const batchId = uuidv7();
			const batchName = `${queue.name} - Batch ${new Date().toISOString().split("T")[0]}`;

			// Create batch
			await db.insert(queueBatches).values({
				id: batchId,
				templateId: queue.templateId,
				queueId: queue.id,
				name: batchName,
				status: "active",
			});

			// Get template statuses for this queue
			const templateStatuses = await db
				.select()
				.from(queueTemplateStatuses)
				.where(eq(queueTemplateStatuses.templateId, queue.templateId))
				.orderBy(queueTemplateStatuses.order);

			// Create batch statuses from template
			const batchStatuses = templateStatuses.map((ts) => ({
				id: uuidv7(),
				queueId: batchId,
				templateStatusId: ts.id,
				label: ts.label,
				color: ts.color,
				order: ts.order,
			}));

			if (batchStatuses.length > 0) {
				await db.insert(queueStatuses).values(batchStatuses);
			}

			return {
				queueId: queue.id,
				queueName: queue.name,
				batchId,
				batchName,
				statusCount: batchStatuses.length,
			};
		}),
	);

	batches.forEach((b) => {
		console.log(`  ✓ ${b.queueName}`);
		console.log(`    - Batch: ${b.batchId}`);
		console.log(`    - Statuses: ${b.statusCount}\n`);
	});

	console.log("🎉 Real-world templates and queues seeded successfully!");
}

seedRealWorldTemplates().catch((error) => {
	console.error("❌ Seeding failed:", error);
	process.exit(1);
});
