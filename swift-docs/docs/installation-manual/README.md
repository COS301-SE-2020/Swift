---
sidebar: auto
---

# Installation Manual

## Customer Application

The customer application is built with Vue.js using Vuetify's UI components. The application is a PWA (Progressive Web Application) which uses the Capacitor framework to turn the web app into a native app that can run one app across Android, IOS, Electron, and the Web with the same code base.


* **How to install and run the customer application locally:**
``` sh
# Clone the repo
git clone https://github.com/COS301-SE-2020/Swift.git

# Navigate to the app directory
cd *./swift-app

# install all the project dependencies
npm install

# install vue cli
npm install -g @vue/cli

# run the application
npm run serve (open up browser at http://localhost:8080/)
```

* **How to build the customer application:**
``` sh
# build the vue app to a dist folder
npm run build

# copy over the dist folder to the platforms using capacitor
npx cap copy

# open up the platform to build the .apk
npx cap open android OR npx cap open ios (once the platform is open you can build an .apk)
```

::: tip
The AR(Augmented Reality) component requires Android version >= 8
:::

## Management Application
The management application uses the same technology stack as the customer application and includes the Vuesax UI library to build the UI components

**How to install and run the management application locally**
``` sh
# Clone the repo
git clone https://github.com/COS301-SE-2020/Swift.git

# Navigate to the app directory
cd */management-app

# install all the project dependencies
npm install

# install vue cli
npm install -g @vue/cli

# run the application
npm run serve (open up browser at http://localhost:8080/)
```

**How to build the management application**
``` sh
# build the vue app to a dist folder
npm run build

# copy over the dist folder to the platforms using capacitor
npx cap copy

# open up the platform to build the .apk
npx cap open android OR npx cap open ios (once the platform is open you can build an .apk)
```

::: tip
Only admin users can access this application
:::

## Swift API
The Swift API is built with Node.js and uses a PostgreSQL database.

**How to  run the api locally**
``` sh
# Clone the repo
git clone https://github.com/COS301-SE-2020/Swift.git

# Navigate to the app directory
cd */api

# install all the project dependencies
npm install

# run the application
npm start (open up browser at http://localhost:3264/)
```

::: tip
Uses a PostgreSQL database
:::

