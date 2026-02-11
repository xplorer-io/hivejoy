# Hive Joy - Database ER Diagram

## Architecture Overview

The database follows a **marketplace SubOrder pattern** where a single consumer checkout produces one `Order` with one `Payment`, which is then split into `SubOrder`s per seller — each with independent fulfillment, tracking, and return handling.

```mermaid
graph TD
  Checkout["Consumer Checkout"] --> Order["Order (1 per checkout)"]
  Order --> Payment["Payment (Stripe)"]
  Order --> SubOrderA["SubOrder (Seller A)"]
  Order --> SubOrderB["SubOrder (Seller B)"]
  SubOrderA --> ItemsA["OrderItems"]
  SubOrderA --> ShipmentA["Shipment + Events"]
  SubOrderB --> ItemsB["OrderItems"]
  SubOrderB --> ShipmentB["Shipment + Events"]
```

---

## ER Diagram

```mermaid
erDiagram
    User {
        uuid id PK
        varchar email UK
        varchar phone
        varchar first_name
        varchar last_name
        enum role "consumer | producer | admin"
        enum status "active | suspended | banned"
        varchar avatar_url
        timestamp created_at
        timestamp updated_at
    }

    Address {
        uuid id PK
        uuid user_id FK
        varchar label "home | work | other"
        varchar street
        varchar suburb
        varchar state
        varchar postcode
        varchar country
        boolean is_default
        timestamp created_at
    }

    ProducerProfile {
        uuid id PK
        uuid user_id FK "UK"
        varchar business_name
        varchar abn
        text bio
        varchar profile_image
        varchar cover_image
        enum verification_status "pending | submitted | under_review | approved | rejected"
        enum badge_level "none | verified | premium"
        timestamp created_at
        timestamp updated_at
    }

    VerificationSubmission {
        uuid id PK
        uuid producer_id FK
        enum status "pending | submitted | under_review | approved | rejected"
        text admin_notes
        uuid reviewed_by FK "nullable - User id"
        timestamp reviewed_at
        timestamp submitted_at
        timestamp created_at
    }

    VerificationDocument {
        uuid id PK
        uuid submission_id FK
        enum type "business_registration | abn_certificate | food_safety | beekeeper_registration | other"
        varchar name
        varchar url
        timestamp uploaded_at
    }

    Batch {
        uuid id PK
        uuid producer_id FK
        varchar name
        varchar region
        date harvest_date
        date extraction_date
        text[] floral_sources
        integer quantity_kg
        text notes
        enum status "draft | active | archived"
        timestamp created_at
        timestamp updated_at
    }

    Product {
        uuid id PK
        uuid producer_id FK
        uuid batch_id FK
        varchar title
        text description
        text[] photos
        enum status "draft | pending_approval | approved | rejected | archived"
        jsonb nutritional_info
        decimal average_rating
        integer review_count
        timestamp created_at
        timestamp updated_at
    }

    ProductVariant {
        uuid id PK
        uuid product_id FK
        varchar size "250g | 500g | 1kg"
        decimal price
        integer stock
        decimal weight_grams
        varchar barcode
        varchar sku
        timestamp created_at
    }

    Review {
        uuid id PK
        uuid product_id FK
        uuid buyer_id FK
        uuid order_id FK
        integer rating "1-5"
        varchar title
        text comment
        timestamp created_at
        timestamp updated_at
    }

    Order {
        uuid id PK
        uuid buyer_id FK
        varchar order_number UK "HJ-20260208-XXXX"
        enum status "pending | confirmed | partially_shipped | shipped | delivered | cancelled"
        decimal subtotal
        decimal shipping_total
        decimal platform_fee_total
        decimal gst_total
        decimal total
        jsonb shipping_address "snapshot"
        jsonb billing_address "snapshot"
        timestamp created_at
        timestamp updated_at
    }

    Payment {
        uuid id PK
        uuid order_id FK "UK"
        varchar stripe_checkout_session_id
        varchar stripe_payment_intent_id
        decimal amount
        varchar currency "AUD"
        enum status "pending | processing | succeeded | failed | refunded | partially_refunded"
        varchar method "card | afterpay"
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
    }

    SubOrder {
        uuid id PK
        uuid order_id FK
        uuid seller_id FK "ProducerProfile id"
        enum status "pending | confirmed | processing | packed | shipped | delivered | cancelled | return_requested | returned | refunded"
        decimal subtotal
        decimal shipping_cost
        decimal platform_fee
        decimal gst
        decimal total
        timestamp created_at
        timestamp updated_at
    }

    OrderItem {
        uuid id PK
        uuid sub_order_id FK
        uuid product_id FK
        uuid variant_id FK
        varchar product_title "snapshot"
        varchar variant_size "snapshot"
        integer quantity
        decimal unit_price "snapshot"
        decimal gst
        jsonb batch_snapshot "batchId, region, harvestDate, floralSources"
        timestamp created_at
    }

    Shipment {
        uuid id PK
        uuid sub_order_id FK "UK"
        varchar carrier "australia_post | shippit | sendle"
        varchar tracking_number
        varchar tracking_url
        enum status "pending | picked_up | in_transit | out_for_delivery | delivered | failed | returned"
        date estimated_delivery
        timestamp shipped_at
        timestamp delivered_at
        timestamp created_at
        timestamp updated_at
    }

    ShipmentEvent {
        uuid id PK
        uuid shipment_id FK
        varchar status
        text description
        varchar location
        timestamp occurred_at
        timestamp created_at
    }

    SupportTicket {
        uuid id PK
        uuid user_id FK
        uuid order_id FK "nullable"
        uuid sub_order_id FK "nullable"
        varchar reason
        enum status "open | in_progress | resolved | closed"
        timestamp created_at
        timestamp updated_at
    }

    TicketMessage {
        uuid id PK
        uuid ticket_id FK
        uuid sender_id FK
        text content
        timestamp created_at
    }

    AuditLog {
        uuid id PK
        uuid actor_id FK
        varchar actor_role
        varchar entity_type
        uuid entity_id
        varchar action
        jsonb before_state
        jsonb after_state
        timestamp created_at
    }

    User ||--o{ Address : "has many"
    User ||--o| ProducerProfile : "has one (if producer)"
    User ||--o{ Order : "places"
    User ||--o{ Review : "writes"
    User ||--o{ SupportTicket : "opens"
    User ||--o{ AuditLog : "performs"

    ProducerProfile ||--o{ VerificationSubmission : "submits"
    ProducerProfile ||--o{ Batch : "produces"
    ProducerProfile ||--o{ Product : "lists"
    ProducerProfile ||--o{ SubOrder : "fulfills"

    VerificationSubmission ||--o{ VerificationDocument : "includes"

    Batch ||--o{ Product : "contains"

    Product ||--o{ ProductVariant : "has"
    Product ||--o{ Review : "receives"
    Product ||--o{ OrderItem : "sold as"

    ProductVariant ||--o{ OrderItem : "purchased as"

    Order ||--|| Payment : "paid via"
    Order ||--o{ SubOrder : "split into"
    Order ||--o{ Review : "reviewed from"

    SubOrder ||--o{ OrderItem : "contains"
    SubOrder ||--o| Shipment : "shipped via"
    SubOrder ||--o{ SupportTicket : "may have"

    Shipment ||--o{ ShipmentEvent : "tracked by"

    SupportTicket ||--o{ TicketMessage : "has messages"
```

---

## Entity Details

### 1. User + ProducerProfile (Split Table Pattern)

- All users share the `User` table (consumer, producer, admin) with a `role` enum.
- Producers get an additional `ProducerProfile` row (1:1 with User) for business-specific fields.
- Admins are just users with `role = 'admin'` -- no extra table needed.
- `Address` is a separate table so users can save multiple shipping/billing addresses.

### 2. Product + Batch (Traceability)

- Each `Product` belongs to one `Batch` (the honey harvest it came from).
- `Batch` stores provenance: harvest date, extraction date, region, floral sources, quantity.
- `Product` stores marketplace data: title, photos, status, nutritional info, average rating.
- `ProductVariant` handles size-based pricing (250g, 500g, 1kg) with independent stock levels.
- `nutritional_info` is stored as JSONB for flexibility (energy, protein, sugars, etc.).
- `average_rating` and `review_count` are denormalized on `Product` for fast display.

### 3. Order -> SubOrder -> OrderItem (Marketplace Pattern)

- **Order**: One per checkout. Holds buyer info, totals, and address snapshots.
- **SubOrder**: One per seller in the order. Each has its own status, shipping cost, and platform fee. This enables independent fulfillment workflows per seller.
- **OrderItem**: Individual line items. Contains price/product snapshots (immutable at purchase time) and a `batch_snapshot` JSONB for honey provenance traceability.
- Addresses are snapshotted as JSONB on the Order (not FK references) so they remain correct even if the user later updates their address.

### 4. Payment (Stripe Integration)

- 1:1 with Order (one payment per checkout).
- Stores both `stripe_checkout_session_id` (from checkout creation) and `stripe_payment_intent_id` (from webhook).
- Status updated via Stripe webhooks: `pending -> processing -> succeeded`.
- Supports refunds: `succeeded -> partially_refunded -> refunded`.

### 5. Shipment + ShipmentEvent (Delivery Tracking)

- **Shipment**: 1:1 with SubOrder. Created when seller packs the sub-order. Stores carrier, tracking number, and high-level status.
- **ShipmentEvent**: Append-only log of tracking updates from the delivery partner (Australia Post, Shippit, etc.). Each event has status, description, location, and timestamp.
- This allows full delivery history reconstruction without overwriting previous states.

### 6. Review

- Tied to a specific product, buyer, and order.
- Composite unique constraint on `(buyer_id, product_id, order_id)` to prevent duplicate reviews.
- `average_rating` and `review_count` on `Product` are updated via trigger or application logic.

### 7. Verification + Documents

- `VerificationSubmission` tracks the review workflow for producer approval.
- `VerificationDocument` stores uploaded files (business registration, food safety certs, etc.).
- Admin decisions are recorded with notes and reviewer ID for audit trail.

### 8. Support + Audit

- `SupportTicket` can be linked to an Order or SubOrder (both nullable for general inquiries).
- `TicketMessage` enables threaded conversations between user and support.
- `AuditLog` records all significant admin/system actions with before/after state snapshots.

---

## Key Indexes

| Index | Purpose |
|-------|---------|
| `User.email` (unique) | Login lookup |
| `ProducerProfile.user_id` (unique) | User-to-profile mapping |
| `Product(producer_id, status)` | Seller's active listings |
| `Product(status, created_at)` | Marketplace browsing |
| `Order.buyer_id` | Consumer's order history |
| `Order.order_number` (unique) | Human-readable order lookup |
| `SubOrder(order_id)` | Sub-orders within an order |
| `SubOrder(seller_id, status)` | Seller's fulfillment queue |
| `Shipment.tracking_number` | Lookup by tracking |
| `Review(product_id, created_at)` | Product review pages |
| `Payment.stripe_checkout_session_id` | Stripe webhook lookups |
