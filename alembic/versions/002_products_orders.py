"""add products, categories, orders tables

Revision ID: 002
Revises: 001
Create Date: 2026-02-08
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Categories ──
    op.create_table(
        "categories",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("tenant_id", sa.Uuid(), nullable=False),
        sa.Column("store_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("parent_id", sa.Uuid(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.ForeignKeyConstraint(["store_id"], ["stores.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["parent_id"], ["categories.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_categories_tenant_id", "categories", ["tenant_id"])
    op.create_index("ix_categories_store_id", "categories", ["store_id"])
    op.create_index("ix_categories_slug", "categories", ["slug"])

    # ── Products ──
    op.create_table(
        "products",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("tenant_id", sa.Uuid(), nullable=False),
        sa.Column("store_id", sa.Uuid(), nullable=False),
        sa.Column("category_id", sa.Uuid(), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("short_description", sa.String(500), nullable=True),
        sa.Column("price", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("compare_at_price", sa.Numeric(12, 2), nullable=True),
        sa.Column("cost_price", sa.Numeric(12, 2), nullable=True),
        sa.Column("currency", sa.String(3), nullable=False, server_default="SAR"),
        sa.Column("sku", sa.String(100), nullable=True),
        sa.Column("barcode", sa.String(100), nullable=True),
        sa.Column("stock_quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("track_inventory", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("allow_backorder", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("images", sa.JSON(), nullable=True),
        sa.Column("meta_title", sa.String(255), nullable=True),
        sa.Column("meta_description", sa.String(500), nullable=True),
        sa.Column("attributes", sa.JSON(), nullable=True),
        sa.Column("weight", sa.Numeric(8, 2), nullable=True),
        sa.Column("weight_unit", sa.String(10), nullable=False, server_default="kg"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.ForeignKeyConstraint(["store_id"], ["stores.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_products_tenant_id", "products", ["tenant_id"])
    op.create_index("ix_products_store_id", "products", ["store_id"])
    op.create_index("ix_products_category_id", "products", ["category_id"])
    op.create_index("ix_products_slug", "products", ["slug"])
    op.create_index("ix_products_sku", "products", ["sku"])

    # ── Orders ──
    op.create_table(
        "orders",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("tenant_id", sa.Uuid(), nullable=False),
        sa.Column("store_id", sa.Uuid(), nullable=False),
        sa.Column("order_number", sa.String(50), nullable=False, unique=True),
        sa.Column("customer_name", sa.String(255), nullable=False),
        sa.Column("customer_email", sa.String(255), nullable=False),
        sa.Column("customer_phone", sa.String(20), nullable=True),
        sa.Column("shipping_address", sa.JSON(), nullable=True),
        sa.Column("subtotal", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("shipping_cost", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("tax_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("discount_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("total", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("currency", sa.String(3), nullable=False, server_default="SAR"),
        sa.Column("status", sa.String(50), nullable=False, server_default="pending"),
        sa.Column("payment_method", sa.String(50), nullable=True),
        sa.Column("payment_status", sa.String(50), nullable=False, server_default="unpaid"),
        sa.Column("payment_id", sa.String(255), nullable=True),
        sa.Column("payment_metadata", sa.JSON(), nullable=True),
        sa.Column("shipping_method", sa.String(100), nullable=True),
        sa.Column("tracking_number", sa.String(255), nullable=True),
        sa.Column("shipping_metadata", sa.JSON(), nullable=True),
        sa.Column("customer_notes", sa.Text(), nullable=True),
        sa.Column("admin_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"]),
        sa.ForeignKeyConstraint(["store_id"], ["stores.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_orders_tenant_id", "orders", ["tenant_id"])
    op.create_index("ix_orders_store_id", "orders", ["store_id"])
    op.create_index("ix_orders_order_number", "orders", ["order_number"], unique=True)
    op.create_index("ix_orders_status", "orders", ["status"])

    # ── Order Items ──
    op.create_table(
        "order_items",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("order_id", sa.Uuid(), nullable=False),
        sa.Column("product_id", sa.Uuid(), nullable=True),
        sa.Column("product_name", sa.String(255), nullable=False),
        sa.Column("product_sku", sa.String(100), nullable=True),
        sa.Column("product_image", sa.String(500), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("unit_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("total_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("attributes", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_order_items_order_id", "order_items", ["order_id"])


def downgrade() -> None:
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("products")
    op.drop_table("categories")
