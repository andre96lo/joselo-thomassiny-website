BIENVENIDO A TU SITIO WEB
Joselo Thomassiny — Panel de Control
Version 2 — Con carpeta de imagenes
=====================================


ESTRUCTURA DE TU SITIO
=======================

sitiov1/
  index.html      -> Tu galeria publica
  about.html      -> Tu pagina "Acerca de"
  admin.html      -> Tu panel de control (solo tu lo ves)
  data.js         -> Tus datos (no toques este archivo)
  images/
    obras/        -> AQUI van las fotos de tus pinturas
    artista/      -> AQUI va tu foto de retrato


COMO AGREGAR UNA FOTO DE UNA OBRA
===================================

1. Toma la foto de tu pintura desde tu telefono o camara.

2. Copia el archivo de foto a esta carpeta:
      sitiov1 / images / obras

   (Puedes poner el nombre que quieras, ej: "mi-obra.jpg")

3. Abre el panel de control: admin.html

4. Ve a "Mis Obras" y haz clic en la obra que quieres actualizar.

5. En el campo "Nombre del archivo de la foto", escribe
   exactamente el nombre que le pusiste, incluyendo la extension:
      mi-obra.jpg

6. Haz clic en "Guardar Cambios".

7. La foto aparece en tu galeria. Cuando subas los archivos a
   tu servidor (Vercel), aparece tambien en linea.


COMO AGREGAR TU FOTO DE PERFIL
================================

1. Copia tu foto a: sitiov1 / images / artista
   (Ponle el nombre: retrato.jpg o retrato.png)

2. En el panel -> "Sobre Mi" -> escribe: retrato.jpg

3. Guarda los cambios.


FORMATOS DE IMAGEN RECOMENDADOS
=================================
- Formato: JPG o WebP (no PNG para fotos — son muy grandes)
- Tamano maximo: 1 MB por foto
- Resolucion: 800x1000px para obras, 600x800px para retrato
- Herramienta gratuita para comprimir: squoosh.app


ATAJOS DE TECLADO (en el panel)
================================
   Ctrl + S     -> Guardar todos los cambios
   Esc          -> Cerrar la ventana de edicion


COMO ACTUALIZAR TU SITIO EN LINEA
====================================

Cuando agregues nuevas fotos o hagas cambios:
1. Guarda los cambios en el panel (admin.html).
2. Sube TODA la carpeta sitiov1 a tu repositorio de GitHub.
3. Vercel actualiza tu sitio automaticamente en 1 o 2 minutos.

(Si no sabes hacer esto, pidele ayuda a tu disenador web.)


NOTAS IMPORTANTES
=================

* Las fotos ahora son archivos REALES dentro de la carpeta images/.
  Esto significa que:
  - No ocupan espacio del navegador.
  - Cualquier persona que tenga esta carpeta las puede ver.
  - Funcionan en Vercel sin cambios.

* Los TEXTOS (titulos, precios, biografia, contacto) se siguen
  guardando en el navegador — si usas otra computadora, necesitas
  actualizar esos textos otra vez. En cambio las fotos viajan
  junto con la carpeta.

* Si una foto no aparece en el panel: revisa el NOMBRE exacto del
  archivo. "obra1.jpg" NO es lo mismo que "obra-1.jpg".


SI ALGO SALE MAL
================

   PROBLEMA: La foto no aparece aunque la copie a la carpeta.
   SOLUCION: Revisa el nombre exacto, letra por letra, mayusculas
             incluidas. Debe coincidir con lo que escribiste en el
             panel. El panel te dice "Foto encontrada" en verde
             cuando el nombre es correcto.

   PROBLEMA: Mi foto es muy grande.
   SOLUCION: Reducela antes de subir. Usa squoosh.app o compressor.io

   PROBLEMA: Quiero volver a los datos originales.
   SOLUCION: Abre el navegador en modo privado/incognito y abre
             admin.html — veras los datos por defecto.


NECESITAS AYUDA?
================
Contacta a tu disenador web.
