# Initbot

![](https://github.com/obrassard/initbot/workflows/Node%20CI/badge.svg)

**Initbot is a powerful CLI built with Node.JS that allows you to create and initialize GitHub Repositories in seconds to optimize your development workflow.**

For the moment these are the available features :

- Creation of private and public repositories
- Possibility to automatically create a development branch
- Possibility to protect the develop and master branches automatically
- Initiate a new repository and generate a.gitignore file
- Initiate a new repo using a repo model
- Create aliases of repo templates to facilitate memorization
- Invite employees to the new repo
- Possibility to add a description to the repo
- Interactive CLI mode 

***:bulb: Note : This is a work in progress! The current version is operational, but a more stable version is on the way !***

> This project was inspired by : [sitepoint-editors/ginit](https://github.com/sitepoint-editors/ginit)

## Requirements

* [Node.js](http://nodejs.org/)
* [Git](https://git-scm.com/)
* [A GitHub account](https://github.com/)
* A SSH key linked to your GitHub account :warning: **Important**

## Getting started

1. Install Initbot with NPM

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

## Manual

```sh
initbot [<repo-name> [-d "description"] [-c user1,user2] [-t owner/repo] [-p] [-b] [-u]] 
[--alias [aliasName=template/owner]] [--rm aliasName] [--logout] [--help]

repo-name   The name of the repo to create
-d          Add a description
-c          Invite colaborators (comma separated usernames)
-t          Use a repository template (owner/repo or @aliasName) 
-p          Public repositroy (default: private) 
-u          Disable automatic branches protection
-b          Do not create a develop branch

--alias                         Show all template aliases
--alias aliasName=owner/repo    Create a new alias mapped to owner/repo
--rm aliasName                  Delete a specific alias

--logout    Disconnect your GitHub Account from Initbot
--help      Show this help page
```

:sparkles: More details and examples to come soon ! :sparkles: 

<!-- 
### Parameters 
|  Parameter      | Description | Exemple |
| --------------- | ----------- | ------- |
|  Parameter Name | Description | Exemple | -->
