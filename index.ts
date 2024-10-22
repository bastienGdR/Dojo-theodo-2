import { serve } from "https://deno.land/std@0.119.0/http/server.ts";

function handlePreFlightRequest(): Response {
  return new Response("Preflight OK!", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type",
    },
  });
}

async function handler(_req: Request): Promise<Response> {
  if (_req.method == "OPTIONS") {
    handlePreFlightRequest();
  }

  let body

  try {
    body = await _req.json(); // Parse the JSON body
    console.log("Received body:", body); // Log the received body

    // Log a specific value if it exists
    if (body.guess) {
      console.log("Guess value:", body.guess); // Log the "guess" value
    }
  } catch (error) {
    console.error("Error parsing JSON body:", error);
    return new Response("Invalid JSON", { status: 400 });
  }
  

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  
  const similarityRequestBody = JSON.stringify({
    word1: body.guess,
    word2: "supelec",
  });
  console.log("Debug:", similarityRequestBody)

  const requestOptions = {
    method: "POST",
    headers: headers,
    body: similarityRequestBody,
    redirect: "follow",
  };

  try {
    const response = await fetch("http://word2vec.nicolasfley.fr/similarity", requestOptions);

    if (!response.ok) {
      console.error(`Error: ${response.statusText}`);
      return new Response(`Error: ${response.statusText}`, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "content-type",
        },
      });
    }

    const result = await response.json();

    console.log(result);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

serve(handler);