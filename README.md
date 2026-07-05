# CourierOS

CourierOS is a launch-ready logistics platform with:

- A FastAPI backend for shipment, user, and delivery workflows
- A Next.js enterprise frontend scaffold for operations and marketing landing pages
- Expo mobile apps for driver and customer experiences

## Launch assets included

- `frontend/app/page.tsx`: Marketing-ready landing page for the CourierOS launch
- `frontend/app/launch-plan/page.tsx`: Launch checklist and product positioning
- `docs/product-launch-plan.md`: Launch plan documentation for stakeholders

## Quick start

1. Frontend development server
   ```bash
   npm --prefix frontend install
   npm --prefix frontend run dev
   ```

2. Mobile validation
   ```bash
   npm --prefix mobile install
   npm --prefix mobile run lint
   ```

3. Backend tests
   ```bash
   python -m pytest
   ```

## Notes

- The frontend landing page is styled with Tailwind CSS and built on Next.js App Router.
- The mobile app uses Expo, React Navigation, and React Query for app state.
- This repo now includes launch-ready marketing and product launch documentation.
