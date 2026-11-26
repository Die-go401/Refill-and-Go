# Refill & Go

Sitio web responsive y funcional basado en las pantallas de Figma proporcionadas.

## Estructura

- `html/index.html`: documento principal.
- `css/style.css`: estilos, breakpoints y animaciones.
- `javascript/main.js`: navegación y comportamiento de la demo.
- `assets/images`: fotografías e ilustraciones.
- `assets/icons`: iconos SVG.
- `assets/fonts`: documentación de las fuentes resueltas.
- `docs/readme.md`: esta documentación.

## Uso

Abre `html/index.html` desde un servidor web. En este repositorio, la página raíz redirige
automáticamente a esa ruta.

## Flujo funcional

1. Bienvenida e ingreso.
2. Inicio con envases e impacto.
3. Mapa de puntos aliados.
4. Escaneo para préstamo o devolución.
5. Confirmación de préstamo.
6. Confirmación y finalización de devolución.
7. Recompensas, descuento de puntos y comprobante de canje.
8. Registro, recuperación y cambio de contraseña.
9. Ingreso manual de códigos para préstamo y devolución.
10. Perfil editable, recordatorios, historial, ayuda y privacidad.

## Simulación

- Los formularios validan campos antes de avanzar.
- Para pedir un envase con código manual usa un código nuevo como `RG-3001`. Para devolverlo, ingresa el código de uno de tus envases activos.
- Pedir prestado agrega el envase a Inicio e Historial. Devolverlo lo retira, suma 20 eco-puntos y actualiza el impacto.
- Los filtros y la búsqueda del mapa ocultan o muestran marcadores; al seleccionar uno se actualiza su ficha.
- Los canjes descuentan eco-puntos, evitan canjes duplicados y muestran un comprobante.
- Los datos de perfil, recordatorios, privacidad y mensajes de soporte se mantienen durante la sesión.
- El QR es una representación visual; el flujo se puede probar tocándolo o usando el código manual.

Todo el estado vive únicamente en la memoria de JavaScript: no se usa backend, base de datos ni almacenamiento del navegador. Al recargar la página, la sesión vuelve a sus datos iniciales. Los puntos, comercios, fechas y recompensas son ilustrativos.
