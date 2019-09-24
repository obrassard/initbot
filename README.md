# Initbot

> TODO Project description

> This project was inspired by : [sitepoint-editors/ginit](https://github.com/sitepoint-editors/ginit)

## Requirements

* [Node.js](http://nodejs.org/)
* [Git](https://git-scm.com/)
* [A GitHub account](https://github.com/)
* A SSH key linked to your GitHub account

## Getting started

1. Install initbot from NPM

```
npm install -g @obrassard/initbot --registry=https://npm.pkg.github.com/obrassard
```

2. Make sure you've added a local SSH key to your GitHub account. This is required to clone and push repos.

(Learn more here : [Connecting to GitHub with SSH](https://help.github.com/en/articles/connecting-to-github-with-ssh)) 



## Installation Steps (for dev purpose)

1. Clone repo
2. Run `npm install`
3. Install the module globally with `npm run global`
4. Run `initbot`

### npm scripts 

`npm start` : build TypeScript files and run the app

`npm run dev` : run the app using ts-node

`npm run dist` : compile TypeScript for release

`npm run watch` : use nodemon to watch change in real time

`npm run clean` : delete compiled js files

`npm run global` : compile TypeScript and install the package globally.

## Usage

```
--alias alias=test
--rm alias

-t template/owner

-d "description"
-c user1,user2
-f setting.json
-b -> no develop
-u -> no protection
-p -> public

--logout

--help -> show help
```