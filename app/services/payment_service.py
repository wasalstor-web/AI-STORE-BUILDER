"""Payment service — Moyasar + Tap gateway integration."""

import logging
from decimal import Decimal

import httpx
from pydantic import BaseModel

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class PaymentResult(BaseModel):
    success: bool
    payment_id: str | None = None
    redirect_url: str | None = None
    error: str | None = None
    metadata: dict = {}


class PaymentService:
    """Unified payment gateway interface."""

    def __init__(self):
        self.moyasar_key = getattr(settings, "MOYASAR_API_KEY", "")
        self.tap_key = getattr(settings, "TAP_SECRET_KEY", "")

    async def create_payment(
        self,
        gateway: str,
        amount: Decimal,
        currency: str,
        order_id: str,
        description: str,
        callback_url: str,
        customer_name: str = "",
        customer_email: str = "",
        customer_phone: str = "",
        payment_method: str = "mada",
    ) -> PaymentResult:
        """Create a payment session with the chosen gateway."""
        if gateway == "moyasar":
            return await self._create_moyasar_payment(
                amount,
                currency,
                order_id,
                description,
                callback_url,
                customer_name,
                payment_method,
            )
        elif gateway == "tap":
            return await self._create_tap_payment(
                amount,
                currency,
                order_id,
                description,
                callback_url,
                customer_name,
                customer_email,
                customer_phone,
            )
        elif gateway == "cod":
            return PaymentResult(
                success=True,
                payment_id=f"COD-{order_id}",
                metadata={"method": "cash_on_delivery"},
            )
        else:
            return PaymentResult(success=False, error=f"بوابة الدفع '{gateway}' غير مدعومة")

    async def _create_moyasar_payment(
        self,
        amount: Decimal,
        currency: str,
        order_id: str,
        description: str,
        callback_url: str,
        customer_name: str,
        payment_method: str,
    ) -> PaymentResult:
        """Create payment via Moyasar API."""
        if not self.moyasar_key:
            return PaymentResult(success=False, error="Moyasar API key not configured")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.moyasar.com/v1/payments",
                    auth=(self.moyasar_key, ""),
                    json={
                        "amount": int(amount * 100),  # Moyasar expects halalas
                        "currency": currency,
                        "description": description,
                        "callback_url": callback_url,
                        "source": {
                            "type": "creditcard"
                            if payment_method in ("visa", "mastercard")
                            else payment_method,
                        },
                        "metadata": {
                            "order_id": order_id,
                            "customer_name": customer_name,
                        },
                    },
                    timeout=30.0,
                )

                if response.status_code in (200, 201):
                    data = response.json()
                    return PaymentResult(
                        success=True,
                        payment_id=data.get("id"),
                        redirect_url=data.get("source", {}).get("transaction_url"),
                        metadata=data,
                    )
                else:
                    logger.error(f"Moyasar error: {response.status_code} {response.text}")
                    return PaymentResult(
                        success=False,
                        error=f"خطأ في بوابة الدفع: {response.status_code}",
                    )
        except Exception as e:
            logger.exception("Moyasar payment failed")
            return PaymentResult(success=False, error=str(e))

    async def _create_tap_payment(
        self,
        amount: Decimal,
        currency: str,
        order_id: str,
        description: str,
        callback_url: str,
        customer_name: str,
        customer_email: str,
        customer_phone: str,
    ) -> PaymentResult:
        """Create payment via Tap Payments API."""
        if not self.tap_key:
            return PaymentResult(success=False, error="Tap API key not configured")

        try:
            # Split name
            name_parts = customer_name.split(" ", 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ""

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.tap.company/v2/charges",
                    headers={
                        "Authorization": f"Bearer {self.tap_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "amount": float(amount),
                        "currency": currency,
                        "description": description,
                        "reference": {"order": order_id},
                        "receipt": {"email": True, "sms": bool(customer_phone)},
                        "customer": {
                            "first_name": first_name,
                            "last_name": last_name,
                            "email": customer_email,
                            "phone": {"number": customer_phone or "", "country_code": "966"},
                        },
                        "redirect": {"url": callback_url},
                        "post": {"url": callback_url},
                    },
                    timeout=30.0,
                )

                if response.status_code in (200, 201):
                    data = response.json()
                    return PaymentResult(
                        success=True,
                        payment_id=data.get("id"),
                        redirect_url=data.get("transaction", {}).get("url"),
                        metadata=data,
                    )
                else:
                    logger.error(f"Tap error: {response.status_code} {response.text}")
                    return PaymentResult(
                        success=False,
                        error=f"خطأ في بوابة الدفع: {response.status_code}",
                    )
        except Exception as e:
            logger.exception("Tap payment failed")
            return PaymentResult(success=False, error=str(e))

    async def verify_payment(self, gateway: str, payment_id: str) -> PaymentResult:
        """Verify a payment status."""
        if gateway == "moyasar":
            return await self._verify_moyasar(payment_id)
        elif gateway == "tap":
            return await self._verify_tap(payment_id)
        elif gateway == "cod":
            return PaymentResult(success=True, payment_id=payment_id)
        return PaymentResult(success=False, error="بوابة غير مدعومة")

    async def _verify_moyasar(self, payment_id: str) -> PaymentResult:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://api.moyasar.com/v1/payments/{payment_id}",
                    auth=(self.moyasar_key, ""),
                    timeout=15.0,
                )
                data = response.json()
                paid = data.get("status") == "paid"
                return PaymentResult(
                    success=paid,
                    payment_id=payment_id,
                    metadata=data,
                    error=None if paid else f"حالة الدفع: {data.get('status')}",
                )
        except Exception as e:
            return PaymentResult(success=False, error=str(e))

    async def _verify_tap(self, payment_id: str) -> PaymentResult:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://api.tap.company/v2/charges/{payment_id}",
                    headers={"Authorization": f"Bearer {self.tap_key}"},
                    timeout=15.0,
                )
                data = response.json()
                paid = data.get("status") == "CAPTURED"
                return PaymentResult(
                    success=paid,
                    payment_id=payment_id,
                    metadata=data,
                    error=None if paid else f"حالة الدفع: {data.get('status')}",
                )
        except Exception as e:
            return PaymentResult(success=False, error=str(e))


# Singleton
payment_service = PaymentService()
