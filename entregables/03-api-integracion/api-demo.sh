#!/usr/bin/env bash
# =============================================================================
# API Demo: Integración MongoDB ↔ PostgreSQL — E-commerce Multitienda
# =============================================================================
# Script bash que demuestra el flujo completo de integración entre
# MongoDB y PostgreSQL a través de la API Gateway.
#
# Uso:
#   chmod +x api-demo.sh
#   ./api-demo.sh
#
# Requisitos:
#   - curl, jq
#   - Servicios ejecutándose: docker-compose up -d
# =============================================================================

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
EMAIL="${EMAIL:-cliente@ecommerce.com}"
PASSWORD="${PASSWORD:-admin123}"
PRODUCT_ID="${PRODUCT_ID:-}"

echo "═══════════════════════════════════════════════════════════════"
echo "  API Demo: Integración MongoDB ↔ PostgreSQL"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ── Helper functions ──────────────────────────────────────────────────────────

api() {
    local method="$1" path="$2" token="$3" body="$4"
    local headers=(-H "Content-Type: application/json")
    [ -n "$token" ] && headers+=(-H "Authorization: Bearer $token")
    if [ -n "$body" ]; then
        curl -s -X "$method" "$BASE_URL$path" \
            "${headers[@]}" -d "$body"
    else
        curl -s -X "$method" "$BASE_URL$path" "${headers[@]}"
    fi
    echo
}

step() {
    echo ""
    echo "─── Paso $1: $2 ───"
    echo ""
}

check_jq() {
    if ! command -v jq &>/dev/null; then
        echo "Error: jq no está instalado. Instálalo con: brew install jq"
        exit 1
    fi
}

# ══════════════════════════════════════════════════════════════════════════════
# PASO 1: Autenticación
# ══════════════════════════════════════════════════════════════════════════════

step 1 "Autenticación — Login contra PostgreSQL vía REST Client"

LOGIN_RESPONSE=$(api POST /auth/login "" \
    "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refreshToken')

echo "✓ Login exitoso"
echo "  Access Token: ${ACCESS_TOKEN:0:50}..."
echo ""

# ══════════════════════════════════════════════════════════════════════════════
# PASO 2: Perfil del usuario (verifica UUID de PostgreSQL en JWT)
# ══════════════════════════════════════════════════════════════════════════════

step 2 "Perfil de usuario — Lee UUID de PostgreSQL desde el JWT"

ME_RESPONSE=$(api GET /auth/me "$ACCESS_TOKEN" "")
echo "$ME_RESPONSE" | jq '{id: .id, email: .email, rol: .rol}'
echo "✓ UUID de PostgreSQL en JWT.sub: $(echo "$ME_RESPONSE" | jq -r '.id')"

# ══════════════════════════════════════════════════════════════════════════════
# PASO 3: Catálogo de productos (MongoDB)
# ══════════════════════════════════════════════════════════════════════════════

step 3 "Catálogo de productos — Consulta directa a MongoDB"

PRODUCTOS_RESPONSE=$(api GET /productos "$ACCESS_TOKEN" "")
TOTAL_PRODUCTOS=$(echo "$PRODUCTOS_RESPONSE" | jq -r 'length')
echo "✓ Total productos en MongoDB: $TOTAL_PRODUCTOS"

if [ "$TOTAL_PRODUCTOS" -gt 0 ]; then
    PRODUCT_ID=$(echo "$PRODUCTOS_RESPONSE" | jq -r '.[0]._id // .[0].id')
    echo "  Primer producto ID: $PRODUCT_ID"
    echo "$PRODUCTOS_RESPONSE" | jq '.[0] | {nombre, precio, categoria, atributos}'
fi

# ══════════════════════════════════════════════════════════════════════════════
# PASO 4: Búsqueda avanzada (MongoDB — $gte, $lte, $and, $or)
# ══════════════════════════════════════════════════════════════════════════════

step 4 "Búsqueda avanzada — Operadores MongoDB (\$gte, \$lte, \$and, \$or)"

SEARCH_RESPONSE=$(api POST /productos/buscar "$ACCESS_TOKEN" \
    '{"query":"laptop","precioMin":100,"precioMax":5000,"categoria":"electronica"}')
TOTAL_RESULTADOS=$(echo "$SEARCH_RESPONSE" | jq -r '.total // .resultados // .items | length // 0')
echo "✓ Resultados de búsqueda: $TOTAL_RESULTADOS"

# ══════════════════════════════════════════════════════════════════════════════
# PASO 5: Obtener carrito (MongoDB — cross-ref con UUID PostgreSQL)
# ══════════════════════════════════════════════════════════════════════════════

step 5 "Carrito de compras — MongoDB (usuarioId = UUID de PostgreSQL)"

CARRITO_RESPONSE=$(api GET /carrito "$ACCESS_TOKEN" "")
echo "✓ Carrito obtenido"
echo "$CARRITO_RESPONSE" | jq '{usuarioId: .usuarioId, sessionId: .sessionId, items_count: (.items | length), total: .total}'

# ══════════════════════════════════════════════════════════════════════════════
# PASO 6: Agregar producto al carrito (MongoDB)
# ══════════════════════════════════════════════════════════════════════════════

step 6 "Agregar producto al carrito — MongoDB + validación de stock"

if [ -n "$PRODUCT_ID" ]; then
    ADD_RESPONSE=$(api POST /carrito/items "$ACCESS_TOKEN" \
        "{\"productoId\":\"$PRODUCT_ID\",\"cantidad\":2}")
    echo "✓ Producto agregado al carrito"
    echo "$ADD_RESPONSE" | jq '{items_count: (.items | length), total: .total}'
else
    echo "⚠ No hay productos disponibles. Omitiendo este paso."
fi

# ══════════════════════════════════════════════════════════════════════════════
# PASO 7: Resumen de checkout (MongoDB — valida stock)
# ══════════════════════════════════════════════════════════════════════════════

step 7 "Resumen de checkout — Valida stock contra MongoDB"

RESUMEN_RESPONSE=$(api GET /carrito/checkout/resumen "$ACCESS_TOKEN" "")
echo "$RESUMEN_RESPONSE" | jq '{items_count: (.items | length), subtotal: .subtotal, descuento: .descuento, total: .total}'

# ══════════════════════════════════════════════════════════════════════════════
# PASO 8: Procesar checkout (MongoDB — reserva stock)
# ══════════════════════════════════════════════════════════════════════════════

step 8 "Procesar checkout — Reserva stock en MongoDB"

CHECKOUT_RESPONSE=$(api POST /carrito/checkout/procesar "$ACCESS_TOKEN" "")
RESERVA_ID=$(echo "$CHECKOUT_RESPONSE" | jq -r '.reserva_id // .reservaId')
CARRITO_ID=$(echo "$CHECKOUT_RESPONSE" | jq -r '.carrito.id')
echo "✓ Checkout procesado"
echo "  reservaId:  $RESERVA_ID"
echo "  carritoId:  $CARRITO_ID"
echo "$CHECKOUT_RESPONSE" | jq '{total: .total, monto_descuento: .monto_descuento}'

# ══════════════════════════════════════════════════════════════════════════════
# PASO 9: Crear orden — INTEGRACIÓN CRÍTICA (MongoDB + PostgreSQL)
# ══════════════════════════════════════════════════════════════════════════════

step 9 "Crear orden — INTEGRACIÓN MongoDB + PostgreSQL"
echo "  1. Lee carrito de MongoDB"
echo "  2. POST /pedidos → Crea Pedido en PostgreSQL (UUID)"
echo "  3. Confirma reserva en MongoDB (orderId = Pedido.id UUID)"
echo ""

if [ -n "$RESERVA_ID" ] && [ -n "$CARRITO_ID" ]; then
    ORDER_RESPONSE=$(api POST /orders "$ACCESS_TOKEN" \
        "{\"reservaId\":\"$RESERVA_ID\",\"carritoId\":\"$CARRITO_ID\",\"direccionEnvio\":{\"calle\":\"Av. Siempre Viva 123\",\"ciudad\":\"La Paz\",\"codigoPostal\":\"00000\",\"pais\":\"Bolivia\"},\"metodoPago\":\"VISA\"}")
    echo "$ORDER_RESPONSE" | jq '{id: .id, total: .total, estado: .estado}'
    echo ""
    echo "✓ Orden creada exitosamente"
    echo "  Order ID (PostgreSQL UUID): $(echo "$ORDER_RESPONSE" | jq -r '.id')"
    echo "  Estado: $(echo "$ORDER_RESPONSE" | jq -r '.estado')"
else
    echo "⚠ No se pudo crear orden. Asegúrate de que el carrito tenga items."
fi

# ══════════════════════════════════════════════════════════════════════════════
# PASO 10: Ver órdenes del usuario
# ══════════════════════════════════════════════════════════════════════════════

step 10 "Órdenes del usuario — Verifica persistencia en PostgreSQL"

ORDERS_RESPONSE=$(api GET /orders/my "$ACCESS_TOKEN" "")
TOTAL_ORDERS=$(echo "$ORDERS_RESPONSE" | jq -r 'length')
echo "✓ Total órdenes en PostgreSQL: $TOTAL_ORDERS"
echo "$ORDERS_RESPONSE" | jq '.[] | {id: .id, total: .total, estado: .estado, fecha: .fecha_creacion}'

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  DEMO COMPLETADA"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Resumen de integración:"
echo "  ✔ MongoDB:  Productos, carritos, inventario, búsquedas"
echo "  ✔ PostgreSQL: Usuarios (UUID), pedidos (UUID), facturas, envíos"
echo "  ✔ Cross-DB:  usuarioId (UUID) en carritos MongoDB"
echo "  ✔ Cross-DB:  tiendaId (UUID) en productos MongoDB"
echo "  ✔ Cross-DB:  Orden creada en PostgreSQL, stock confirmado en MongoDB"
echo "  ✔ JWT:       sub = usuario.id (UUID de PostgreSQL)"
echo ""
