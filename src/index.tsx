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

const weatherPaymentMiddleware = paymentMiddleware(
  payTo as Address,
  {
    "/api/weather": {
      price: "$0.001",
      network,
    },
  },
  { url: facilitatorUrl }
);

app.use("/api/weather", weatherPaymentMiddleware);

app.get("/api/weather", (c) => {
  console.log("✅ [/api/weather] Payment successful! Serving paid content.");
  return c.json({
    report: {
      weather: "sunny",
      temperature: "25°C",
    },
  });
});

// --- buyer ---
app.get("/client/call-weather", async (c) => {
  console.log(
    "[/client/call-weather] Request received. Calling internal paid API..."
  );

  const privateKey = process.env.PRIVATE_KEY as string | undefined;
  const baseURL = process.env.RESOURCE_SERVER_URL;
  const endpointPath = process.env.ENDPOINT_PATH;
  const buyerNetwork = process.env.NETWORK as "base-sepolia" | "polygon-amoy";

  if (!baseURL || !privateKey || !endpointPath || !buyerNetwork) {
    console.error("Missing required environment variables for buyer-client.");
    return c.json({ error: "Server configuration error" }, 500);
  }

  const url = `${baseURL}${endpointPath}`;

  try {
    const signer = await createSigner(buyerNetwork, privateKey);
    const fetchWithPayment = wrapFetchWithPayment(fetch, signer);
    const response = await fetchWithPayment(url, { method: "GET" });
    const body = await response.json();

    if (response.ok) {
      return c.json(body);
    } else {
      c.status(response.status as any);
      return c.json(body);
    }
  } catch (error: any) {
    console.error("🚨 An unexpected error occurred in buyer-client:", error);
    return c.json(
      { error: "An internal server error occurred.", details: error.message },
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
