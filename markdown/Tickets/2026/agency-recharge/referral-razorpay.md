
1. 
Request URL https://api.dev.worko.work/user/rohithappala999+cand97@gmail.com/referral/request
Request Method POST


2. 
Request URL https://api.dev.worko.work/user/rohithappala999+cand97@gmail.com/subscription/status
Request Method GET

3. 
Request URL https://api.dev.worko.work/user/rohithappala999+cand97@gmail.com/subscription
Request Method GET
```json
// Response
[
   {
      "acceptedReferrals": 0,
      "availableReferrals": 0,
      "completedReferrals": 0,
      "creditedReferrals": 1,
      "expiryDate": "2026-02-20T08:30:28.101Z",
      "name": "Free",
      "purchaseDate": "2026-01-21T08:30:28.101Z",
      "requestedReferrals": 1,
      "status": "USED"
   }
]
```

4. 
Request URL https://api.dev.worko.work/user/rohithappala999+cand97@gmail.com/details
Request Method GET
```json
// Response
{
   // ...
   "PK": "USR#EML#rohithappala999+cand97@gmail.com",
   "isSubscribed": false,
   "referralCount": 0,
   // ...
}
```

5. 
Request URL https://api.dev.worko.work/msubscription/plans
Request Method GET
```json
// Response
[
    {
        "SK": "TYPE#CAND#ID#01HZME76M6EKQD3VR2C15FCV89",
        "name": "Free",
        "amount": 0,
        "duration": 30,
        "referralCount": 1,
        "details": "This free subscription plan provides access to basic features for a duration of 30 days",
        "isActive": true
    },
    {
        "SK": "TYPE#CAND#ID#01HZME7XA1GDJ78D5WNPN0TN0B",
        "name": "Maximiser",
        "amount": 999,
        "duration": 60,
        "referralCount": 25,
        "details": "The Maximiser subscription plan, priced at ₹999.00, receive a referral count of 25 for a duration of 60 days",
        "isActive": true
    },
    {
        "SK": "TYPE#CAND#ID#01HZME83KHXHPVWWJ0HZRAB1EV",
        "name": "Accelerator",
        "amount": 499,
        "duration": 60,
        "referralCount": 10,
        "details": "The Accelerator subscription plan, priced at ₹499.00, receive a referral count of 10 for a duration of 60 days",
        "isActive": true
    },
    {
        "SK": "TYPE#CAND#ID#01HZME8A9RHW89DK12CD4D9A87",
        "name": "Starter",
        "amount": 199,
        "duration": 30,
        "referralCount": 3,
        "details": "The Starter subscription plan, priced at ₹199.00, receive a referral count of 3 for a duration of 30 days",
        "isActive": true
    }
]
```


6. 
Request URL https://api.dev.worko.work/user/11731d9a-c0a1-7064-c9c8-4b6b0abf002f/order/create
Request Method POST
```json
{
  "pgatewayProvider": "RAZORPAY",
  "subTotalAmount": 999,
  "discountAmount": 0,
  "gstAmount": 0,
  "orderType": "SUBS",
  "returnUrl": "https://api.dev.worko.work/v1/candidate/pgresponse/RAZORPAY",
  "products": [
    {
      "productContext": "SUBS",
      "productContextId": "TYPE#CAND#ID#01HZME7XA1GDJ78D5WNPN0TN0B",
      "productContextDetails": {
        "details": "The Maximiser subscription plan, priced at ₹999, receive a referral count of 25 for a duration of 60"
      },
      "unitPrice": 999,
      "quantity": 1,
      "totalAmount": 999
    }
  ]
}
```
```json
{
    "userOrderResponse": {
        "pgatewayProvider": "RAZORPAY",
        "userEmail": "rohithappala999+cand97@gmail.com",
        "orderId": "01KFFVHMNAKT47TYXN1CQNA9YZ",
        "orderType": "SUBS",
        "orderTxnId": "01KFFVHMPHAPGHMPP1623GJYND",
        "workoPgatewayOrderId": "01KFFVHMNAKT47TYXN1CQNA9YZw01KFFVHMPHAPGHMPP1623GJYND",
        "pgatewayOrderId": "order_S6T00ad3pL7wA6",
        "pgatewayConfig": {},
        "pgatewayOrderResponse": {
            "amount": 19900,
            "amount_due": 19900,
            "amount_paid": 0,
            "attempts": 0,
            "created_at": 1768984991,
            "currency": "INR",
            "entity": "order",
            "id": "order_S6T00ad3pL7wA6",
            "notes": {
                "orderId": "01KFFVHMNAKT47TYXN1CQNA9YZ",
                "orderType": "SUBS",
                "transactionId": "01KFFVHMPHAPGHMPP1623GJYND",
                "userEmail": "rohithappala999+cand97@gmail.com",
                "userId": "11731d9a-c0a1-7064-c9c8-4b6b0abf002f"
            },
            "offer_id": null,
            "receipt": null,
            "status": "created"
        }
    },
    "gatewayOrderRequestPlainBody": {
        "amount": 19900,
        "currency": "INR",
        "payment_capture": 1,
        "notes": {
            "userEmail": "rohithappala999+cand97@gmail.com",
            "userId": "11731d9a-c0a1-7064-c9c8-4b6b0abf002f",
            "orderId": "01KFFVHMNAKT47TYXN1CQNA9YZ",
            "orderType": "SUBS",
            "transactionId": "01KFFVHMPHAPGHMPP1623GJYND"
        }
    }
}
```

7. 
Request URL
https://api.dev.worko.work/user/a1f39dda-2051-7057-46bc-e3748351f4e3/order/gatewayres
Request Method
POST
```json
// request payload
{
  "userId": "a1f39dda-2051-7057-46bc-e3748351f4e3",
  "orderType": "SUBS",
  "orderId": "01KFJ4YAH08PDWWR5TA5F26322",
  "orderTxnId": "01KFJ4YAJVTGWFATG7CQYE0WST",
  "pgatewayProvider": "RAZORPAY",
  "pgResponse": {
    "razorpay_payment_id": "pay_S6otGXpWf3SeJi",
    "razorpay_order_id": "order_S6oqxZbTiB2ZUn",
    "razorpay_signature": "d1e5f7cc9e45e9bbcfd5ca81096a7faaaab79743159551183fc4c20fa9cf7f44"
  }
}
```
```json
// response
{
    "orderTxn": {
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
        "pgatewayTxnId": "pay_S6otGXpWf3SeJi",
        "pgatewayOrderId": "order_S6oqxZbTiB2ZUn",
        "orderId": "01KFJ4YAH08PDWWR5TA5F26322",
        "pgatewayOrderRequest": {
            "payment_capture": 1,
            "amount": 99900,
            "currency": "INR",
            "notes": {
                "orderType": "SUBS",
                "userEmail": "rohithappala999+cand102@gmail.com",
                "userId": "a1f39dda-2051-7057-46bc-e3748351f4e3",
                "orderId": "01KFJ4YAH08PDWWR5TA5F26322",
                "transactionId": "01KFJ4YAJVTGWFATG7CQYE0WST"
            }
        },
        "subTotalAmount": 999,
        "pgatewayTxnPaymentMethodType": "upi",
        "GSI1SK": "ID#01KFJ4YAJVTGWFATG7CQYE0WST",
        "pgatewayTxnErrorCode": "",
        "pgatewayTxnErrorType": "",
        "SK": "ORDER#01KFJ4YAH08PDWWR5TA5F26322#TXN#01KFJ4YAJVTGWFATG7CQYE0WST",
        "id": "01KFJ4YAJVTGWFATG7CQYE0WST",
        "pgatewayTxnStatus": "captured",
        "pgatewayProvider": "RAZORPAY",
        "workoPgatewayOrderId": "01KFJ4YAH08PDWWR5TA5F26322w01KFJ4YAJVTGWFATG7CQYE0WST",
        "finalAmount": 999,
        "createdAt": "2026-01-22T06:05:52.091Z",
        "GSI1PK": "ORDER#TXN",
        "userIpAddress": "103.143.168.31",
        "gstAmount": 0,
        "pgatewayTxnErrorDesc": "",
        "discountAmount": 0,
        "updatedAt": "2026-01-22T06:08:19.953Z",
        "PK": "USR#EML#rohithappala999+cand102@gmail.com",
        "pgatewayOrderResponse": {
            "amount": 99900,
            "amount_paid": 0,
            "notes": {
                "orderType": "SUBS",
                "userEmail": "rohithappala999+cand102@gmail.com",
                "orderId": "01KFJ4YAH08PDWWR5TA5F26322",
                "userId": "a1f39dda-2051-7057-46bc-e3748351f4e3",
                "transactionId": "01KFJ4YAJVTGWFATG7CQYE0WST"
            },
            "created_at": 1769061952,
            "amount_due": 99900,
            "currency": "INR",
            "receipt": null,
            "id": "order_S6oqxZbTiB2ZUn",
            "entity": "order",
            "offer_id": null,
            "attempts": 0,
            "status": "created"
        },
        "pgatewayTxnResponse": {
            "notes": {
                "orderType": "SUBS",
                "userEmail": "rohithappala999+cand102@gmail.com",
                "userId": "a1f39dda-2051-7057-46bc-e3748351f4e3",
                "orderId": "01KFJ4YAH08PDWWR5TA5F26322",
                "transactionId": "01KFJ4YAJVTGWFATG7CQYE0WST"
            },
            "fee": 2358,
            "description": "The Maximiser subscription plan, priced at ₹999",
            "created_at": 1769062084,
            "amount_refunded": 0,
            "bank": null,
            "error_reason": null,
            "error_description": null,
            "acquirer_data": {
                "rrn": "789045669597",
                "upi_transaction_id": "80467A683E0F4CA3F9A56C51BC7F0047"
            },
            "captured": true,
            "contact": "+919666308100",
            "invoice_id": null,
            "currency": "INR",
            "id": "pay_S6otGXpWf3SeJi",
            "international": false,
            "email": "rohithappala999+cand102@gmail.com",
            "amount": 99900,
            "refund_status": null,
            "wallet": null,
            "method": "upi",
            "vpa": "88888888xxx@ybl",
            "error_source": null,
            "error_step": null,
            "tax": 360,
            "card_id": null,
            "upi": {
                "vpa": "88888888xxx@ybl",
                "flow": "collect"
            },
            "error_code": null,
            "order_id": "order_S6oqxZbTiB2ZUn",
            "entity": "payment",
            "status": "captured"
        }
    },
    "processRes": {
        "userId": "a1f39dda-2051-7057-46bc-e3748351f4e3",
        "orderId": "01KFJ4YAH08PDWWR5TA5F26322",
        "orderType": "SUBS",
        "orderTxnId": "01KFJ4YAJVTGWFATG7CQYE0WST",
        "pgatewayProvider": "RAZORPAY",
        "pgResponseDecrypted": {
            "id": "pay_S6otGXpWf3SeJi",
            "entity": "payment",
            "amount": 99900,
            "currency": "INR",
            "status": "captured",
            "order_id": "order_S6oqxZbTiB2ZUn",
            "invoice_id": null,
            "international": false,
            "method": "upi",
            "amount_refunded": 0,
            "refund_status": null,
            "captured": true,
            "description": "The Maximiser subscription plan, priced at ₹999",
            "card_id": null,
            "bank": null,
            "wallet": null,
            "vpa": "88888888xxx@ybl",
            "email": "rohithappala999+cand102@gmail.com",
            "contact": "+919666308100",
            "notes": {
                "userEmail": "rohithappala999+cand102@gmail.com",
                "userId": "a1f39dda-2051-7057-46bc-e3748351f4e3",
                "orderId": "01KFJ4YAH08PDWWR5TA5F26322",
                "orderType": "SUBS",
                "transactionId": "01KFJ4YAJVTGWFATG7CQYE0WST"
            },
            "fee": 2358,
            "tax": 360,
            "error_code": null,
            "error_description": null,
            "error_source": null,
            "error_step": null,
            "error_reason": null,
            "acquirer_data": {
                "rrn": "789045669597",
                "upi_transaction_id": "80467A683E0F4CA3F9A56C51BC7F0047"
            },
            "created_at": 1769062084,
            "upi": {
                "vpa": "88888888xxx@ybl",
                "flow": "collect"
            }
        }
    }
}
```



7. 
Request URL https://api.dev.worko.work/user/rohithappala999+cand97@gmail.com/subscription
Request Method POST
```json
{"masterSubscriptionId":"TYPE#CAND#ID#01HZME7XA1GDJ78D5WNPN0TN0B","orderId":"01KFJ4YAH08PDWWR5TA5F26322"}
```
```json
// Response
{
    "status": "ACTIVE",
    "orderId": "01KFJ4YAH08PDWWR5TA5F26322",
    "requestedReferrals": 0,
    "acceptedReferrals": 0,
    "completedReferrals": 0,
    "name": "Maximiser",
    "creditedReferrals": 25,
    "availableReferrals": 25,
    "expiryDate": 1774246100283,
    "purchaseDate": 1769062100283,
    "PK": "USR#EML#rohithappala999+cand102@gmail.com",
    "SK": "SUBS#CAND#ID#01KFJ52VBGG0V23HMZGMX3RNA9",
    "GSI1PK": "SUBS#CAND#",
    "GSI1SK": "ID#01KFJ52VBGG0V23HMZGMX3RNA9",
    "id": "01KFJ52VBGG0V23HMZGMX3RNA9",
    "createdAt": 1769062100336,
    "updatedAt": 1769062100336
}
```