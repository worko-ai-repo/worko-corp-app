
# worko-corp-base-url: https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev

1. List different types of packages
[GET] '{{worko-corp-base-url}}/agency-cv-recharge-package/?sortOrder=asc'
```json
{
    "data": [
        {
            "id": "01KFMMF02B7D9152RB4HJW6GG7",
            "createdAt": "2026-01-23T05:15:35.837+00:00",
            "updatedAt": "2026-01-23T05:15:35.837+00:00",
            "amountPerCv": 15,
            "totalCvCount": 200,
            "totalAmount": 3000,
            "isActiveForPurchase": true,
            "createdByUserId": "REDACTED_SECRET"
        },
        {
            "id": "01KFMMGN8R9W1W998NGJ90WC61",
            "createdAt": "2026-01-23T05:16:30.360+00:00",
            "updatedAt": "2026-01-23T05:16:30.360+00:00",
            "amountPerCv": 15,
            "totalCvCount": 300,
            "totalAmount": 4500,
            "isActiveForPurchase": true,
            "createdByUserId": "REDACTED_SECRET"
        },
        {
            "id": "01KFMMJFH3714F69WH0MZDBN69",
            "createdAt": "2026-01-23T05:17:30.019+00:00",
            "updatedAt": "2026-01-23T05:17:30.019+00:00",
            "amountPerCv": 15,
            "totalCvCount": 400,
            "totalAmount": 6000,
            "isActiveForPurchase": true,
            "createdByUserId": "REDACTED_SECRET"
        },
        {
            "id": "01KFMMJMKHYZTBQD91FCB33BWV",
            "createdAt": "2026-01-23T05:17:35.217+00:00",
            "updatedAt": "2026-01-23T05:17:35.217+00:00",
            "amountPerCv": 15,
            "totalCvCount": 500,
            "totalAmount": 7500,
            "isActiveForPurchase": true,
            "createdByUserId": "REDACTED_SECRET"
        },
        {
            "id": "01KFMMKGN2TQJAFRJ38JE3Q59K",
            "createdAt": "2026-01-23T05:18:03.938+00:00",
            "updatedAt": "2026-01-23T05:18:03.938+00:00",
            "amountPerCv": 15,
            "totalCvCount": 700,
            "totalAmount": 10500,
            "isActiveForPurchase": true,
            "createdByUserId": "REDACTED_SECRET"
        },
        {
            "id": "01KFMMMB8W5DVPXW8C5HP4MQQM",
            "createdAt": "2026-01-23T05:18:31.196+00:00",
            "updatedAt": "2026-01-23T05:18:31.196+00:00",
            "amountPerCv": 15,
            "totalCvCount": 1000,
            "totalAmount": 15000,
            "isActiveForPurchase": true,
            "createdByUserId": "REDACTED_SECRET"
        },
        {
            "id": "01KFMMMJB383T86AV99ZS1Q680",
            "createdAt": "2026-01-23T05:18:38.435+00:00",
            "updatedAt": "2026-01-23T05:18:38.435+00:00",
            "amountPerCv": 15,
            "totalCvCount": 1200,
            "totalAmount": 18000,
            "isActiveForPurchase": true,
            "createdByUserId": "REDACTED_SECRET"
        },
        {
            "id": "01KFMMMRV860042JG4WY05ZMB2",
            "createdAt": "2026-01-23T05:18:45.095+00:00",
            "updatedAt": "2026-01-23T05:18:45.095+00:00",
            "amountPerCv": 15,
            "totalCvCount": 1500,
            "totalAmount": 22500,
            "isActiveForPurchase": true,
            "createdByUserId": "REDACTED_SECRET"
        },
        {
            "id": "01KFMMN2BMWRSTNH6AN6BKYG32",
            "createdAt": "2026-01-23T05:18:54.836+00:00",
            "updatedAt": "2026-01-23T05:18:54.836+00:00",
            "amountPerCv": 15,
            "totalCvCount": 2000,
            "totalAmount": 30000,
            "isActiveForPurchase": true,
            "createdByUserId": "REDACTED_SECRET"
        },
        {
            "id": "01KFMMNA0Q34DBV9GKW91FXPRZ",
            "createdAt": "2026-01-23T05:19:02.679+00:00",
            "updatedAt": "2026-01-23T05:19:02.679+00:00",
            "amountPerCv": 15,
            "totalCvCount": 3000,
            "totalAmount": 45000,
            "isActiveForPurchase": true,
            "createdByUserId": "REDACTED_SECRET"
        }
    ],
    "pagination": {
        "count": 10,
        "pageSize": 10,
        "lastKey": "REDACTED_SECRET"
    }
}
```

2. List `Credit` transactions history
[GET] {{worko-corp-base-url}}/agency-cv-credit-transaction/?agencyUserId=712EEWMW5HE3NE9K8DGRXXTR53
```json
{
    "data": [
        {
            "id": "01JWAQF1G96E0SE9XHXSFGHXXX",
            "createdAt": "2025-09-16T07:15:51.838+00:00",
            "updatedAt": "2025-09-16T07:15:51.838+00:00",
            "agencyRegisteredEmail":"..",
            "agencyUserId": "712EEWMW5HE3NE9K8DGRXXTR53",
            "cvCount": 200,
            "amount": 3000,
            "agencyCvRechargeOrderId": "test"
        }
    ],
    "pagination": {
        "count": 1,
        "pageSize": 10
    }
}
```

3. List `Debit` transactions history
[GET] {{worko-corp-base-url}}/agency-cv-debit-transaction/?agencyUserId=712EEWMW5HE3NE9K8DGRXXTR53
```json
{
    "data": [
        {
            "id": "01JWAQF1G96E0SE9XHXSFGHXXX",
            "createdAt": "2025-09-16T07:15:51.838+00:00",
            "updatedAt": "2025-09-16T07:15:51.838+00:00",
            "agencyRegisteredEmail":"..",
            "agencyUserId": "712EEWMW5HE3NE9K8DGRXXTR53",
            "cvUsed": 60,
            "agencyBulkJdId": "test"
        }
    ],
    "pagination": {
        "count": 1,
        "pageSize": 10
    }
}
```

4. Get agency balance cvs count
[GET] {{worko-corp-base-url}}/agency-cv-wallet/:agencyUserId
```json
{
   "id": "01JWAQF1G96E0SE9XHXSFGHXXX",
   "createdAt": "2025-09-16T07:15:51.838+00:00",
   "updatedAt": "2025-09-16T07:15:51.838+00:00",
   "agencyRegisteredEmail":"..",
   "agencyUserId": "712EEWMW5HE3NE9K8DGRXXTR53",
  /**
   * @description total count of cvs available to use by agency
   */
  totalAvailableCvCount: number;

  /**
   * @description count of lifetime CV usage
   */
  totalUsedCvCount: number;

  /**
   * @description
   */
  totalAmountPaid: number;

  /**
   * @description ISO date of last successful recharge
   */
  lastRechargeDate: string;

  /**
   * @description ISO date of last CV usage
   */
  lastCvDeductionDate?: string;

  /**
   * @description Count of successful recharges
   */
  totalRecharges: number;

  updatedByAgencyUserId?: string;
}
```


5. Wheneve agency clicks pay button
[POST] `{{worko-corp-base-url}}/agency-cv-recharge-order/create`
```json
// Payload
{
   
   agencyCvRechargePackageId: string; // id attribute of this api:- '{{worko-corp-base-url}}/agency-cv-recharge-package/?sortOrder=asc'

   paymentGatewayProvider: "RAZORPAY",
}
```
```json
// Response
{
   id: ..,
   createdAt:...,
   updatedAt:..,
  // Agency reference
  agencyUserId: string; // Reference to AgencyUser.id
  agencyRegisteredEmail: string;

  // Order details
  agencyCvRechargePackageId: string;

  /**
   * @note This `cvCount` and `amount` are at the time of order creation,
   * in near future if admin updates `cvCount` or `amount` in agencyCvRechargePackageId then
   * dont update `cvCount` and `amount` here.
   * 
   * These `cvCount` and `amount` will be used for tracking that the agency paid this many CV credits with this amount.
   */
  cvCount: number; // Number of CV credits
  amount: number; // Amount in rupees

  // Payment gateway details
  paymentGatewayProvider: PaymentGatewayProviderEnum; // "RAZORPAY"
  paymentGatewayOrderId: string; // Razorpay order ID
  paymentGatewayOrderStatus: RazorpayPaymentOrderStatusEnum;
  paymentGatewayCreatedOrderDetails: Orders.RazorpayOrder;
  paymentGatewayUpdatedOrderDetails?: Orders.RazorpayOrder;

  // Payment completion details (set after payment)
  paymentId?: string; // Razorpay payment ID
  paymentGatewayVerificationDetails?: RazorpayPaymentVerificationDTO;

  updatedByAgencyUserId?: string;
}
```


6. Refer below documentation for paying amount
```ts
/**
 * @see https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/#13-add-checkout-options
 */
```

7. Verify payment success or not
[POST] `/agency-cv-recharge-order/verify-payment`
```json
// payload
paymentGatewayProvider: "RAZORPAY",
paymentGatewayVerificationDetails: {
  razorpay_payment_id: string; // "pay_29QQoUBi66xm2f";
  razorpay_order_id: string; // "order_9A33XWu170gUtm";
  razorpay_signature: string; // "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d";
}
```