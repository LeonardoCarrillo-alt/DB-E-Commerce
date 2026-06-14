# Documentación de Correcciones — MongoDB Backend
**Proyecto:** `mongo-e-commerce`  
**Stack:** Quarkus 3.36.2 · Panache MongoDB · Jakarta EE · MicroProfile JWT  

---

## Índice
1. [Correcciones de Compilación](#1-correcciones-de-compilación)
2. [Dependencias Agregadas al pom.xml](#2-dependencias-agregadas-al-pomxml)
3. [Archivos Creados](#3-archivos-creados)
4. [Archivos Modificados](#4-archivos-modificados)
5. [Hallazgos del Análisis de Código](#5-hallazgos-del-análisis-de-código)

---

## 1. Correcciones de Compilación

### 1.1 Package incorrecto — `ProductoService` (resource)
**Archivo:** `resource/ProductoService.java`  
**Error:** `The declared package "bo.com.proj.service" does not match the expected package "bo.com.proj.resource"`  
**Fix:** Cambio de declaración de paquete.
```java
// Antes
package bo.com.proj.service;
// Después
package bo.com.proj.resource;
```

---

### 1.2 `findById` con String en lugar de ObjectId
**Archivos afectados:**
- `resource/ProductoService.java`
- `service/ProductoService.java`
- `service/CarritoService.java`

**Error:** `The method findById(ObjectId) is not applicable for the arguments (String)`  
**Causa:** `PanacheMongoEntity` usa `ObjectId` como tipo de ID, no `String`.  
**Fix:** Conversión del String a ObjectId + import añadido.
```java
// Antes
productoRepository.findById(id);
// Después
productoRepository.findById(new ObjectId(id));
```

---

### 1.3 `deleteById` con String en lugar de ObjectId
**Archivos afectados:**
- `resource/ProductoService.java`
- `service/ProductoService.java`
- `service/PromocionService.java`

**Error:** `The method deleteById(ObjectId) is not applicable for the arguments (String)`  
**Fix:** Misma conversión a ObjectId.
```java
// Antes
productoRepository.deleteById(id);
// Después
productoRepository.deleteById(new ObjectId(id));
```

---

### 1.4 `appendAll` no existe en `Document`
**Archivos afectados:**
- `resource/ProductoService.java`
- `service/ProductoService.java`

**Error:** `The method appendAll(Document) is undefined for the type Document`  
**Causa:** `Document` extiende `LinkedHashMap` y no tiene `appendAll`.  
**Fix:** Reemplazado por `putAll`.
```java
// Antes
query.appendAll(attrQuery);
// Después
query.putAll(attrQuery);
```

---

### 1.5 `update()` sobre tipo primitivo `long`
**Archivo:** `repository/CarritoRepository.java`  
**Error:** `Cannot invoke update() on the primitive type long`  
**Causa:** `PanacheQuery.where()` ya retorna `long` (documentos modificados), no se puede encadenar `.update().getModifiedCount()`.  
**Fix:** Comparación directa del `long`.
```java
// Antes
.where("usuarioId = ?5 and invitado = true", sessionId).update().getModifiedCount() > 0;
// Después
.where("usuarioId = ?5 and invitado = true", sessionId) > 0;
```

---

### 1.6 `PromocionRepository` no resuelto
**Archivo:** `service/CarritoService.java`  
**Error:** `PromocionRepository cannot be resolved to a type`  
**Fix:** Se creó `PromocionRepository` (ver sección 3) y se añadió el import.

---

### 1.7 `getStockByProducto` no definido
**Archivo:** `service/CarritoService.java`  
**Error:** `The method getStockByProducto(String) is undefined for the type InventarioService`  
**Fix:** Se añadió el método de conveniencia en `InventarioService`.
```java
public int getStockByProducto(String productoId) {
    return getStockDisponible(productoId, null);
}
```

---

### 1.8 `List<Bson>` incompatible con `List<Document>` en pipeline
**Archivo:** `repository/HistorialBusquedaRepository.java`  
**Error:** `Type mismatch: cannot convert from List<Bson> to List<Document>`  
**Fix:** Cambio del tipo del pipeline a `List<Bson>` + import de `org.bson.conversions.Bson`.
```java
// Antes
List<Document> pipeline = Arrays.asList(Aggregates.match(...), ...);
// Después
List<Bson> pipeline = Arrays.asList(Aggregates.match(...), ...);
```

---

### 1.9 Resultado de agregación incompatible con `List<Document>`
**Archivo:** `repository/HistorialBusquedaRepository.java`  
**Error:** `Type mismatch: cannot convert from ArrayList<HistorialBusqueda> to List<Document>`  
**Fix:** Uso de `withDocumentClass(Document.class)` para obtener resultados como `Document` raw.
```java
// Antes
mongoCollection().aggregate(pipeline).into(new ArrayList<>());
// Después
mongoCollection().withDocumentClass(Document.class).aggregate(pipeline).into(new ArrayList<>());
```

---

### 1.10 `sort(Document)` no definido en `PanacheQuery`
**Archivo:** `repository/HistorialBusquedaRepository.java`  
**Error:** `The method sort(Document) is undefined for the type PanacheQuery<HistorialBusqueda>`  
**Fix:** Uso de `Sort` de Panache pasado directamente a `find()`.
```java
// Antes
find("usuarioId", usuarioId).sort(new Document("fecha", -1)).limit(limite).list();
// Después
find("usuarioId", Sort.descending("fecha"), usuarioId).page(0, limite).list();
```

---

### 1.11 Anotación `@MongoCollection` incorrecta en repositorio
**Archivo:** `repository/ProductoRepository.java`  
**Error:** `MongoCollection cannot be resolved to a type`  
**Causa:** `@MongoCollection` es una anotación para entidades, no para repositorios.  
**Fix:** Eliminación del import y la anotación. La colección ya está definida en `@MongoEntity` de la entidad `Producto`.

---

### 1.12 `sort(Bson)` y `limit(int)` no disponibles en `PanacheQuery`
**Archivo:** `repository/ProductoRepository.java`  
**Errores:**
- `The method sort(Bson) is undefined for the type PanacheQuery<Producto>`
- `The method limit(int) is undefined for the type PanacheQuery<Producto>`
- `The method find(String, Sort, Object...) is not applicable for the arguments (Document, Sort)`

**Fix:** Migración a `mongoCollection()` nativo del driver para los métodos que requieren filtros `Bson` con ordenamiento `Bson`.
```java
// Antes (Panache)
find(filtroFinal).sort(orden).skip(skip).limit(limite).list();
// Después (driver nativo)
mongoCollection().find(filtroFinal).sort(orden).skip(skip).limit(limite).into(new ArrayList<>());
```
Métodos migrados: `buscarAvanzado`, `findProductosPopulares`, `findProductosRelacionados`.  
`getOrdenamiento` cambió su tipo de retorno de `Sort` (Panache) a `Bson` (driver nativo).

---

### 1.13 `searchWithDynamicAttributes` no definido
**Archivo:** `service/ProductoService.java`  
**Error:** `The method searchWithDynamicAttributes(Document) is undefined for the type ProductoRepository`  
**Fix:** Se reintegró el método en `ProductoRepository`.
```java
public List<Producto> searchWithDynamicAttributes(Document filtros) {
    return mongoCollection().find(filtros).into(new ArrayList<>());
}
```

---

### 1.14 `montoMinimo` no es un campo de `Promocion`
**Archivo:** `service/CarritoService.java`  
**Error:** `montoMinimo cannot be resolved or is not a field`  
**Fix:** Corrección al nombre real del campo en la entidad.
```java
// Antes
promocion.montoMinimo
// Después
promocion.montoMinimoCompra
```

---

### 1.15 `existing` no definido en `ProductoResource.delete`
**Archivo:** `resource/ProductoResource.java`  
**Error:** `existing cannot be resolved to a variable`  
**Fix:** Se añadió la búsqueda del producto antes de la validación de acceso.
```java
ProductoDTO existing = productoService.findById(id);
if (existing == null) return Response.status(Response.Status.NOT_FOUND).build();
if (!authService.canAccessTienda(existing.tiendaId)) { ... }
```

---

### 1.16 `update(String, ProductoDTO)` no definido en `ProductoService`
**Archivo:** `resource/ProductoResource.java`  
**Error:** `The method update(String, ProductoDTO) is undefined for the type ProductoService`  
**Fix:** Se implementó el método `update` en `service/ProductoService.java`.
```java
@Transactional
public ProductoDTO update(String id, ProductoDTO dto) {
    Producto p = productoRepository.findById(new ObjectId(id));
    if (p == null) return null;
    // actualiza campos...
    productoRepository.update(p);
    return toDTO(p);
}
```

---

### 1.17 `jwtId(String)` no definido en `JwtClaimsBuilder`
**Archivo:** `security/JwtService.java`  
**Error:** `The method jwtId(String) is undefined for the type JwtClaimsBuilder`  
**Fix:** Uso de `.claim("jti", ...)` que es la forma correcta de establecer el JWT ID.
```java
// Antes
.jwtId(UUID.randomUUID().toString())
// Después
.claim("jti", UUID.randomUUID().toString())
```
Aplicado en ambos métodos: `generateToken` y `generateRefreshToken`.

---

### 1.18 `group(Set<String>)` no definido en `JwtClaimsBuilder`
**Archivo:** `security/JwtService.java`  
**Error:** `The method group(Set<String>) is undefined for the type JwtClaimsBuilder`  
**Fix:** Uso del claim estándar `groups`.
```java
// Antes
.group(grupos)
// Después
.claim("groups", grupos)
```

---

### 1.19 Import faltante `java.util.Map` en `BusquedaService`
**Archivo:** `service/BusquedaService.java`  
**Error:** `The method getProductosRelacionados(...) refers to the missing type Map`  
**Fix:** Añadido `import java.util.Map`.

---

## 2. Dependencias Agregadas al pom.xml

| Artefacto | Propósito |
|-----------|-----------|
| `quarkus-hibernate-validator` | Provee `jakarta.validation` (`@Valid`, etc.) |
| `quarkus-scheduler` | Provee `io.quarkus.scheduler.Scheduled` para jobs programados |
| `quarkus-rest-client-jackson` | Reemplaza `quarkus-rest-client-reactive` + `quarkus-rest-client-reactive-jackson` (renombrados en Quarkus 3.x) |

---

## 3. Archivos Creados

### `repository/PromocionRepository.java`
Repositorio nuevo necesario por `CarritoService`. Incluye el método `findByCodigoAndVigente`.
```java
@ApplicationScoped
public class PromocionRepository implements PanacheMongoRepository<Promocion> {
    public Promocion findByCodigoAndVigente(String codigo, LocalDateTime ahora) {
        return find("codigo = ?1 and activo = true and fechaInicio <= ?2 and fechaFin >= ?3",
                    codigo, ahora, ahora).firstResult();
    }
}
```

---

## 4. Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `resource/ProductoService.java` | Package corregido, `findById`/`deleteById` con ObjectId, `putAll` |
| `service/ProductoService.java` | `findById`/`deleteById` con ObjectId, `putAll`, método `update` añadido |
| `service/CarritoService.java` | Import `PromocionRepository`, `ObjectId` para `findById`, campo `montoMinimoCompra` |
| `service/InventarioService.java` | Método `getStockByProducto(String)` añadido |
| `service/PromocionService.java` | `deleteById` con ObjectId |
| `service/BusquedaService.java` | Import `java.util.Map` añadido |
| `repository/CarritoRepository.java` | Fix de `marcarComoCompletado` eliminando cadena inválida |
| `repository/HistorialBusquedaRepository.java` | `List<Bson>` para pipeline, `withDocumentClass`, `Sort` de Panache |
| `repository/ProductoRepository.java` | Eliminado `@MongoCollection`, migración a `mongoCollection()` nativo, `searchWithDynamicAttributes` reintegrado |
| `resource/ProductoResource.java` | Fetch de `existing` en `delete`, llamada a `update` |
| `security/JwtService.java` | `.claim("jti",...)` en lugar de `.jwtId()`, `.claim("groups",...)` en lugar de `.group()` |
| `entity/Promocion.java` | Campos `codigo` y `montoMinimoCompra` verificados/referenciados correctamente |
| `pom.xml` | 3 dependencias añadidas/reemplazadas |

---

## 5. Hallazgos del Análisis de Código

El análisis completo del código reveló los siguientes hallazgos adicionales a considerar:

### Alta Severidad
| Archivo | Línea | Hallazgo |
|---------|-------|---------|
| `repository/ProductoRepository.java` | 27-28, 227-228 | **NoSQL Injection (CWE-943):** Input del usuario usado directamente en queries MongoDB sin sanitización. Puede permitir acceso no autorizado o escalada de privilegios. |

### Media Severidad
| Archivo | Línea | Hallazgo |
|---------|-------|---------|
| `repository/ProductoRepository.java` | 153-163 | `toLowerCase()` sin `Locale` puede causar fallos transitorios en sistemas con locales distintas. Usar `toLowerCase(Locale.ROOT)`. |
| `repository/ProductoRepository.java` | 31-32 | Alta complejidad ciclomática (24). Se recomienda dividir `buscarAvanzado` en métodos más pequeños. |
| `repository/ProductoRepository.java` | 61-71 | Fragmentos de código clonados. Extraer en método reutilizable. |
| `service/PromocionService.java` | 71, 138, 198 | Alta complejidad ciclomática (11, 22, 12). Simplificar métodos. |
| `service/CarritoService.java` | 280-281 | `Stream.allMatch()` retorna `true` en stream vacío. Verificar que el stream no esté vacío antes de usarlo. |
| `service/CarritoService.java` | 332-333 | Alta complejidad ciclomática (11) en `calcularDescuento`. |
| `service/BusquedaService.java` | 101-111 | `toLowerCase()` sin `Locale`. |
| `resource/InventarioResource.java` | 34-35 | Parámetro `productoId` sin validación de nulidad (CWE-20). |

### Baja Severidad
| Archivo | Línea | Hallazgo |
|---------|-------|---------|
| `service/AuthService.java` | 51-52 | Captura de `Exception` genérica (CWE-396). Usar excepciones específicas. |
| `service/InventarioService.java` | 111-112 | Captura de `Exception` genérica (CWE-396). |

### Informativo
| Archivo | Línea | Hallazgo |
|---------|-------|---------|
| `dto/LoginRequestDTO.java` | 10-11 | Posible typo: `requerida` → `requerido`. |

---

*Documentación generada tras sesión de corrección de errores de compilación del módulo MongoDB del proyecto DBE-Commerce.*
