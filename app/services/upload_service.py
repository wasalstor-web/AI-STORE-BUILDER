"""Upload service — Cloudflare R2 (S3-compatible) image storage."""

import logging
import uuid

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class UploadService:
    """Handles file uploads to Cloudflare R2 or local storage."""

    def __init__(self):
        self.r2_account_id = getattr(settings, "CLOUDFLARE_ACCOUNT_ID", "")
        self.r2_access_key = getattr(settings, "R2_ACCESS_KEY_ID", "")
        self.r2_secret_key = getattr(settings, "R2_SECRET_ACCESS_KEY", "")
        self.r2_bucket = getattr(settings, "R2_BUCKET_NAME", "store-images")
        self.r2_public_url = getattr(settings, "R2_PUBLIC_URL", "")

    @property
    def is_configured(self) -> bool:
        return bool(self.r2_account_id and self.r2_access_key and self.r2_secret_key)

    async def upload_image(
        self,
        file_bytes: bytes,
        filename: str,
        content_type: str = "image/jpeg",
        folder: str = "products",
    ) -> str | None:
        """Upload image and return public URL."""
        # Generate unique key
        ext = filename.rsplit(".", 1)[-1] if "." in filename else "jpg"
        key = f"{folder}/{uuid.uuid4().hex}.{ext}"

        if self.is_configured:
            return await self._upload_to_r2(file_bytes, key, content_type)
        else:
            # Fallback: save locally
            return await self._save_local(file_bytes, key)

    async def _upload_to_r2(self, file_bytes: bytes, key: str, content_type: str) -> str | None:
        """Upload to Cloudflare R2 via S3-compatible API."""
        try:
            # Using boto3-compatible approach with httpx for minimal deps
            import boto3
            from botocore.config import Config

            s3 = boto3.client(
                "s3",
                endpoint_url=f"https://{self.r2_account_id}.r2.cloudflarestorage.com",
                aws_access_key_id=self.r2_access_key,
                aws_secret_access_key=self.r2_secret_key,
                config=Config(signature_version="s3v4"),
                region_name="auto",
            )

            s3.put_object(
                Bucket=self.r2_bucket,
                Key=key,
                Body=file_bytes,
                ContentType=content_type,
            )

            if self.r2_public_url:
                return f"{self.r2_public_url.rstrip('/')}/{key}"
            return f"https://{self.r2_bucket}.{self.r2_account_id}.r2.dev/{key}"

        except ImportError:
            logger.warning("boto3 not installed, falling back to local storage")
            return await self._save_local(file_bytes, key)
        except Exception:
            logger.exception("R2 upload failed")
            return None

    async def _save_local(self, file_bytes: bytes, key: str) -> str | None:
        """Save file locally as fallback."""
        import os

        import aiofiles

        upload_dir = os.path.join("uploads", os.path.dirname(key))
        os.makedirs(upload_dir, exist_ok=True)

        filepath = os.path.join("uploads", key)
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(file_bytes)

        return f"/static/uploads/{key}"

    async def delete_image(self, url: str) -> bool:
        """Delete an image by URL."""
        if not url:
            return False

        if self.is_configured and self.r2_public_url and url.startswith(self.r2_public_url):
            try:
                import boto3
                from botocore.config import Config

                key = url.replace(self.r2_public_url.rstrip("/") + "/", "")
                s3 = boto3.client(
                    "s3",
                    endpoint_url=f"https://{self.r2_account_id}.r2.cloudflarestorage.com",
                    aws_access_key_id=self.r2_access_key,
                    aws_secret_access_key=self.r2_secret_key,
                    config=Config(signature_version="s3v4"),
                    region_name="auto",
                )
                s3.delete_object(Bucket=self.r2_bucket, Key=key)
                return True
            except Exception:
                logger.exception("R2 delete failed")
                return False
        else:
            # Local file
            import os

            filepath = url.replace("/static/", "")
            if os.path.exists(filepath):
                os.remove(filepath)
                return True
        return False


# Singleton
upload_service = UploadService()
