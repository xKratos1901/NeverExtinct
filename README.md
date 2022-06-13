# NeverExtinct - Contracts

## For local deploy

```shell
cp .env.example .env
npm run compile
npm run chain
```

> in another terminal window

```shell
npm run deploy:local
```

## For Testnet deploy

```shell
cp .env.example .env

```

**Insert your alchemy api key, add deployer private key**

> in another terminal window

```shell
npm run compile
npm run deploy:goerli
```
