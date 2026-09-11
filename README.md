# DATAVIDA — Sprint 3: Primer Incremento Funcional

Prototipo funcional que conecta un frontend en React con el
**Microservicio de Indicadores**, consumiendo datos del Índice de
Pobreza Multidimensional (IPM). Corresponde al entregable "Fase Web"
del Sprint 3.

## Estructura

```
datavida/
├── backend/
│   └── microservicio-indicadores/   # Express + arquitectura en capas
└── frontend/                        # React + Vite
```

## Cómo ejecutar en local

### 1. Backend (Microservicio de Indicadores)

```bash
cd backend/microservicio-indicadores
npm install
npm start
```

Queda escuchando en `http://localhost:4001`.
Endpoints disponibles:
- `GET /health`
- `GET /api/indicadores` (filtros opcionales: `municipioCodigo`, `indicadorId`, `periodo`)
- `GET /api/municipios`
- `GET /api/catalogo-indicadores`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Queda disponible en `http://localhost:5173`. Toma la URL del backend
desde el archivo `.env` (`VITE_API_URL`).

## Estado actual (prototipo)

- Los datos son de prueba (mock), almacenados en memoria en la capa
  Repository del backend. Aún no hay conexión a PostgreSQL/PostGIS.
- No incluye autenticación todavía (se agregará en un sprint
  posterior junto con el Microservicio de Autenticación).
- Los demás microservicios (Autenticación, Gestión de Datos,
  Analítica, IA, Reportes) no están implementados en este incremento.

## Próximos pasos sugeridos

- Reemplazar el Repository mock por consultas reales a PostgreSQL/PostGIS.
- Sumar el API Gateway y Docker Compose para levantar todo junto.
- Diagramas de Secuencia y Actividades del Sprint 3 (pendientes).
