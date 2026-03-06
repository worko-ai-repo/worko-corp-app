
1. Pause Agency Invite
   [PATCH] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/agency-invite/action-type`
   ```json
   {
      "inviteAction":"PAUSE",
      "agencyInviteId": "string",
      "reason":"..",
      "detailedDescription":"..",
   }
   ```

2. Resume Agency Invite
   [PATCH] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/agency-invite/action-type`
   ```json
   {
      "inviteAction":"RESUME",
      "agencyInviteId": "string",
      "reason":"..",
      "detailedDescription":"..",
   }
   ```

3. Delete Agency Invite
   [PATCH] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/agency-invite/action-type`
   ```json
   {
      "inviteAction":"DELETE",
      "agencyInviteId": "string",
      "reason":"..",
      "detailedDescription":"..",
   }
   ```
