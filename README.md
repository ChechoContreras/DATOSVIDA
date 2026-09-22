# DATAVIDA — Proyecto Integrador II

Plataforma web para el análisis del Índice de Pobreza Multidimensional
(IPM) en municipios PDET de Colombia, construida con una arquitectura
de microservicios.

## Estructura

```
datavida/
├── backend/
│   ├── microservicio-indicadores/     # RF-09 Consultar indicadores        (puerto 4001)
│   ├── microservicio-autenticacion/   # RF-01 a RF-05, RF-16               (puerto 4002)
│   ├── microservicio-analitica/       # RF-11 Comparar, RF-12 Analisis     (puerto 4003)
│   ├── microservicio-ia/              # RF-13 Predicciones, RF-14 Recom.   (puerto 4004)
│   └── microservicio-reportes/        # RF-15 Generar y exportar reportes (puerto 4005)
└── frontend/                          # React + Vite
```

Analítica, IA y Reportes **no tienen base de datos propia**: consultan
al Microservicio de Indicadores por HTTP para obtener los datos ya
validados (así está descrito en el diagrama de comportamiento del
documento de Arquitectura Tecnológica). Por eso **el Microservicio de
Indicadores debe estar corriendo siempre** para que los otros tres
funcionen.

## Cómo ejecutar en local

Necesitas Node.js instalado. Cada servicio corre en su propia terminal.

```bash
# Terminal 1
cd backend/microservicio-indicadores && npm install && npm start      # puerto 4001

# Terminal 2
cd backend/microservicio-autenticacion && npm install && npm start    # puerto 4002

# Terminal 3
cd backend/microservicio-analitica && npm install && npm start        # puerto 4003

# Terminal 4
cd backend/microservicio-ia && npm install && npm start               # puerto 4004

# Terminal 5
cd backend/microservicio-reportes && npm install && npm start         # puerto 4005

# Terminal 6
cd frontend && npm install && npm run dev
```

Abre `http://localhost:5173`.

**Usuarios de prueba:**

| Correo                        | Contraseña      | Rol            |
|--------------------------------|-----------------|----------------|
| admin@datavida.gov.co         | Admin123!       | Administrador  |
| analista@datavida.gov.co      | Analista123!    | Analista       |
| usuario@datavida.gov.co       | Usuario123!     | Usuario        |

## Endpoints por microservicio

### Indicadores (4001)
- `GET /api/indicadores?municipioCodigo=&indicadorId=&periodo=`
- `GET /api/municipios`, `GET /api/catalogo-indicadores`, `GET /api/periodos`

### Autenticación (4002)
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/perfil`
- `GET|POST /api/usuarios`, `PUT /api/usuarios/:id`, `PATCH /api/usuarios/:id/estado` (solo Administrador)

### Analítica (4003)
- `POST /api/analitica/comparar` — body `{ municipios: [codigo1, codigo2, ...], indicadorId, periodo }`
- `POST /api/analitica/estadistico` — body `{ municipioCodigo?, indicadorId?, periodo?, tipoAnalisis: "estadisticas"|"correlacion", indicadorIdB? }`
- `GET /api/analitica/historial`

### Inteligencia Artificial (4004)
- `POST /api/ia/predicciones` — body `{ municipioCodigo, indicadorId, horizonte }` (años a predecir)
- `GET /api/ia/recomendaciones?municipioCodigo=&indicadorId=`
- `GET /api/ia/predicciones/historial`, `GET /api/ia/recomendaciones/historial`

  > **Nota de alcance:** no hay un modelo de machine learning entrenado
  > ni series históricas multi-año reales todavía. Este microservicio
  > implementa un modelo heurístico determinístico (`v1.0-heuristico`,
  > documentado en `src/model/iaModel.js`) que demuestra el flujo
  > completo de RF-13/RF-14 (contrato de API, validaciones, nivel de
  > confianza, umbral de calidad, trazabilidad). Debe reemplazarse por
  > un modelo real cuando existan datos históricos suficientes.

### Reportes (4005)
- `POST /api/reportes` — body `{ titulo, filtros: { municipioCodigo?, indicadorId?, periodo? }, formato: "pdf"|"excel" }` → descarga el archivo generado (PDF real con pdfkit, Excel real con exceljs)
- `GET /api/reportes/historial`

## Permisos por rol

Aplicados tanto en el menú lateral como en las rutas (si alguien
intenta entrar por URL directa a algo que no le corresponde, lo
redirige a Inicio):

| Pantalla | Administrador | Analista | Usuario |
|---|:---:|:---:|:---:|
| Inicio | ✅ | ✅ | ✅ |
| Indicadores | | ✅ | ✅ |
| Visualización (Mapa) | | ✅ | ✅ |
| Comparar | | ✅ | |
| Análisis estadístico | | ✅ | |
| Predicciones IA | | ✅ | |
| Recomendaciones | | ✅ | ✅ |
| Reportes | | ✅ | ✅ |
| Usuarios | ✅ | | |

Definido en `frontend/src/utils/permisos.js`, según los actores que
describe el documento de Requerimientos para cada RF.



- Todos los datos (usuarios, indicadores) están en memoria — no hay
  PostgreSQL/PostGIS conectado todavía.
- **Frontend 100% conectado a los 5 microservicios**, cada uno con su
  propia pantalla en el menú lateral:
  - Inicio, Consultar Indicadores, Mapa de Colombia
  - Comparar (RF-11), Análisis estadístico (RF-12)
  - Predicciones IA (RF-13), Recomendaciones (RF-14)
  - Reportes — genera y descarga PDF/Excel real (RF-15)
  - Gestión de usuarios (RF-02 a RF-05, solo Administrador)
- Login/Logout reales con JWT, dashboard protegido por sesión.
- Autocompletado del navegador desactivado en los formularios de
  inicio de sesión y gestión de usuarios (para que no aparezcan
  sugerencias de contraseñas/correos guardados durante una demo).
- Pendiente: Microservicio de Gestión de Datos (cargar bases de datos
  oficiales — RF-06 a RF-08), que quedó para el final según lo acordado.
