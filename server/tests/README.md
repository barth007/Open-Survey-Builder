# Backend Tests

Run the backend suite with:

```bash
npm --prefix server test
```

Build the backend with:

```bash
npm --prefix server run build
```

## Scope

These tests exercise the Express app through Supertest and mock Prisma at the route/controller boundary. They are intended to catch security and contract regressions around:

- auth approval and rejected backdoors
- public survey access rules
- response-session and recording upload flow
- survey ownership validation
- invitations and team role invariants
- upload privacy and avatar MIME handling
- safe error responses

## Media Contract

- `POST /api/surveys/:surveyId/response-session`
  Returns `responseId`, `sessionToken`, and `status` for a persisted draft response.
- `POST /api/surveys/recordings/upload`
  Requires a real `responseId` plus a valid `sessionToken` for public respondents.
- `POST /api/surveys/respond`
  Finalizes the draft response instead of creating a second row when `responseId` and `sessionToken` are supplied.
- `GET /api/surveys/recordings/:id/file`
  Serves private recording media only to authorized survey managers.
