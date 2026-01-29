

1. Create cv recharge plans by admin 
[POST] `{{worko-corp-base-url}}/agency-cv-recharge-package/`
```json
// Request Payload
{
  /**
   * @description
   *  1. Amount per CV user needs to pay
   *  2. For one cv user need to pay 15 rupees
   * @example 15
   */
  "amountPerCv": 15,

  /**
   * @description
   *  1. Total CV count user will get on recharge
   * @example 200
   */
  "totalCvCount": 10000,

  /**
   * @description
   *  1. Whether this package is active for purchase
   */
  "isActiveForPurchase": true

  /**
   * @description
   *  1. Description of the package
   */
  // "description": "string"
}
```
2. Create below collections in `worko-corp-db-prod`
```sh
agencyCvRechargePackages
agencyCvRechargeOrders
agencyCvCreditTransactions
agencyCvWallets
agencyCvDebitTransactions
```


# Deployments
1. Take a pull, install dependencies, populate ".env.prod" to ".env" from `dev` branch of `worko-corp-app` repository
2. `worko-auth` lambda from aws console
