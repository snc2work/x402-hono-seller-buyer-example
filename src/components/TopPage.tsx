const shortenAddress = (addr: string) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

const TopPage = (props: { payToAddress: string; networkName: string }) => (
  <html>
    <head>
      <title>x402 Test Page</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>{`
        body { font-family: sans-serif; background-color: #f0f2f5; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px 0; }
        .container { background-color: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 24px; max-width: 600px; width: 90%; text-align: center; }
        h1 { color: #1877f2; font-size: 28px; margin-bottom: 12px; }
        p { line-height: 1.6; color: #4b4f56; }
        .button-container { margin-top: 20px; display: flex; flex-direction: column; gap: 15px; }
        .button { display: inline-block; background-color: #1877f2; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; transition: background-color 0.2s; }
        .button:hover { background-color: #166fe5; }
        .button.secondary { background-color: #6c757d; }
        .button.secondary:hover { background-color: #5a6268; }
        small { display: block; margin-top: 5px; color: #8a8d91; }
        /* --- ▼▼▼ ここからが追加スタイル ▼▼▼ --- */
        .info-box {
          margin-top: 30px;
          padding: 15px;
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          text-align: left;
        }
        .info-box p { margin: 0 0 8px 0; }
        .info-box .address-text {
          font-family: monospace;
          background-color: #e9ecef;
          padding: 4px 8px;
          border-radius: 4px;
          word-wrap: break-word;
        }
        .info-box a { color: #007bff; text-decoration: none; }
        .info-box a:hover { text-decoration: underline; }
        /* --- ▲▲▲ ここまでが追加スタイル ▲▲▲ --- */
      `}</style>
    </head>
    <body>
      <div class="container">
        <h1>x402 Test Page</h1>
        <p>Testing the purchase flow using the x402 protocol.</p>
        <div class="button-container">
          <div>
            <a href="/client/call-weather" target="_blank" class="button">
              Execute Payment & Call API
            </a>
            <small>
              (Processes payment automatically and displays weather data on
              success.)
            </small>
          </div>
          <div>
            <a href="/api/weather" target="_blank" class="button secondary">
              Call Paid API Directly
            </a>
            <small>(Opens the payment dialog.)</small>
          </div>
        </div>
        <div class="info-box">
          <p>{props.networkName}</p>
          <p class="address-text" title={props.payToAddress}>
            {shortenAddress(props.payToAddress)}
          </p>
        </div>
      </div>
    </body>
  </html>
);

export default TopPage;
