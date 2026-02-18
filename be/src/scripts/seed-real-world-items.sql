-- Insert sample queue items for real-world queues
-- All UUIDs are UUID v7 format with timestamp prefix

-- Get first status for each batch
DO $$
DECLARE
  waiting_status UUID;
  batch_id UUID;
BEGIN
  -- Restaurant A
  SELECT id INTO waiting_status FROM queue_statuses WHERE queue_id = '019c6bd5-cbf7-768c-8c01-bf42c5ba88f2' ORDER BY "order" LIMIT 1;
  INSERT INTO queue_items (id, queue_id, batch_id, queue_number, name, status_id, metadata, created_at, updated_at)
  VALUES
    ('019c6bd7-1234-5678-90ab-cdef12345678', '019c6bd5-cbf2-7471-a6d8-a3e3e79922cb', '019c6bd5-cbf7-768c-8c01-bf42c5ba88f2', 'R001', 'Budi Santoso', waiting_status, '{"partySize": 4, "phone": "081234567890"}', NOW(), NOW()),
    ('019c6bd7-1234-5678-90ab-cdef12345679', '019c6bd5-cbf2-7471-a6d8-a3e3e79922cb', '019c6bd5-cbf7-768c-8c01-bf42c5ba88f2', 'R002', 'Siti Rahayu', waiting_status, '{"partySize": 2, "table": "A1"}', NOW(), NOW()),
    ('019c6bd7-1234-5678-90ab-cdef1234567a', '019c6bd5-cbf2-7471-a6d8-a3e3e79922cb', '019c6bd5-cbf7-768c-8c01-bf42c5ba88f2', 'R003', 'Ahmad Wijaya', waiting_status, '{"partySize": 6, "table": "B1"}', NOW(), NOW());

  -- RS Harapan
  SELECT id INTO waiting_status FROM queue_statuses WHERE queue_id = '019c6bd5-cbf7-768c-8c01-c5d9a3da3f70' ORDER BY "order" LIMIT 1;
  INSERT INTO queue_items (id, queue_id, batch_id, queue_number, name, status_id, metadata, created_at, updated_at)
  VALUES
    ('019c6bd7-2234-5678-90ab-cdef12345678', '019c6bd5-cbf2-7471-a6d8-a82c495448fb', '019c6bd5-cbf7-768c-8c01-c5d9a3da3f70', 'E001', 'John Doe', waiting_status, '{"age": 45, "symptoms": "Chest pain", "priority": "high"}', NOW(), NOW()),
    ('019c6bd7-2234-5678-90ab-cdef12345679', '019c6bd5-cbf2-7471-a6d8-a82c495448fb', '019c6bd5-cbf7-768c-8c01-c5d9a3da3f70', 'E002', 'Jane Smith', waiting_status, '{"age": 32, "symptoms": "Fever", "priority": "medium"}', NOW(), NOW()),
    ('019c6bd7-2234-5678-90ab-cdef1234567a', '019c6bd5-cbf2-7471-a6d8-a82c495448fb', '019c6bd5-cbf7-768c-8c01-c5d9a3da3f70', 'E003', 'Michael Brown', waiting_status, '{"age": 58, "symptoms": "Head injury", "priority": "critical"}', NOW(), NOW());

  -- BCA Branch
  SELECT id INTO waiting_status FROM queue_statuses WHERE queue_id = '019c6bd5-cbf8-742f-a358-49b3148f1b4d' ORDER BY "order" LIMIT 1;
  INSERT INTO queue_items (id, queue_id, batch_id, queue_number, name, status_id, metadata, created_at, updated_at)
  VALUES
    ('019c6bd7-3234-5678-90ab-cdef12345678', '019c6bd5-cbf2-7471-a6d8-bae2c09fd616', '019c6bd5-cbf8-742f-a358-49b3148f1b4d', 'B001', 'Hendra Wijaya', waiting_status, '{"service": "Withdrawal", "amount": 5000000}', NOW(), NOW()),
    ('019c6bd7-3234-5678-90ab-cdef12345679', '019c6bd5-cbf2-7471-a6d8-bae2c09fd616', '019c6bd5-cbf8-742f-a358-49b3148f1b4d', 'B002', 'Maya Sari', waiting_status, '{"service": "Deposit", "amount": 10000000}', NOW(), NOW()),
    ('019c6bd7-3234-5678-90ab-cdef1234567a', '019c6bd5-cbf2-7471-a6d8-bae2c09fd616', '019c6bd5-cbf8-742f-a358-49b3148f1b4d', 'B003', 'Rizky Pratama', waiting_status, '{"service": "Transfer", "amount": 2500000}', NOW(), NOW());

  -- Customer Support - Priority
  SELECT id INTO waiting_status FROM queue_statuses WHERE queue_id = '019c6bd5-cbf8-742f-a358-432397e18896' ORDER BY "order" LIMIT 1;
  INSERT INTO queue_items (id, queue_id, batch_id, queue_number, name, status_id, metadata, created_at, updated_at)
  VALUES
    ('019c6bd7-4234-5678-90ab-cdef12345678', '019c6bd5-cbf2-7471-a6d8-b1fe7206f3f9', '019c6bd5-cbf8-742f-a358-432397e18896', 'CS001', 'Bambang Sutrisno', waiting_status, '{"issue": "Account access", "priority": "high"}', NOW(), NOW()),
    ('019c6bd7-4234-5678-90ab-cdef12345679', '019c6bd5-cbf2-7471-a6d8-b1fe7206f3f9', '019c6bd5-cbf8-742f-a358-432397e18896', 'CS002', 'Rina Kusuma', waiting_status, '{"issue": "Payment failed", "priority": "high", "agent": "Agent A"}', NOW(), NOW());

  -- Tech Conference
  SELECT id INTO waiting_status FROM queue_statuses WHERE queue_id = '019c6bd5-cbf8-742f-a358-5ac8f6cd3f90' ORDER BY "order" LIMIT 1;
  INSERT INTO queue_items (id, queue_id, batch_id, queue_number, name, status_id, metadata, created_at, updated_at)
  VALUES
    ('019c6bd7-5234-5678-90ab-cdef12345678', '019c6bd5-cbf2-7471-a6d8-ca7b12433bcc', '019c6bd5-cbf8-742f-a358-5ac8f6cd3f90', 'T001', 'Elon Musk', waiting_status, '{"ticketType": "VIP", "company": "Tesla"}', NOW(), NOW()),
    ('019c6bd7-5234-5678-90ab-cdef12345679', '019c6bd5-cbf2-7471-a6d8-ca7b12433bcc', '019c6bd5-cbf8-742f-a358-5ac8f6cd3f90', 'T002', 'Mark Zuckerberg', waiting_status, '{"ticketType": "Regular", "company": "Meta"}', NOW(), NOW()),
    ('019c6bd7-5234-5678-90ab-cdef1234567a', '019c6bd5-cbf2-7471-a6d8-ca7b12433bcc', '019c6bd5-cbf8-742f-a358-5ac8f6cd3f90', 'T003', 'Satya Nadella', waiting_status, '{"ticketType": "VIP", "company": "Microsoft"}', NOW(), NOW());

END $$;
