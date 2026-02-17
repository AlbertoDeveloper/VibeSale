# VibeSale
POS for jewlery store

```mermaid
flowchart LR
  %% Cliente / Punto de venta
  subgraph CLIENTE[Interfaces]
    POS[POS multiplataforma]
    TIENDA_EN_LINEA[Catálogo en línea]
    ADMIN_PANEL[Panel administrativo]
  end

  %% API y permisos
  subgraph ACCESO[Gestión de acceso]
    API_GW(API Gateway)
    ROLES[Gestor de roles y permisos]
    USERS[Gestor de usuarios]
  end

  %% Núcleo de servicios
  subgraph SERVICIOS[Servicios y módulos]
    CATLG[Módulo Catálogo]
    LABELS[Módulo de etiquetas]
    DISPO[Integración dispositivos]
    MULTIMONEDA[Módulo multi‑moneda]
    CAJA[Módulo cortes de caja]
    FACTURAS[Facturación CFDI]
    ALMACENES[Manejo de almacenes]
    SUCURSALES[Manejo de sucursales]
    COMPRAS[Registro de compras]
    DESCUENTOS[Gestor de descuentos]
    REPORTES[Reportes y estadísticas]
    CREDITOS[Créditos compartidos]
    CATEGORIAS[Categorías/Departamentos]
    IMPORTACION[Importación desde Excel]
    CLAVES[Claves múltiples]
    AJUSTE[Ajuste de inventario]
    VENTAS_VEND[Ventas por vendedor]
    PROVEEDORES[Registro de proveedores]
  end

  %% Datos
  subgraph DATOS[Base de datos / almacenamiento]
    DB[(BD relacional)]
    FILES[(Almacén de archivos)]
  end

  %% Integraciones externas
  subgraph EXTERNOS[Servicios externos]
    SAT[Servicio CFDI/SAT]
    WHATSAPP[Envío WhatsApp]
    EMAIL_SERV[Correo electrónico]
    HARDWARE[Hardware (impresoras, cajones, escáneres)]
  end

  %% Flujos de cliente a servicios
  POS --> API_GW
  TIENDA_EN_LINEA --> API_GW
  ADMIN_PANEL --> API_GW

  %% Autenticación y permisos
  API_GW --> ROLES
  API_GW --> USERS

  %% Acceso a módulos
  API_GW --> CATLG
  API_GW --> LABELS
  API_GW --> DISPO
  API_GW --> MULTIMONEDA
  API_GW --> CAJA
  API_GW --> FACTURAS
  API_GW --> ALMACENES
  API_GW --> SUCURSALES
  API_GW --> COMPRAS
  API_GW --> DESCUENTOS
  API_GW --> REPORTES
  API_GW --> CREDITOS
  API_GW --> CATEGORIAS
  API_GW --> IMPORTACION
  API_GW --> CLAVES
  API_GW --> AJUSTE
  API_GW --> VENTAS_VEND
  API_GW --> PROVEEDORES

  %% Módulos y datos
  CATLG --> DB
  LABELS --> DB
  DISPO --> HARDWARE
  MULTIMONEDA --> DB
  CAJA --> DB
  FACTURAS --> DB
  FACTURAS --> SAT
  FACTURAS --> EMAIL_SERV
  ALMACENES --> DB
  SUCURSALES --> DB
  COMPRAS --> DB
  DESCUENTOS --> DB
  REPORTES --> DB
  CREDITOS --> DB
  CATEGORIAS --> DB
  IMPORTACION --> FILES
  IMPORTACION --> DB
  CLAVES --> DB
  AJUSTE --> DB
  VENTAS_VEND --> DB
  PROVEEDORES --> DB

  %% Notificaciones y mensajería
  CATLG --> WHATSAPP
```