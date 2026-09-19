# EF Schedule

Events schedule web app based on public Eurofurence schedule API.

## Stack

- React + TypeScript + Vite
- styled-components
- @tanstack/react-query
- date-fns / date-fns-tz

## Getting started

```bash
npm install
npm run dev      # http://localhost:3003
npm run test     # vitest
npm run build    # type-check + production build
```

## Configuration

Config with edition-specific fields such as identifier or API link is available in [schedule config file](config/schedule-config.json).
