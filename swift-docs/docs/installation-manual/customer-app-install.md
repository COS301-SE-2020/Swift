# Customer Application

### Customer Application Installation
**How to install and run the customer application locally**
``` sh
# Clone the repo
git clone https://github.com/COS301-SE-2020/Swift.git

# Navigate to the app directory
cd */swift-app

# install all the project dependencies
npm install

# install vue cli
npm install -g @vue/cli

# run the application
npm run serve (open up browser at http://localhost:8080/)
```

**How to build the customer application**
``` sh
# build the vue app to a dist folder
npm run build

# copy over the dist folder to the platforms using capacitor
npx cap copy

# open up the platform to build the .apk
npx cap open android OR npx cap open ios (once the platform is open you can build an .apk)
```

::: tip
AR requires Android >= 8
:::