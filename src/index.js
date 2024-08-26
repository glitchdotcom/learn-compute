/**
 * THIS COMPUTE CODE RUNS ON THE FASTLY EDGE
 *
 * When the visitor makes a request for the deployed site
 *  - Compute code grabs the user location from the request IP address
 *  - Makes the request to the origin for the site content
 *  - Adds a cookie to the response
 *  - Sends a synthetic 404 page
 *  - Password protects some pages
 *  - Renders JSON as HTML
 */

// Get your own remix of the origin site at fastly-compute-starter.glitch.me

import { getGeolocationForIpAddress } from "fastly:geolocation";
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
    where =
      geo.city.charAt(0).toUpperCase() +
      geo.city.slice(1).toLowerCase() +
      " " +
      geo.country_code;

    // 🚧 🚧 🚧 Add the code from Step 3 in the Glitch README on the next line 🚧 🚧 🚧

    // Grab the auth header
    const authorizationHeader = req.headers.get("authorization");
    req.headers.delete("authorization");

    // Build a new request
    req = new Request(url, req);

    //Get the origin response
    let originResponse = await fetch(req, {
      backend: "glitch",
    });

    // Homepage response adds a location cookie
    if(req.url.pathname=="/") {
      // Find out which pop delivered the response
      let pop = originResponse.headers.get("x-served-by");
      pop = pop.substring(pop.lastIndexOf("-") + 1);

      // Tag the response with a cookie including the user location
      originResponse.headers.set(
        "Set-Cookie",
        "location=" +
          greeting +
          " This reponse was delivered by the Fastly " +
          pop +
          " POP for a request from " +
          where +
          "; SameSite=None; Secure"
      );
    }
    // Return a synthetic page if the origin returns a 404
    if (originResponse.status === 404) {
      originResponse = new Response(
        getSynthPage(
          "⚠️ 404 ⚠️",
          "WELP the page you requested can't be found.."
        ),
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
        originResponse = new Response(
          getSynthPage(
            "⛔️ Unauthorized ⛔️",
            "OOPS you need to login to see this page.."
          ),
          {
            status: 401,
            headers: new Headers([
              ["WWW-Authenticate", 'Basic realm="Private page"'],
              ["Content-Type", "text/html"],
            ]),
          }
        );
      } else console.log(username + " viewed a secret page");
    } 
    // Check for JSON data
    if (url.pathname.endsWith(".json")) {
      
      let data = await originResponse.json();
      // The default Glitch origin includes a field called "information"
      let content = data.information
        ? `<table><tr><td>Information:</td><td>` +
          data.information +
          `</td></tr></table>`
        : `<pre>` + JSON.stringify(data, null, 2) + `</pre>`;
      originResponse = new Response(getSynthPage("📊 DATA 📊", content), {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      });
    } 

    return originResponse;
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Helper function to check login
function authorize(authorization) {
  if (!authorization) {
    return { authorized: false };
  }

  const b64String = authorization.replace("Basic ", "");
  const decoded = atob(b64String);
  const [username, password] = decoded.split(":");

  // 🔐 THIS IS THE PASSWORD 🔐
  if (password !== "supersecret") return { authorized: false };
  return { authorized: true, username };
}

// The synthetic page is tailored to the Glitch origin so tweak to suit your site!
function getSynthPage(heading, message) {
  // The default Glitch origin has a stylesheet called "style.css"
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${heading}</title>
    <link rel="stylesheet" href="style.css"/>
  </head>
  <body>
    <div class="wrapper">
    <div class="content">
    <h1>${heading}</h1>
    <p>${message}</p>
    <p>Go to <a href="/">the homepage</a></p>
    </div></div>
  </body>
</html>`;
}
