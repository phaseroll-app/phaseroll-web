# PhaseRoll Database Schema

This document explains the PostgreSQL tables defined in [`db/schema.sql`](../db/schema.sql), how they relate to one another, and where different kinds of PhaseRoll data are stored.

The schema is additive to Better Auth. Better Auth owns the existing `user`, `session`, `account`, and `verification` tables. PhaseRoll does not recreate or alter those tables. Product tables reference `user.id`, which is a `text` primary key.

## Table of Contents

- [Shared conventions](#shared-conventions)
- [Identity and devices](#identity-and-devices)
  - [profile](#profile)
  - [device](#device)
- [Storage and media](#storage-and-media)
  - [gcs_object](#gcs_object)
  - [media_asset](#media_asset)
  - [asset_copy](#asset_copy)
  - [recovery_manifest](#recovery_manifest)
- [Phases and memories](#phases-and-memories)
  - [phase](#phase)
  - [phase_member](#phase_member)
  - [phase_invite](#phase_invite)
  - [phase_entry](#phase_entry)
  - [phase_entry_media](#phase_entry_media)
  - [behind_memory](#behind_memory)
  - [journal_entry](#journal_entry)
  - [journal_turn](#journal_turn)
  - [milestone](#milestone)
- [Roll Call](#roll-call)
  - [roll_call](#roll_call)
  - [roll_call_member](#roll_call_member)
  - [roll_call_invite](#roll_call_invite)
  - [roll_call_contribution](#roll_call_contribution)
  - [roll_call_contribution_asset](#roll_call_contribution_asset)
- [Future Capsules](#future-capsules)
  - [future_capsule](#future_capsule)
  - [capsule_recipient](#capsule_recipient)
  - [capsule_item](#capsule_item)
- [Search and generation](#search-and-generation)
  - [embedding_model](#embedding_model)
  - [search_document](#search_document)
  - [search_embedding](#search_embedding)
  - [generation_job](#generation_job)
  - [phase_recap](#phase_recap)
  - [memory_book](#memory_book)
  - [memory_book_phase](#memory_book_phase)
- [Billing and access](#billing-and-access)
  - [plan](#plan)
  - [plan_feature](#plan_feature)
  - [subscription](#subscription)
  - [purchase](#purchase)
  - [entitlement](#entitlement)
  - [usage_event](#usage_event)
- [Sync and operations](#sync-and-operations)
  - [client_mutation](#client_mutation)
  - [sync_change](#sync_change)
  - [outbox_event](#outbox_event)
  - [deletion_request](#deletion_request)

## Shared Conventions

### Identifiers

PhaseRoll product records use UUID primary keys. Mobile clients should generate UUIDv7 identifiers so records can be created offline and synchronized later. `gen_random_uuid()` remains as a server-side fallback for background jobs and administrative writes.

Better Auth user identifiers are text values. Every user ownership or membership foreign key therefore uses `text REFERENCES public."user"(id)`.

### Timestamps

Most mutable tables contain `created_at` and `updated_at`. The `set_updated_at` trigger refreshes `updated_at` whenever a row changes.

User-facing dates are normally stored in two forms:

- A `timestamptz` value records the absolute point in time.
- A local date, time-zone name, or UTC offset preserves how the user experienced that time.

### Soft Deletion

User-owned records generally contain `deleted_at` and `purge_after`. Setting `deleted_at` schedules the row for permanent deletion no earlier than 30 days later. Clearing `deleted_at` also clears `purge_after`, allowing restoration during the retention window.

The application must still run a deletion worker. The trigger calculates the retention deadline but does not physically remove rows or delete associated GCS objects.

### Media Storage

PostgreSQL stores canonical metadata and searchable text, not personal photo or video bytes.

- Personal media remains in local device storage or iCloud.
- Roll Call media, sealed Future Capsule media, generated PDFs, and recovery manifests can use GCS.
- `media_asset` identifies the logical asset.
- `asset_copy` identifies each physical copy and where it can be found.
- `gcs_object` records durable cloud objects without storing public download URLs.

### Flexible State Values

State and type fields use text columns with `CHECK` constraints instead of PostgreSQL enums. This keeps future migrations straightforward while still rejecting unsupported values.

## Identity and Devices

### profile

Stores PhaseRoll-specific information for a Better Auth user. It is a one-to-one extension of `user`, using `user_id` as both its primary key and foreign key.

The table holds the public handle, display name, biography, locale, time zone, country, week-start preference, onboarding status, and flexible application preferences. Active handles are unique without preventing a handle from being reused after the original profile has been deleted.

### device

Represents an installation of PhaseRoll on iOS, Android, or the web. A user can have multiple device rows, although the initial product may launch with one-device sync behavior.

The row tracks the installation identifier, app and operating-system versions, public key, encrypted push token, sync cursor, and last-seen time. `revoked_at` disables a device without immediately deleting its history. The combination of user and installation identifier is unique.

## Storage and Media

### gcs_object

Records an object stored in Google Cloud Storage. It contains the bucket, object key, optional generation number, content metadata, checksum, encryption-key version, storage class, and verification state.

Object kinds distinguish Roll Call media, Future Capsule media, Memory Book PDFs, recap artifacts, recovery manifests, and miscellaneous objects. Bucket and object key are globally unique within the schema. The application should use this table to generate short-lived signed URLs rather than storing public URLs.

### media_asset

Represents one logical photo, video, audio recording, Live Photo, or document. It is the canonical metadata record even when the media bytes exist in more than one location.

The table stores capture time, time-zone context, dimensions, duration, MIME type, file size, cryptographic and perceptual hashes, EXIF data, and flexible metadata. `source` records how the asset entered PhaseRoll, such as the camera, photo library, Roll Call, journal, capsule, generated output, or import. Live Photo components can reference one another through `live_photo_pair_asset_id`.

### asset_copy

Maps a logical `media_asset` to one physical copy. A copy can be local, in iCloud, or in GCS.

Local and iCloud copies must reference a `device`; GCS copies must reference a `gcs_object`. Sensitive local or iCloud locators are encrypted in `locator_ciphertext`, while `external_id_hash` supports matching without exposing the source identifier. Availability and verification fields allow PhaseRoll to detect missing media and choose the best available copy.

### recovery_manifest

Stores an encrypted, portable map between canonical PhaseRoll asset IDs and device or iCloud assets. This supports account restoration and future migration between devices without uploading all personal media bytes to PhaseRoll.

A manifest can be stored directly as encrypted bytes or referenced through a GCS object. Version, asset count, checksum, encryption algorithm, and key version make manifests verifiable and migratable. `superseded_at` marks an older manifest after a newer snapshot is created.

## Phases and Memories

### phase

Represents a meaningful period of a user's life. Examples include a trip, a relationship, a creative project, a school year, or a period of personal change.

The table owns the Phase title, story, date range, time zone, visual settings, status, visibility, cover asset, and recap preference. `parent_phase_id` supports nested sub-phases. The owner is always explicit through `owner_user_id`; future sharing is represented separately through `phase_member` and `phase_invite`.

### phase_member

Associates an authenticated user with a shared Phase. The composite primary key ensures one membership per user and Phase.

Roles are owner, editor, or viewer. Status distinguishes invited, active, and removed memberships. Although regular Phases initially remain owner-only, this table provides the migration path for Shared Phases without changing Phase ownership.

### phase_invite

Represents an invitation to join a Phase as an editor or viewer. It stores the inviter, optional invited email, hashed invite token, expiration, acceptance status, and the authenticated user who accepted it.

Only the token hash is stored, so possession of the database does not reveal usable invite links. A successful acceptance should create or activate the matching `phase_member` row in the same transaction.

### phase_entry

Provides the unified, day-by-day timeline for a Phase. Every user-visible timeline item receives one entry with a kind of media, journal, milestone, capsule, or recap.

The table stores the author, absolute occurrence time, local date, time-zone context, sorting key, title, summary, and flexible display metadata. Kind-specific content lives in its dedicated table. For example, a journal entry references one `phase_entry`, while media is attached through `phase_entry_media`.

### phase_entry_media

Joins media assets to a timeline entry. It allows a single entry to contain multiple photos or videos and allows the same asset to appear where product rules permit.

Position controls media order, role distinguishes primary, supporting, and cover media, and `crop` stores presentation-specific framing. An entry cannot use the same position or asset twice.

### behind_memory

Stores the text or voice story explaining why a specific photo or video mattered. This is the canonical representation of PhaseRoll's “Behind the Memory” feature.

Every row belongs to a user and Phase and references the subject `media_asset`. It can optionally connect to the surrounding timeline entry. A memory must contain either written text or a voice asset. Voice memories retain transcription text, language, and processing status separately from the original recording.

### journal_entry

Stores the finished and in-progress result of a guided end-of-day conversation. Each journal belongs to one Phase and exactly one timeline entry.

The table preserves the raw transcript, generated polished text, and optional user-edited text as separate values. This prevents regeneration from destroying the original conversation and makes it clear which version should be displayed. Status tracks the journal from conversation through generation to a ready or failed state.

### journal_turn

Stores each assistant question and user response from a guided journal conversation in sequence. The original turns remain available even after PhaseRoll generates polished journal prose.

A turn can contain typed text, an audio asset, a transcript, or a combination of them. Sequence numbers are unique within the journal, and speaker is limited to assistant or user. Prompt keys and metadata make it possible to analyze or migrate conversation flows later.

### milestone

Represents an important turning point within a Phase. Each milestone has its own timeline entry so it appears naturally alongside media and journals.

The table stores the milestone title, story, date, optional icon, and flexible metadata. It references both the owning user and Phase directly for authorization and efficient Phase queries.

## Roll Call

### roll_call

Represents a hosted event where authenticated contributors submit shared memories. It stores the host, title, description, schedule, contribution deadline, cover asset, status, settings, and optional destination Phase.

The destination Phase is where approved contributions can eventually be imported. Roll Call lifecycle states are draft, open, closed, and archived. Closing a Roll Call does not delete its members or contributions.

### roll_call_member

Associates an authenticated user with a Roll Call as a host, moderator, or contributor. The composite primary key prevents duplicate membership.

Membership status records whether the user is active, removed, or has left. Authorization should require an active membership before accepting contributions or moderation actions.

### roll_call_invite

Stores a hashed invitation token for joining a Roll Call. An invite can expire, be revoked, or enforce a maximum number of uses.

`use_count` and `max_uses` support both single-person and shareable invitations. Invite redemption should atomically verify the limits, increment usage, and create the authenticated member row.

### roll_call_contribution

Represents one contributor's submission to a Roll Call. It stores an optional caption and occurrence time plus the moderation status and note.

Contributions move through draft, submitted, approved, or rejected states. Media is attached through `roll_call_contribution_asset`, allowing one contribution to contain an ordered group of assets.

### roll_call_contribution_asset

Joins a Roll Call contribution to its media assets and preserves their display order. The same asset cannot be added twice to one contribution, and each position within the contribution is unique.

Roll Call media assets should normally have a durable GCS-backed `asset_copy`, because the host cannot depend on the contributor's device remaining available.

## Future Capsules

### future_capsule

Represents a collection of memories scheduled for future delivery. A capsule belongs to its creator and can optionally be associated with a Phase and a Phase timeline entry.

The table stores the title, message, delivery time and time zone, lifecycle status, sealing and delivery timestamps, failure details, and settings. Sealed capsule media should be copied to durable cloud storage before the capsule becomes eligible for delivery.

### capsule_recipient

Represents one destination for a Future Capsule. A recipient can be an existing PhaseRoll user, an email address, or both.

The table tracks display and relationship context, delivery state, number of attempts, last attempt, and successful delivery time. At least one usable destination is required. Separate rows allow one capsule to be delivered independently to multiple recipients.

### capsule_item

Stores one ordered item inside a Future Capsule. Items can represent media, a message, a journal, a milestone, or another memory snapshot.

An item can reference source media, a durable GCS object, a Phase entry, inline text, or a JSON snapshot. Snapshots preserve what the sender sealed even if the original source is edited before delivery. Positions are unique within each capsule.

## Search and Generation

### embedding_model

Registers an embedding deployment available to PhaseRoll. It records the provider, Azure deployment name, underlying model name, vector dimensions, distance metric, and whether the deployment is active.

Keeping model metadata in the database allows embeddings from different model versions to coexist and be regenerated safely. Dimensions are not hard-coded into the initial schema because the Azure OpenAI deployment has not yet been selected.

### search_document

Stores normalized searchable text extracted from a Phase, Behind the Memory, journal, milestone, Roll Call contribution, capsule, or recap.

Each source has at most one search document per owner. A generated `tsvector` powers PostgreSQL full-text search, while content hashes help detect when embeddings need regeneration. The source ID is polymorphic, so application code is responsible for resolving it according to `source_kind`.

### search_embedding

Stores the semantic-search vector for a search document and embedding model. The composite primary key allows one document to have vectors from multiple model versions.

The vector column is intentionally dimensionless at schema creation time. The `dimensions` value must match the actual vector. After selecting an embedding model, add a model-specific HNSW partial index using the chosen dimensions and distance operator, as shown in `db/schema.sql`.

### generation_job

Tracks asynchronous AI and delivery work. Supported jobs include transcription, embedding, journal generation, Phase recap generation, Memory Book generation, and capsule delivery.

The table records queue state, attempts, provider and model information, prompt version, structured input and output, timestamps, and failure details. Workers can query the queue index for pending or retryable jobs. Sensitive source text should only be placed in `input` when operationally necessary.

### phase_recap

Stores a generated or edited summary of a Phase over an optional date range. A recap can appear in the unified timeline through `entry_id` and can reference the job that generated it.

The row retains title, body, structured highlights, version, publication state, and period boundaries. Multiple recap versions or periods can coexist for the same Phase.

### memory_book

Represents a generated Phase Memory Book and its production lifecycle. It stores the title, PDF format, layout version, generation configuration, preview and final GCS objects, purchase state, generation time, and expiration time.

The database stores only metadata and GCS references; generated PDF bytes remain in GCS. `permanent_copy_purchased_at` distinguishes a retained paid copy from an expiring preview or temporary output.

### memory_book_phase

Joins a Memory Book to one or more source Phases and preserves their order in the book. The composite primary key prevents the same Phase from being included twice, while the position constraint prevents ambiguous ordering.

## Billing and Access

### plan

Defines a sellable pricing plan or one-time product configuration. It records the name, billing interval, market, currency, amount in minor units, provider price ID, activity state, and metadata.

Markets currently distinguish global and India pricing. Billing intervals support free, monthly, annual, lifetime, and one-time products. Provider price IDs are unique when present.

### plan_feature

Defines which features a plan enables and any associated usage limit. The composite primary key gives each feature one configuration per plan.

`enabled` handles boolean access, `limit_value` handles numeric quotas, and `configuration` supports feature-specific settings. This table describes plan policy; effective per-user access is materialized in `entitlement`.

### subscription

Stores a user's recurring subscription from Stripe, the App Store, the Play Store, or a manual grant. It references the purchased plan and retains provider customer and subscription identifiers.

Status, billing period, trial end, cancellation choice, and cancellation time support access checks and webhook reconciliation. Active provider subscription IDs are unique per provider.

### purchase

Records one-time and transaction-level payments, including the Founder's Pass, Roll Call purchases, Memory Book copies, and subscription transactions.

The table stores the product type and optional product ID, provider transaction ID, amount, currency, market, payment state, purchase and refund timestamps, and provider metadata. The polymorphic product ID is interpreted according to `product_kind`.

### entitlement

Represents the effective right for a user to access a feature. Entitlements can come from a plan, subscription, purchase, promotion, or administrative grant.

Each row records its source, state, optional quota, validity period, revocation time, and metadata. A user can have multiple overlapping entitlements for one feature, so access checks should accept any active, unexpired row and combine limits according to product policy.

### usage_event

Records immutable metered usage for quota enforcement and analytics. Examples include generating a recap, creating a Memory Book, or consuming an AI operation.

Every event has a positive quantity, occurrence time, optional resource reference, and user-scoped idempotency key. The idempotency key prevents retries from charging the same usage twice.

## Sync and Operations

### client_mutation

Records a client write request and its idempotency key. This allows mobile clients to retry mutations safely after timeouts or connectivity loss.

The row stores the device, operation, request hash, processing state, resulting resource, response payload, error code, and completion time. The user and idempotency key pair is unique, so the server can return the original outcome instead of executing a duplicate write.

### sync_change

Provides a server-ordered change stream for future multi-device synchronization. Its identity sequence is the monotonic cursor clients use to request changes after their last synchronized position.

Each row names the owner, entity type and ID, operation, originating mutation, changed fields, and time. The table stores change notifications rather than complete entity snapshots; clients retrieve or apply data according to the sync protocol.

### outbox_event

Stores durable events that must be processed outside the database transaction. Examples include starting an AI generation job, sending a capsule, deleting a GCS object, or dispatching a notification.

Application writes should insert the business record and outbox event in one transaction. Workers claim available events, track attempts and locks, and mark them processed, failed, or dead-lettered. This prevents a committed database change from losing its corresponding external action.

### deletion_request

Tracks account-level and resource-level deletion workflows. It records who requested deletion, the target scope, the earliest purge time, workflow status, cancellation or completion time, and failures.

The earliest purge time must be at least 30 days after the request. A deletion worker should use this table to coordinate permanent removal across PostgreSQL, GCS, search indexes, and generated artifacts. Account deletion should only remove the Better Auth user after dependent product data and external objects have been handled.

## Relationship Overview

The central content path is:

```text
Better Auth user
  -> phase
    -> phase_entry
      -> phase_entry_media -> media_asset -> asset_copy
      -> journal_entry -> journal_turn
      -> milestone
      -> future_capsule -> capsule_item
      -> phase_recap
```

Searchable content is copied into `search_document` and optionally embedded in `search_embedding`. Asynchronous work is tracked in `generation_job` and dispatched reliably through `outbox_event`. Billing records produce `entitlement` rows, while `usage_event` records quota consumption. `client_mutation` and `sync_change` provide the foundation for retry-safe writes and future multi-device synchronization.