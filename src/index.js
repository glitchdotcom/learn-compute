/**
 * THIS COMPUTE CODE RUNS ON THE FASTLY EDGE
 *
 * Make sure you deploy again whenever you make a change here 🚀 🚀 🚀
 *
 * When the visitor makes a request for the deployed site
 *  - Compute code grabs the user location from the request IP address
 *  - Makes the request to the origin for the site content
 *  - Adds a cookie to the response 
 *  - Sends a synthetic 404 page
 *  - Password protects some pages
 */

import { getGeolocationForIpAddress } from "fastly:geolocation";
import { Base64 } from "js-base64";
let _ = require("lodash");
let where = "?",
  greeting = "Hello!";

// We use a function to handle requests to the origin
addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

async function handleRequest(_event) {
  
  //The request the user made
  let req = _event.request;
  let url = new URL(req.url);
  
  //Find out the user location info
  try {
    let ip =
      new URL(_event.request.url).searchParams.get("ip") ||
      _event.client.address;

    //https://js-compute-reference-docs.edgecompute.app/docs/fastly:geolocation/getGeolocationForIpAddress
    let geo = getGeolocationForIpAddress(ip);

    // Where is the user
    where = _.startCase(_.toLower(geo.city)) + " " + geo.country_code;

    // 🚧 🚧 🚧 Add the code from Step 4 in the README on the next line 🚧 🚧 🚧

    // Grab the auth header
    const authorizationHeader = req.headers.get("authorization");
    req.headers.delete("authorization");

    // Build a new request
    req = new Request(url, req);

    //Get the origin response
    let backendResponse = await fetch(req, {
      backend: "glitch",
    });

    // Find out which pop delivered the response
    let pop = backendResponse.headers.get("x-served-by");
    pop = pop.substring(pop.lastIndexOf("-") + 1);

    // Tag the response with a cookie including the user location
    backendResponse.headers.set(
      "Set-Cookie",
      "location=" +
        greeting +
        " This reponse was delivered by the Fastly " +
        pop +
        " POP for a request from " +
        where +
        "; SameSite=None; Secure"
    );

    // Return a synthetic page if the origin returns a 404
    if (backendResponse.status === 404) {
      backendResponse = new Response(
        `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>404</title>
    <link rel="stylesheet" href="style.css"/>
  </head>
  <body>
    <div class="wrapper">
    <div class="content">
    <h1>⚠️ 404 ⚠️</h1>
    <p>WELP the page you requested can't be found..</p>
    <p>Go to <a href="/">the homepage</a> instead!</p>
    </div></div>
  </body>
</html>`,
        {
          status: 404,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }

    // Password protect anything starting with a p
    if (url.pathname.startsWith("/p")) {
      const { authorized, username } = authorize(authorizationHeader);

      if (!authorized) {
        return new Response(
          `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Unauthorized</title>
    <link rel="stylesheet" href="style.css"/>
  </head>
  <body>
    <div class="wrapper">
    <div class="content">
    <h1>⛔️ Unauthorized ⛔️</h1>
    <p>OOPS you need to login to see this page..</p>
    <p>Go to <a href="/">the homepage</a> instead!</p>
    </div></div>
  </body>
</html>`,
          {
            status: 401,
            headers: new Headers([
              ["WWW-Authenticate", 'Basic realm="Private page"'],
              ["Content-Type", "text/html"]
            ]),
          }
        );
      }
      else console.log(username + " viewed a secret page");
    }
    
    return backendResponse;
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Helper function to check login 
function authorize(authorization) {
  if (!authorization) { return { authorized: false }; }

  const b64String = authorization.replace("Basic ", "");
  const decoded = Base64.decode(b64String);
  const [username, password] = decoded.split(":");

  if (password !== "supersecret") return { authorized: false };
  return { authorized: true, username };
}
