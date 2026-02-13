import httpx
from typing import Optional


class ApiCaller:
    async def call(
        self,
        url: str,
        method: str = "GET",
        headers: Optional[dict] = None,
        body: Optional[dict] = None,
        params: Optional[dict] = None,
    ) -> dict:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.request(
                    method=method.upper(),
                    url=url,
                    headers=headers or {},
                    json=body,
                    params=params,
                )
                # Try to parse as JSON, fallback to text
                try:
                    data = response.json()
                except Exception:
                    data = response.text

                return {
                    "status": response.status_code,
                    "data": data,
                    "headers": dict(response.headers),
                }
        except httpx.TimeoutException:
            return {"status": 0, "error": "Request timed out"}
        except Exception as e:
            return {"status": 0, "error": str(e)}