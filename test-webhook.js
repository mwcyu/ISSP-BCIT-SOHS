
const url = "https://tedok79603.app.n8n.cloud/webhook/0147a1ea-8f95-411a-bc1c-1f080fd5ffc3";

async function test() {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: true })
    });
    console.log("Status:", res.status);
    console.log("Text:", await res.text());
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
