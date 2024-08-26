# Learn about edge computing with Fastly and Glitch

You can use the code in this project to set up a Fastly compute service using a default Glitch origin website.

## Demo

You can explore an example of what this starter does at [fastly-compute-starter.edgecompute.app](https://fastly-compute-starter.edgecompute.app)

* It sends a location cookie with the response including some info about the Fastly POP handling the request
  * _The Glitch origin writes it into the page_
* It returns a synthetic 404 page if the origin website returns a Not Found error
  * _Try it at [fastly-compute-starter.edgecompute.app/ohno](https://fastly-compute-starter.edgecompute.app/ohno)_
* It password protects any page that starts with "p"
  * _Try it at [fastly-compute-starter.edgecompute.app/private](https://fastly-compute-starter.edgecompute.app/private) entering any username and the password `supersecret` or clicking the **Cancel** button_
* It renders JSON data as an HTML page
  * _Try it at [fastly-compute-starter.edgecompute.app/data.json](https://fastly-compute-starter.edgecompute.app/data.json)_
* The Glitch origin also tweaks the style a little at the edge

## Setup

Try the starter app out in Glitch by remixing [~fastly-compute-starter](https://glitch.com/~fastly-compute-starter) and popping a Fastly API key into the environment.

Alternatively develop with the project locally by [installing the Fastly tools](https://www.fastly.com/documentation/guides/compute/) and starting a new compute project.

Create a new directory and navigate to it in your Terminal.

Start a new compute project using this app as a template:

```
fastly compute init --from=https://github.com/glitchdotcom/learn-compute/
```

> 💡 Include the flag `--accept-defaults` if you don't want to choose all the details.

Install dependencies: `npm install`

By default the edge app will use `fastly-compute-starter.glitch.me` as its origin, but you can change it to use your own site. 

> 🎏 Remix the Glitch project and it'll automatically set your remix as the origin!

Once you have the repo installed locally and your API token set up in your environment, use the publish command to deploy the app to a compute service:

```
fastly compute publish
```

When prompted to add a "backend" you can use the default Glitch app or enter an origin website of your choice.

![Choose a backend](https://github.com/user-attachments/assets/83cee318-5601-4279-8337-d1b990634d68)

> 🎏 You'll find the commands in the Glitch project `package.json` and can use `npm run publish` as a shortcut in the Glitch editor.

In your deployed site check out the changes Fastly makes to the request and response at the edge:

* Open the dev tools and find the `location` cookie
* Navigate to a page that doesn't exist, like `/ohno`
* Navigate to a path beginning with "p" like `/private`
* Navigate to a path that returns JSON like `/data.json`

### Edit your code 

Try including a greeting that indicates the user's time of day – in the compute code you'll find a comment with 🚧 🚧 🚧 in it, add the following code after it:

```
// Let's get the time of day and find out how far from UTC it is
let displayTime = new Date().getHours();
let offset = geo.utc_offset;
displayTime += offset / 100;
    
// Tailor the greeting to the user time of day
greeting =
  displayTime > 4 && displayTime < 12
    ? "Morning!"
    : displayTime >= 12 && displayTime < 18
    ? "Afternoon!"
    : "Evening!"; 
```

Once you've finished editing your compute code, enter `npm run publish` again and give it a minute to deploy your changes!

## Help

[Get help on the Fastly community forum!](https://community.fastly.com)
