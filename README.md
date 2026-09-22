# Con Schedule

Events schedule web app based on public Eurofurence schedule API.

## Stack

- React + TypeScript + Vite
- styled-components
- @tanstack/react-query
- date-fns / date-fns-tz

## Getting started

```bash
npm install
npm run dev         # http://localhost:3003
npm run prettify    # run prettier across all files
npm run test        # run all tests once with coverage
npm run test:watch  # run tests and keep it listening for changes
npm run build       # type-check, build
```

## Configuration

Config with edition-specific fields such as identifier, API link, or the mock-data toggle is available in [schedule config file](config/schedule-config.json).
Currently `useMocks` uses bundled public EF30 schedule API response.
