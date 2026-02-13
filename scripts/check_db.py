import sqlite3
conn = sqlite3.connect("aisb_dev.db")

# Create missing tables for migration 004
conn.executescript("""
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    store_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    last_order_date DATETIME,
    addresses TEXT DEFAULT '[]',
    tags TEXT DEFAULT '[]',
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    store_id TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL DEFAULT 'percentage',
    discount_value REAL NOT NULL,
    min_order_amount REAL,
    max_discount_amount REAL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    max_uses_per_customer INTEGER DEFAULT 1,
    starts_at DATETIME,
    expires_at DATETIME,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    store_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    rating INTEGER NOT NULL,
    title TEXT,
    comment TEXT,
    is_approved INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX IF NOT EXISTS ix_customers_store_id ON customers(store_id);
CREATE INDEX IF NOT EXISTS ix_customers_tenant_id ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS ix_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS ix_coupons_store_id ON coupons(store_id);
CREATE INDEX IF NOT EXISTS ix_coupons_tenant_id ON coupons(tenant_id);
CREATE INDEX IF NOT EXISTS ix_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS ix_reviews_store_id ON reviews(store_id);
CREATE INDEX IF NOT EXISTS ix_reviews_tenant_id ON reviews(tenant_id);
CREATE INDEX IF NOT EXISTS ix_reviews_product_id ON reviews(product_id);
""")

# Also add email_verified columns if missing
try:
    conn.execute("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0")
except:
    pass
try:
    conn.execute("ALTER TABLE users ADD COLUMN verification_token TEXT")
except:
    pass
try:
    conn.execute("ALTER TABLE users ADD COLUMN verification_token_expires DATETIME")
except:
    pass
try:
    conn.execute("ALTER TABLE users ADD COLUMN reset_token TEXT")
except:
    pass
try:
    conn.execute("ALTER TABLE users ADD COLUMN reset_token_expires DATETIME")
except:
    pass

# Stamp alembic version
conn.execute("DELETE FROM alembic_version")
conn.execute("INSERT INTO alembic_version (version_num) VALUES ('004_customers_coupons_reviews')")
conn.commit()

# Verify
tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()
for t in tables:
    print(t[0])
print("---")
ver = conn.execute("SELECT version_num FROM alembic_version").fetchall()
print("alembic:", ver)
conn.close()
print("Done!")
