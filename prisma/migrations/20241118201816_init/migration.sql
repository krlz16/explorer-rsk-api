-- CreateTable
CREATE TABLE "address" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "is_native" BOOLEAN NOT NULL,
    "type" VARCHAR NOT NULL,
    "name" VARCHAR,

    CONSTRAINT "address_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "balance" (
    "id" BIGSERIAL NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "balance" VARCHAR NOT NULL,
    "block_number" INTEGER NOT NULL,
    "block_hash" VARCHAR(66) NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "created" BIGINT NOT NULL,

    CONSTRAINT "balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block" (
    "_id" UUID DEFAULT gen_random_uuid(),
    "number" INTEGER NOT NULL,
    "hash" VARCHAR(66),
    "parent_hash" VARCHAR(66) NOT NULL,
    "sha3_uncles" VARCHAR(66) NOT NULL,
    "logs_bloom" VARCHAR NOT NULL,
    "transactions_root" VARCHAR(66) NOT NULL,
    "state_root" VARCHAR(66) NOT NULL,
    "receipts_root" VARCHAR(66) NOT NULL,
    "miner" VARCHAR NOT NULL,
    "difficulty" VARCHAR NOT NULL,
    "total_difficulty" VARCHAR NOT NULL,
    "extra_data" VARCHAR NOT NULL,
    "size" INTEGER NOT NULL,
    "gas_limit" INTEGER NOT NULL,
    "gas_used" INTEGER NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "transactions" VARCHAR,
    "uncles" VARCHAR,
    "minimum_gas_price" VARCHAR NOT NULL,
    "bitcoin_merged_mining_header" VARCHAR NOT NULL,
    "bitcoin_merged_mining_coinbase_transaction" VARCHAR NOT NULL,
    "bitcoin_merged_mining_merkle_proof" VARCHAR NOT NULL,
    "hash_for_merged_mining" VARCHAR(66) NOT NULL,
    "paid_fees" VARCHAR NOT NULL,
    "cumulative_difficulty" VARCHAR NOT NULL,
    "received" BIGINT NOT NULL,

    CONSTRAINT "block_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "contract" (
    "address" VARCHAR(42) NOT NULL,
    "code" VARCHAR,
    "code_stored_at_block" INTEGER,
    "deployed_code" VARCHAR,
    "symbol" VARCHAR,
    "decimals" SMALLINT,

    CONSTRAINT "contract_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "contract_interface" (
    "interface" VARCHAR NOT NULL,
    "contract_address" VARCHAR(42) NOT NULL,

    CONSTRAINT "pk_contract_interface" PRIMARY KEY ("interface","contract_address")
);

-- CreateTable
CREATE TABLE "contract_method" (
    "method" VARCHAR NOT NULL,
    "contract_address" VARCHAR(42) NOT NULL,

    CONSTRAINT "pk_contract_method" PRIMARY KEY ("method","contract_address")
);

-- CreateTable
CREATE TABLE "contract_verification" (
    "_id" VARCHAR NOT NULL,
    "address" VARCHAR,
    "error" VARCHAR,
    "match" BOOLEAN,
    "request" VARCHAR,
    "result" VARCHAR,
    "timestamp" BIGINT,

    CONSTRAINT "contract_verification_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "event" (
    "event_id" VARCHAR NOT NULL,
    "abi" VARCHAR,
    "address" VARCHAR(42) NOT NULL,
    "args" VARCHAR,
    "topic0" VARCHAR,
    "topic1" VARCHAR,
    "topic2" VARCHAR,
    "topic3" VARCHAR,
    "block_hash" VARCHAR(66) NOT NULL,
    "block_number" INTEGER NOT NULL,
    "data" VARCHAR NOT NULL,
    "event" VARCHAR,
    "log_index" INTEGER NOT NULL,
    "signature" VARCHAR,
    "timestamp" BIGINT NOT NULL,
    "transaction_hash" VARCHAR(66) NOT NULL,
    "transaction_index" INTEGER NOT NULL,
    "tx_status" VARCHAR NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "internal_transaction" (
    "internal_tx_id" VARCHAR NOT NULL,
    "transaction_hash" VARCHAR(66) NOT NULL,
    "block_number" INTEGER NOT NULL,
    "block_hash" VARCHAR(66) NOT NULL,
    "transaction_position" INTEGER NOT NULL,
    "type" VARCHAR NOT NULL,
    "subtraces" INTEGER NOT NULL,
    "trace_address" VARCHAR,
    "result" VARCHAR,
    "index" INTEGER NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "datetime" TIMESTAMPTZ(6),
    "error" VARCHAR,
    "action" VARCHAR,

    CONSTRAINT "internal_transaction_pkey" PRIMARY KEY ("internal_tx_id")
);

-- CreateTable
CREATE TABLE "status" (
    "id" SERIAL NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "pending_blocks" INTEGER NOT NULL,
    "requesting_blocks" INTEGER NOT NULL,
    "node_down" BOOLEAN NOT NULL,

    CONSTRAINT "status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_address" (
    "address" VARCHAR(42) NOT NULL,
    "contract" VARCHAR(42) NOT NULL,
    "block_number" INTEGER NOT NULL,
    "block_hash" VARCHAR NOT NULL,
    "balance" VARCHAR,

    CONSTRAINT "pk_token_address" PRIMARY KEY ("address","contract","block_number")
);

-- CreateTable
CREATE TABLE "transaction" (
    "hash" VARCHAR(66) NOT NULL,
    "tx_id" VARCHAR NOT NULL,
    "type" VARCHAR,
    "tx_type" VARCHAR NOT NULL,
    "from" VARCHAR(42) NOT NULL,
    "to" VARCHAR(42),
    "block_number" INTEGER NOT NULL,
    "block_hash" VARCHAR(66) NOT NULL,
    "transaction_index" INTEGER NOT NULL,
    "nonce" INTEGER NOT NULL,
    "gas" INTEGER NOT NULL,
    "gas_price" VARCHAR NOT NULL,
    "value" VARCHAR NOT NULL,
    "input" VARCHAR,
    "v" VARCHAR,
    "r" VARCHAR,
    "s" VARCHAR,
    "timestamp" BIGINT NOT NULL,
    "datetime" TIMESTAMPTZ(6),
    "date" DATE,
    "gas_used" INTEGER,
    "receipt" VARCHAR NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "transaction_in_pool" (
    "hash" VARCHAR(66) NOT NULL,
    "pool_id" INTEGER NOT NULL,
    "block_hash" VARCHAR(66) NOT NULL,
    "from" VARCHAR(42) NOT NULL,
    "to" VARCHAR(42) NOT NULL,
    "block_number" INTEGER NOT NULL,
    "transaction_index" INTEGER NOT NULL,
    "nonce" INTEGER NOT NULL,
    "gas" INTEGER NOT NULL,
    "gas_price" VARCHAR NOT NULL,
    "value" VARCHAR NOT NULL,
    "input" VARCHAR NOT NULL,
    "status" VARCHAR NOT NULL,

    CONSTRAINT "pk_transaction_in_pool_hash_poolid" PRIMARY KEY ("hash","pool_id")
);

-- CreateTable
CREATE TABLE "transaction_pending" (
    "hash" VARCHAR(66) NOT NULL,
    "block_hash" VARCHAR(66) NOT NULL,
    "from" VARCHAR(42) NOT NULL,
    "to" VARCHAR(42) NOT NULL,
    "block_number" INTEGER NOT NULL,
    "transaction_index" INTEGER NOT NULL,
    "nonce" INTEGER NOT NULL,
    "gas" INTEGER NOT NULL,
    "gas_price" VARCHAR NOT NULL,
    "value" VARCHAR NOT NULL,
    "input" VARCHAR NOT NULL,
    "status" VARCHAR NOT NULL,
    "timestamp" VARCHAR NOT NULL DEFAULT (date_part('epoch'::text, now()))::character varying,

    CONSTRAINT "transaction_pending_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "tx_pool" (
    "id" SERIAL NOT NULL,
    "block_number" INTEGER NOT NULL,
    "pending" INTEGER NOT NULL,
    "queued" INTEGER NOT NULL,
    "txs" VARCHAR NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "datetime" TIMESTAMPTZ(6),

    CONSTRAINT "tx_pool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_result" (
    "_id" VARCHAR NOT NULL,
    "abi" VARCHAR,
    "address" VARCHAR,
    "match" BOOLEAN,
    "request" VARCHAR,
    "result" VARCHAR,
    "sources" VARCHAR,
    "timestamp" BIGINT,

    CONSTRAINT "verification_result_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "stats" (
    "block_number" INTEGER NOT NULL,
    "block_hash" VARCHAR NOT NULL,
    "active_accounts" INTEGER NOT NULL,
    "hashrate" VARCHAR NOT NULL,
    "circulating_supply" VARCHAR,
    "total_supply" INTEGER,
    "bridge_balance" VARCHAR,
    "locking_cap" VARCHAR,
    "timestamp" BIGINT NOT NULL,

    CONSTRAINT "stats_pkey" PRIMARY KEY ("block_number")
);

-- CreateTable
CREATE TABLE "block_trace" (
    "block_hash" VARCHAR(66) NOT NULL,
    "internal_tx_id" VARCHAR NOT NULL,

    CONSTRAINT "pk_block_trace" PRIMARY KEY ("block_hash","internal_tx_id")
);

-- CreateTable
CREATE TABLE "address_in_summary" (
    "address" VARCHAR(42) NOT NULL,
    "balance" VARCHAR,
    "block_number" INTEGER NOT NULL,
    "last_block_mined" INTEGER,

    CONSTRAINT "address_in_summary_pkey" PRIMARY KEY ("address","block_number")
);

-- CreateTable
CREATE TABLE "block_summary" (
    "block_number" INTEGER NOT NULL,
    "hash" VARCHAR NOT NULL,
    "timestamp" BIGINT NOT NULL,

    CONSTRAINT "block_summary_pkey" PRIMARY KEY ("block_number")
);

-- CreateTable
CREATE TABLE "event_in_summary" (
    "event_id" VARCHAR NOT NULL,
    "block_number" INTEGER NOT NULL,

    CONSTRAINT "event_in_summary_pkey" PRIMARY KEY ("event_id","block_number")
);

-- CreateTable
CREATE TABLE "internal_transaction_in_summary" (
    "internal_tx_id" VARCHAR NOT NULL,
    "block_number" INTEGER NOT NULL,

    CONSTRAINT "internal_transaction_in_summary_pkey" PRIMARY KEY ("internal_tx_id","block_number")
);

-- CreateTable
CREATE TABLE "suicide_in_summary" (
    "internal_tx_id" VARCHAR NOT NULL,
    "block_number" INTEGER NOT NULL,

    CONSTRAINT "suicide_in_summary_pkey" PRIMARY KEY ("internal_tx_id","block_number")
);

-- CreateTable
CREATE TABLE "token_address_in_summary" (
    "address" VARCHAR NOT NULL,
    "contract" VARCHAR NOT NULL,
    "block_number" INTEGER NOT NULL,

    CONSTRAINT "token_address_in_summary_pkey" PRIMARY KEY ("address","contract","block_number")
);

-- CreateTable
CREATE TABLE "transaction_in_summary" (
    "hash" VARCHAR NOT NULL,
    "block_number" INTEGER NOT NULL,

    CONSTRAINT "transaction_in_summary_pkey" PRIMARY KEY ("hash","block_number")
);

-- CreateTable
CREATE TABLE "total_supply" (
    "contract_address" VARCHAR(42) NOT NULL,
    "block_number" INTEGER NOT NULL,
    "total_supply" VARCHAR NOT NULL,

    CONSTRAINT "pk_total_supply" PRIMARY KEY ("contract_address","block_number")
);

-- CreateTable
CREATE TABLE "contract_verifier_solc_versions" (
    "id" VARCHAR NOT NULL,
    "builds" VARCHAR,
    "latest_release" VARCHAR,
    "releases" VARCHAR,

    CONSTRAINT "contract_verifier_solc_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "explorer_initial_config" (
    "id" VARCHAR NOT NULL,
    "native_contracts" VARCHAR,
    "net" VARCHAR,

    CONSTRAINT "explorer_initial_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "explorer_settings" (
    "id" VARCHAR NOT NULL,
    "hash" VARCHAR NOT NULL,

    CONSTRAINT "explorer_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_creation_tx" (
    "contract_address" VARCHAR NOT NULL,
    "timestamp" BIGINT,
    "tx" VARCHAR,

    CONSTRAINT "contract_creation_tx_pkey" PRIMARY KEY ("contract_address")
);

-- CreateTable
CREATE TABLE "address_in_event" (
    "event_id" VARCHAR NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "is_event_emitter_address" BOOLEAN NOT NULL,
    "event_signature" VARCHAR,

    CONSTRAINT "address_in_event_pkey" PRIMARY KEY ("event_id","address","is_event_emitter_address")
);

-- CreateTable
CREATE TABLE "address_latest_balance" (
    "address" VARCHAR(42) NOT NULL,
    "balance" VARCHAR NOT NULL,
    "block_number" INTEGER NOT NULL,

    CONSTRAINT "address_latest_balance_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "contract_destruction_tx" (
    "contract_address" VARCHAR NOT NULL,
    "timestamp" BIGINT,
    "tx" VARCHAR,

    CONSTRAINT "contract_destruction_tx_pkey" PRIMARY KEY ("contract_address")
);

-- CreateTable
CREATE TABLE "miner_address" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR(42) NOT NULL,
    "is_native" BOOLEAN NOT NULL,
    "type" VARCHAR NOT NULL,
    "name" VARCHAR,
    "balance" VARCHAR,
    "block_number" INTEGER,
    "last_block_mined" VARCHAR,
    "last_block_mined_number" INTEGER,

    CONSTRAINT "miner_address_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "address_in_itx" (
    "address" VARCHAR NOT NULL,
    "internal_tx_id" VARCHAR NOT NULL,
    "role" VARCHAR NOT NULL,

    CONSTRAINT "address_in_itx_pkey" PRIMARY KEY ("address","internal_tx_id","role")
);

-- CreateTable
CREATE TABLE "bo_gas_fee_daily_aggregated" (
    "date_1" DATE NOT NULL,
    "gas_fee" DECIMAL,

    CONSTRAINT "bo_gas_fee_daily_aggregated_pkey" PRIMARY KEY ("date_1")
);

-- CreateTable
CREATE TABLE "bo_new_addresses" (
    "address" TEXT NOT NULL,
    "first_transaction_date" DATE,

    CONSTRAINT "bo_new_addresses_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "bo_active_addresses_daily_aggregated" (
    "date_1" DATE NOT NULL,
    "active_addresses" INTEGER,

    CONSTRAINT "bo_active_addresses_daily_aggregated_pkey" PRIMARY KEY ("date_1")
);

-- CreateTable
CREATE TABLE "bo_number_transactions_daily_aggregated" (
    "date_1" DATE NOT NULL,
    "number_of_transactions" INTEGER,

    CONSTRAINT "bo_number_transactions_daily_aggregated_pkey" PRIMARY KEY ("date_1")
);

-- CreateIndex
CREATE INDEX "index_address_id" ON "address"("id");

-- CreateIndex
CREATE INDEX "index_address_name" ON "address"("name");

-- CreateIndex
CREATE INDEX "idx_balance_address" ON "balance"("address");

-- CreateIndex
CREATE INDEX "idx_balance_block_number" ON "balance"("block_number");

-- CreateIndex
CREATE INDEX "balance_block_hash_idx" ON "balance"("block_hash");

-- CreateIndex
CREATE UNIQUE INDEX "block_hash_key" ON "block"("hash");

-- CreateIndex
CREATE INDEX "block_miner_idx" ON "block"("miner");

-- CreateIndex
CREATE INDEX "block_hash_idx" ON "block"("hash");

-- CreateIndex
CREATE INDEX "block_received_idx" ON "block"("received");

-- CreateIndex
CREATE INDEX "contract_code_stored_at_block_idx" ON "contract"("code_stored_at_block");

-- CreateIndex
CREATE INDEX "idx_contract_symbol" ON "contract"("symbol");

-- CreateIndex
CREATE INDEX "idx_event_block_number" ON "event"("block_number");

-- CreateIndex
CREATE INDEX "idx_event_address" ON "event"("address");

-- CreateIndex
CREATE INDEX "idx_event_signature" ON "event"("signature");

-- CreateIndex
CREATE INDEX "event_block_hash_idx" ON "event"("block_hash");

-- CreateIndex
CREATE INDEX "event_transaction_hash_idx" ON "event"("transaction_hash");

-- CreateIndex
CREATE INDEX "event_topic0_idx" ON "event"("topic0");

-- CreateIndex
CREATE INDEX "event_topic1_idx" ON "event"("topic1");

-- CreateIndex
CREATE INDEX "event_topic2_idx" ON "event"("topic2");

-- CreateIndex
CREATE INDEX "event_topic3_idx" ON "event"("topic3");

-- CreateIndex
CREATE INDEX "idx_internal_transaction_block_hash" ON "internal_transaction"("block_hash");

-- CreateIndex
CREATE INDEX "idx_internal_transaction_block_number" ON "internal_transaction"("block_number");

-- CreateIndex
CREATE INDEX "idx_internal_transaction_transaction_hash" ON "internal_transaction"("transaction_hash");

-- CreateIndex
CREATE INDEX "idx_internal_transaction_datetime" ON "internal_transaction"("datetime");

-- CreateIndex
CREATE INDEX "token_address_address_idx" ON "token_address"("address");

-- CreateIndex
CREATE INDEX "token_address_block_hash_idx" ON "token_address"("block_hash");

-- CreateIndex
CREATE INDEX "token_address_block_number_idx" ON "token_address"("block_number");

-- CreateIndex
CREATE INDEX "idx_transaction_tx_id" ON "transaction"("tx_id");

-- CreateIndex
CREATE INDEX "idx_transaction_block_hash" ON "transaction"("block_hash");

-- CreateIndex
CREATE INDEX "idx_transaction_block_number" ON "transaction"("block_number");

-- CreateIndex
CREATE INDEX "idx_transaction_from" ON "transaction"("from");

-- CreateIndex
CREATE INDEX "idx_transaction_to" ON "transaction"("to");

-- CreateIndex
CREATE INDEX "idx_transaction_tx_type" ON "transaction"("tx_type");

-- CreateIndex
CREATE INDEX "transaction_transaction_index_idx" ON "transaction"("transaction_index");

-- CreateIndex
CREATE INDEX "transaction_timestamp_idx" ON "transaction"("timestamp");

-- CreateIndex
CREATE INDEX "idx_transaction_datetime" ON "transaction"("datetime");

-- CreateIndex
CREATE INDEX "idx_transaction_date" ON "transaction"("date");

-- CreateIndex
CREATE INDEX "tx_pool_timestamp_idx" ON "tx_pool"("timestamp");

-- CreateIndex
CREATE INDEX "idx_tx_pool_datetime" ON "tx_pool"("datetime");

-- CreateIndex
CREATE INDEX "stats_block_hash_idx" ON "stats"("block_hash");

-- CreateIndex
CREATE INDEX "block_trace_internal_tx_id_idx" ON "block_trace"("internal_tx_id");

-- CreateIndex
CREATE INDEX "address_in_summary_block_number_idx" ON "address_in_summary"("block_number");

-- CreateIndex
CREATE INDEX "address_in_summary_last_block_mined_idx" ON "address_in_summary"("last_block_mined");

-- CreateIndex
CREATE INDEX "idx_block_summary_hash" ON "block_summary"("hash");

-- CreateIndex
CREATE INDEX "event_in_summary_block_number_idx" ON "event_in_summary"("block_number");

-- CreateIndex
CREATE INDEX "internal_transaction_in_summary_block_number_idx" ON "internal_transaction_in_summary"("block_number");

-- CreateIndex
CREATE INDEX "token_address_in_summary_block_number_idx" ON "token_address_in_summary"("block_number");

-- CreateIndex
CREATE INDEX "transaction_in_summary_block_number_idx" ON "transaction_in_summary"("block_number");

-- CreateIndex
CREATE INDEX "idx_address_in_event_address" ON "address_in_event"("address");

-- CreateIndex
CREATE INDEX "idx_address_in_event_event_id" ON "address_in_event"("event_id");

-- CreateIndex
CREATE INDEX "address_in_event_event_signature_idx" ON "address_in_event"("event_signature");

-- CreateIndex
CREATE UNIQUE INDEX "miner_address_last_block_mined_number_key" ON "miner_address"("last_block_mined_number");

-- CreateIndex
CREATE INDEX "address_in_itx_internal_tx_id_idx" ON "address_in_itx"("internal_tx_id");

-- AddForeignKey
ALTER TABLE "balance" ADD CONSTRAINT "fk_balance_address" FOREIGN KEY ("address") REFERENCES "address"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "balance" ADD CONSTRAINT "fk_balance_block_hash" FOREIGN KEY ("block_hash") REFERENCES "block"("hash") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "balance" ADD CONSTRAINT "fk_balance_block_number" FOREIGN KEY ("block_number") REFERENCES "block"("number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "fk_contract_address" FOREIGN KEY ("address") REFERENCES "address"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "fk_contract_code_stored_at_block" FOREIGN KEY ("code_stored_at_block") REFERENCES "block"("number") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_interface" ADD CONSTRAINT "fk_contract_interface_contract_address" FOREIGN KEY ("contract_address") REFERENCES "contract"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contract_method" ADD CONSTRAINT "fk_contract_method_contract_address" FOREIGN KEY ("contract_address") REFERENCES "contract"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "fk_event_address" FOREIGN KEY ("address") REFERENCES "address"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "fk_event_block_hash" FOREIGN KEY ("block_hash") REFERENCES "block"("hash") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "fk_event_block_number" FOREIGN KEY ("block_number") REFERENCES "block"("number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "fk_event_transaction_hash" FOREIGN KEY ("transaction_hash") REFERENCES "transaction"("hash") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "internal_transaction" ADD CONSTRAINT "fk_internal_transaction_block_hash" FOREIGN KEY ("block_hash") REFERENCES "block"("hash") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "internal_transaction" ADD CONSTRAINT "fk_internal_transaction_block_number" FOREIGN KEY ("block_number") REFERENCES "block"("number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "internal_transaction" ADD CONSTRAINT "fk_internal_transaction_transaction_hash" FOREIGN KEY ("transaction_hash") REFERENCES "transaction"("hash") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "token_address" ADD CONSTRAINT "fk_token_address_address" FOREIGN KEY ("address") REFERENCES "address"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "token_address" ADD CONSTRAINT "fk_token_address_block_hash" FOREIGN KEY ("block_hash") REFERENCES "block"("hash") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "token_address" ADD CONSTRAINT "fk_token_address_block_number" FOREIGN KEY ("block_number") REFERENCES "block"("number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "token_address" ADD CONSTRAINT "fk_token_address_contract" FOREIGN KEY ("contract") REFERENCES "address"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "fk_transaction_block_hash" FOREIGN KEY ("block_hash") REFERENCES "block"("hash") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "fk_transaction_block_number" FOREIGN KEY ("block_number") REFERENCES "block"("number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "fk_transaction_from" FOREIGN KEY ("from") REFERENCES "address"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "fk_transaction_to" FOREIGN KEY ("to") REFERENCES "address"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction_in_pool" ADD CONSTRAINT "fk_transaction_in_pool_pool_id" FOREIGN KEY ("pool_id") REFERENCES "tx_pool"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stats" ADD CONSTRAINT "fk_stats_block_hash" FOREIGN KEY ("block_hash") REFERENCES "block"("hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stats" ADD CONSTRAINT "fk_stats_block_number" FOREIGN KEY ("block_number") REFERENCES "block"("number") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_trace" ADD CONSTRAINT "fk_block_trace_block_hash" FOREIGN KEY ("block_hash") REFERENCES "block"("hash") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "block_trace" ADD CONSTRAINT "fk_block_trace_internal_tx_id" FOREIGN KEY ("internal_tx_id") REFERENCES "internal_transaction"("internal_tx_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "address_in_summary" ADD CONSTRAINT "fk_address_in_summary_address" FOREIGN KEY ("address") REFERENCES "address"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "address_in_summary" ADD CONSTRAINT "address_in_summary_block_number_fkey" FOREIGN KEY ("block_number") REFERENCES "block_summary"("block_number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "address_in_summary" ADD CONSTRAINT "fk_address_in_summary_last_block_mined" FOREIGN KEY ("last_block_mined") REFERENCES "block"("number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "block_summary" ADD CONSTRAINT "block_summary_block_number_fkey" FOREIGN KEY ("block_number") REFERENCES "block"("number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "block_summary" ADD CONSTRAINT "fk_block_summary_hash" FOREIGN KEY ("hash") REFERENCES "block"("hash") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event_in_summary" ADD CONSTRAINT "event_in_summary_block_number_fkey" FOREIGN KEY ("block_number") REFERENCES "block_summary"("block_number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event_in_summary" ADD CONSTRAINT "fk_event_in_summary_event_id" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "internal_transaction_in_summary" ADD CONSTRAINT "internal_transaction_in_summary_block_number_fkey" FOREIGN KEY ("block_number") REFERENCES "block_summary"("block_number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "internal_transaction_in_summary" ADD CONSTRAINT "fk_internal_transaction_in_summary_internal_tx_id" FOREIGN KEY ("internal_tx_id") REFERENCES "internal_transaction"("internal_tx_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "suicide_in_summary" ADD CONSTRAINT "suicide_in_summary_block_number_fkey" FOREIGN KEY ("block_number") REFERENCES "block_summary"("block_number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "suicide_in_summary" ADD CONSTRAINT "fk_suicide_in_summary_internal_tx_id" FOREIGN KEY ("internal_tx_id") REFERENCES "internal_transaction"("internal_tx_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "token_address_in_summary" ADD CONSTRAINT "token_address_in_summary_address_contract_block_number_fkey" FOREIGN KEY ("address", "contract", "block_number") REFERENCES "token_address"("address", "contract", "block_number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "token_address_in_summary" ADD CONSTRAINT "token_address_in_summary_block_number_fkey" FOREIGN KEY ("block_number") REFERENCES "block_summary"("block_number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction_in_summary" ADD CONSTRAINT "transaction_in_summary_block_number_fkey" FOREIGN KEY ("block_number") REFERENCES "block_summary"("block_number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transaction_in_summary" ADD CONSTRAINT "fk_transaction_in_summary_hash" FOREIGN KEY ("hash") REFERENCES "transaction"("hash") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "total_supply" ADD CONSTRAINT "fk_total_supply_address" FOREIGN KEY ("contract_address") REFERENCES "contract"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "total_supply" ADD CONSTRAINT "fk_total_supply_number" FOREIGN KEY ("block_number") REFERENCES "block"("number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contract_creation_tx" ADD CONSTRAINT "fk_contract_creation_tx_contract_address" FOREIGN KEY ("contract_address") REFERENCES "contract"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "address_in_event" ADD CONSTRAINT "address_in_event_address_fkey" FOREIGN KEY ("address") REFERENCES "address"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "address_in_event" ADD CONSTRAINT "address_in_event_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "address_latest_balance" ADD CONSTRAINT "fk_balance_address" FOREIGN KEY ("address") REFERENCES "address"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "address_latest_balance" ADD CONSTRAINT "fk_balance_block_number" FOREIGN KEY ("block_number") REFERENCES "block"("number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contract_destruction_tx" ADD CONSTRAINT "fk_contract_destruction_tx_contract_address" FOREIGN KEY ("contract_address") REFERENCES "address"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "miner_address" ADD CONSTRAINT "miner_address_address_fkey" FOREIGN KEY ("address") REFERENCES "address"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "address_in_itx" ADD CONSTRAINT "address_in_itx_address_fkey" FOREIGN KEY ("address") REFERENCES "address"("address") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "address_in_itx" ADD CONSTRAINT "address_in_itx_internal_tx_id_fkey" FOREIGN KEY ("internal_tx_id") REFERENCES "internal_transaction"("internal_tx_id") ON DELETE CASCADE ON UPDATE NO ACTION;
