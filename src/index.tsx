import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { paymentMiddleware, Network, Resource } from "x402-hono";
import { wrapFetchWithPayment, createSigner, type Hex } from "x402-fetch";
import { type Address } from "viem";
import TopPage from "./components/TopPage";

const app = new Hono();

const facilitatorUrl = process.env.FACILITATOR_URL as Resource;
const payTo = process.env.PAY_TO_ADDRESS as string;
const network = process.env.NETWORK as Network;

if (!facilitatorUrl || !payTo || !network) {
  throw new Error(
    "Missing required seller environment variables. Check .env file."
  );
}

app.get("/", (c) => {
  return c.html(<TopPage payToAddress={payTo} networkName={network} />);
});

// --- seller ---

const premiumPaymentMiddleware = paymentMiddleware(
  payTo as Address,
  {
    "/api/premium": {
      price: "$0.001",
      network,
    },
  },
  { url: facilitatorUrl }
);

app.use("/api/premium", premiumPaymentMiddleware);

app.get("/api/premium", (c) => {
  console.log("✅ [/api/premium] Payment successful! Serving paid content.");
  return c.json({
    title: "x402 is groundbreaking!",
  });
});

// --- buyer ---
app.get("/client/call-premium", async (c) => {
  console.log(
    "[/client/call-premium] Request received. Calling internal paid API..."
  );

  const privateKey = process.env.PRIVATE_KEY as string | undefined;
  const baseURL = process.env.RESOURCE_SERVER_URL;
  const endpointPath = process.env.ENDPOINT_PATH;
  const buyerNetwork = process.env.NETWORK || "base-sepolia";

  if (!baseURL || !privateKey || !endpointPath) {
    console.error("Missing required environment variables for buyer-client.");
    return c.json({ error: "Server configuration error" }, 500);
  }

  const url = `${baseURL}${endpointPath}`;

  try {
    const signer = await createSigner(buyerNetwork, privateKey);
    const fetchWithPayment = wrapFetchWithPayment(fetch, signer);
    const response = await fetchWithPayment(url, { method: "GET" });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error from paid API: ${response.status}`, errorBody);
      c.status(response.status as any);
      try {
        return c.json(JSON.parse(errorBody));
      } catch {
        return c.json({ error: "Upstream API error", details: errorBody });
      }
    }

    const body = await response.json();
    return c.json(body);
  } catch (error: unknown) {
    console.error("🚨 An unexpected error occurred in buyer-client:", error);
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return c.json(
      { error: "An internal server error occurred.", details: errorMessage },
      500
    );
  }
});

const port = 8787;
console.log(`Server is running on http://localhost:${port}`);
console.log("---");
console.log("Test your application by visiting the URL above in your browser.");
console.log("---");

serve({
  fetch: app.fetch,
  port,
});
