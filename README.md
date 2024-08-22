# Learn about edge computing with Fastly and Glitch

You can use the code in this project to set up a Fastly compute service using a default Glitch origin website.

## Demo

You can see an example of what this starter does at [fastly-compute-starter.edgecompute.app](https://fastly-compute-starter.edgecompute.app)

* It sends a location cookie with the response including some info about the Fastly POP handling it
  * The Glitch origin writes it into the page, if you're using your own site you'll find it in the site headers using your browser dev tools
* It returns a synthetic 404 page if the origin website returns a Not Found error
  * Try it at [fastly-compute-starter.edgecompute.app/ohno](https://fastly-compute-starter.edgecompute.app/ohno)
* It password protects any page that starts with "p"
  * Try it at [fastly-compute-starter.edgecompute.app/private](https://fastly-compute-starter.edgecompute.app/private) entering any username and the password `supersecret`

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

> 💡 You can use the `init` command to bring this compute project into other Glitch projects. Just copy any dependencies in the `package.json` into your project `package.json` `devDependencies` list.

Once you have the repo installed locally and your API token set up in your environment, use the command `fastly compute publish` to deploy the app to a compute service.

> 🎏 You'll find the commands in the Glitch project `package.json` and can use `npm run publish` as a shortcut.

## Help

[Get help on the Fastly community forum!](https://community.fastly.com)
