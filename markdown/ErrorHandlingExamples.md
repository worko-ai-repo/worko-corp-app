

1. 
```json
{
   "errorCode": 500,
   "errorMsg": "Could not load the default credentials. Browse to https://cloud.google.com/docs/authentication/getting-started for more information.",
   "timeStamp": "2025-10-29T09:07:24.756Z"
}
```

2. 
```json
{
   "errorCode": 500,
   "errorMsg": "7 PERMISSION_DENIED: Permission denied on resource project 36911887802.",
   "timeStamp": "2025-10-29T12:37:03.946Z"
}
```
```json
{
  "error": {
    "code": 7,
    "details": "Permission denied on resource project 36911887802.",
    "domain": "googleapis.com",
    "errorInfoMetadata": {
      "consumer": "projects/36911887802",
      "containerInfo": "36911887802",
      "service": "firestore.googleapis.com"
    },
    "metadata": {
      "google.rpc.errorinfo-bin": [
        {
          "data": [10, 16, 67],
          "type": "Buffer"
        }
      ],
      "google.rpc.help-bin": [
        {
          "data": [10, 66, 10],
          "type": "Buffer"
        }
      ],
      "google.rpc.localizedmessage-bin": [
        {
          "data": [10, 5, 101],
          "type": "Buffer"
        }
      ],
      "grpc-status-details-bin": [
        {
          "data": [8, 7, 18],
          "type": "Buffer"
        }
      ],
      "x-debug-tracking-id": ["14446558079885841586;o=1"]
    },
    "note": "Exception occurred in retry method that was not classified as transient",
    "reason": "CONSUMER_INVALID",
    "statusDetails": [
      {
        "domain": "googleapis.com",
        "metadata": {
          "consumer": "projects/36911887802",
          "containerInfo": "36911887802",
          "service": "firestore.googleapis.com"
        },
        "reason": "CONSUMER_INVALID"
      },
      {
        "locale": "en-US",
        "message": "Permission denied on resource project 36911887802."
      },
      {
        "links": [
          {
            "description": "Google developers console",
            "url": "https://console.developers.google.com"
          }
        ]
      }
    ]
  }
}
```


3. 
```json
{
    "errorCode": 500,
    "errorMsg": "5 NOT_FOUND: ",
    "timeStamp": "2025-10-29T13:06:36.819Z"
}
```
```json
{
  "error": {
    "code": 5,
    "details": "",
    "metadata": {
      "x-debug-tracking-id": ["8023488023995321271;o=1"]
    },
    "note": "Exception occurred in retry method that was not classified as transient"
  },
}

```


4. 
```json
{
   "Message": "User is not authorized to access this resource because no identity-based policy allows the execute-api:Invoke action"
}
```