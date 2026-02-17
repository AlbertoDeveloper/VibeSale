# VibeSale

Web-based POS platform for a local jewelry business.

## Architecture

```mermaid
flowchart LR
  subgraph CLIENTE[Interfaces]
    POS[POS multiplatform]
    TIENDA[Online catalog]
    ADMIN[Admin panel]
  end

  subgraph ACCESO[Access management]
    API_GW[API Gateway]
    ROLES[Roles and permissions]
    USERS[Users]
  end

  subgraph SERVICIOS[System modules]
    CATLG[Catalog]
    LABELS[Labels]
    DISPO[Device integration]
    MULTI[Multi-currency]
    CAJA[Cash register closeout]
    CFDI[Electronic invoicing]
    ALMACEN[Warehouses]
    SUCUR[Branches]
    COMPRAS[Purchases]
    DESC[Discounts]
    REPORT[Reports and analytics]
    CREDIT[Shared credits]
    CATEG[Categories and departments]
    IMPORT[Bulk import]
    CLAVES[Multiple product codes]
    AJUSTE[Inventory adjustments]
    VENDED[Sales commissions]
    PROV[Suppliers]
  end

  subgraph DATOS[Data]
    DB[(Database)]
    FILES[(Files)]
  end

  subgraph EXTERNOS[External integrations]
    SAT[Invoicing service]
    MSG[Messaging]
    EMAIL[Email]
    HW[Devices: printers, drawer, scanner, touch]
  end

  POS --> API_GW
  TIENDA --> API_GW
  ADMIN --> API_GW
  API_GW --> ROLES
  API_GW --> USERS
  API_GW --> SERVICIOS
  SERVICIOS --> DB
  IMPORT --> FILES
  DISPO --> HW
  CFDI --> SAT
  CFDI --> EMAIL
  CATLG --> MSG
```

## Current implementation (Phase 1 foundation)

Implemented today as a working baseline:

- Shared TypeScript contracts for modules, catalog, quoting, currencies, access, and admin overview.
- API endpoints for module map, products, quotes, access snapshot, currencies, and overview metrics.
- React control hub with:
  - module status board,
  - product catalog sample,
  - quote generation form,
  - recent quote list.
- In-memory sample data seeded for jewelry workflows.

## API endpoints

- `GET /api/health`
- `GET /api/message`
- `GET /api/modules`
- `GET /api/currencies`
- `GET /api/access/snapshot`
- `GET /api/catalog/products`
- `GET /api/catalog/quotes`
- `POST /api/catalog/quotes`
- `GET /api/admin/overview`

## Run locally

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Suggested build order for next phases

1. Access gateway + auth (JWT/session + RBAC enforcement middleware).
2. Inventory core (warehouses, branches, stock movements, adjustments).
3. Sales flow (cart, closeout, discounts, commission assignment).
4. Purchases + suppliers + transfers.
5. Electronic invoicing (CFDI integration adapter).
6. Integrations (messaging, email, hardware bridge, bulk import).
7. Reporting and analytics module with persistent storage.

## Notes

- Data is currently in memory for rapid iteration.
- Next step is introducing persistent storage and migration tooling.
