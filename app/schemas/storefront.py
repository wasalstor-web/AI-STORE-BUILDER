"""
Public Storefront Schemas — Response models for customer-facing API.
"""

import uuid

from pydantic import BaseModel


class PublicProductResponse(BaseModel):
    """Product data visible to customers."""

    id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    short_description: str | None = None
    price: float
    compare_at_price: float | None = None
    currency: str = "SAR"
    image_url: str | None = None
    images: list[str] = []
    is_featured: bool = False
    in_stock: bool = True
    category_name: str | None = None
    attributes: dict | None = None
    weight: float | None = None
    weight_unit: str | None = None
    related_products: list["PublicProductResponse"] | None = None


class PublicProductListResponse(BaseModel):
    """Paginated product listing."""

    products: list[PublicProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PublicCategoryResponse(BaseModel):
    """Category data visible to customers."""

    id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    image_url: str | None = None
    product_count: int = 0


class PublicCategoryListResponse(BaseModel):
    """Category listing."""

    categories: list[PublicCategoryResponse]


class PublicStoreResponse(BaseModel):
    """Store data for the storefront landing page."""

    id: uuid.UUID
    name: str
    slug: str
    store_type: str
    language: str = "ar"
    logo_url: str | None = None
    primary_color: str = "#6d28d9"
    hero_title: str
    hero_subtitle: str = ""
    hero_image: str | None = None
    about: dict = {}
    features: list[dict] = []
    categories: list[PublicCategoryResponse] = []
    featured_products: list[PublicProductResponse] = []
    category_count: int = 0
    product_count: int = 0


class PublicOrderTrackingResponse(BaseModel):
    """Order tracking data for customers."""

    order_number: str
    status: str
    payment_status: str
    customer_name: str
    total: float
    currency: str = "SAR"
    items: list[dict] = []
    tracking_number: str | None = None
    shipping_method: str | None = None
    created_at: str | None = None
