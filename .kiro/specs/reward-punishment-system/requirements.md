# Documento de Requisitos

## Introducción

Sistema móvil para el registro y gestión de premios y castigos asignados a personas. El sistema permite crear personas, definir premios con valores positivos y castigos con valores negativos, y asignar estos elementos a una o múltiples personas para llevar un seguimiento de puntuaciones.

## Glosario

- **Sistema_Premios_Castigos**: La aplicación móvil completa que gestiona premios, castigos y personas
- **Premio**: Elemento con valor numérico positivo que se puede asignar a personas
- **Castigo**: Elemento con valor numérico negativo que se puede asignar a personas
- **Persona**: Entidad individual a la que se pueden asignar premios y castigos
- **Valor**: Número entero que representa la puntuación de un premio (positivo) o castigo (negativo)
- **Asignación**: Acción de vincular un premio o castigo específico a una o más personas
- **Puntuación_Total**: Suma acumulada de todos los valores de premios y castigos asignados a una persona
- **Vista_Semanal**: Interfaz que muestra las puntuaciones de la semana actual
- **Semana_Actual**: Período de siete días que comienza el lunes y termina el domingo de la semana en curso
- **Puntuación_Semanal**: Suma de valores de premios y castigos asignados a una persona durante la Semana_Actual

## Requisitos

### Requisito 1

**Historia de Usuario:** Como usuario, quiero crear y gestionar personas en el sistema, para poder asignarles premios y castigos posteriormente.

#### Criterios de Aceptación

1. EL Sistema_Premios_Castigos DEBERÁ permitir crear nuevas personas con nombre único
2. EL Sistema_Premios_Castigos DEBERÁ mostrar una lista de todas las personas registradas
3. EL Sistema_Premios_Castigos DEBERÁ permitir editar el nombre de personas existentes
4. EL Sistema_Premios_Castigos DEBERÁ permitir eliminar personas del sistema
5. EL Sistema_Premios_Castigos DEBERÁ validar que el nombre de la persona no esté vacío

### Requisito 2

**Historia de Usuario:** Como usuario, quiero crear y gestionar premios con valores positivos, para poder recompensar comportamientos deseados.

#### Criterios de Aceptación

1. EL Sistema_Premios_Castigos DEBERÁ permitir crear premios con nombre y valor numérico positivo
2. EL Sistema_Premios_Castigos DEBERÁ mostrar una lista de todos los premios disponibles
3. EL Sistema_Premios_Castigos DEBERÁ permitir editar el nombre y valor de premios existentes
4. EL Sistema_Premios_Castigos DEBERÁ permitir eliminar premios del sistema
5. EL Sistema_Premios_Castigos DEBERÁ validar que el valor del premio sea mayor que cero

### Requisito 3

**Historia de Usuario:** Como usuario, quiero crear y gestionar castigos con valores negativos, para poder penalizar comportamientos no deseados.

#### Criterios de Aceptación

1. EL Sistema_Premios_Castigos DEBERÁ permitir crear castigos con nombre y valor numérico negativo
2. EL Sistema_Premios_Castigos DEBERÁ mostrar una lista de todos los castigos disponibles
3. EL Sistema_Premios_Castigos DEBERÁ permitir editar el nombre y valor de castigos existentes
4. EL Sistema_Premios_Castigos DEBERÁ permitir eliminar castigos del sistema
5. EL Sistema_Premios_Castigos DEBERÁ validar que el valor del castigo sea menor que cero

### Requisito 4

**Historia de Usuario:** Como usuario, quiero asignar premios y castigos a una o múltiples personas, para llevar un registro de sus comportamientos.

#### Criterios de Aceptación

1. EL Sistema_Premios_Castigos DEBERÁ permitir seleccionar un premio o castigo existente para asignación
2. EL Sistema_Premios_Castigos DEBERÁ permitir seleccionar una o múltiples personas para la asignación
3. CUANDO se realice una asignación, EL Sistema_Premios_Castigos DEBERÁ registrar la fecha y hora de la asignación
4. EL Sistema_Premios_Castigos DEBERÁ mostrar un historial de todas las asignaciones realizadas
5. EL Sistema_Premios_Castigos DEBERÁ permitir eliminar asignaciones previamente realizadas

### Requisito 5

**Historia de Usuario:** Como usuario, quiero ver la puntuación total de cada persona, para evaluar su desempeño general.

#### Criterios de Aceptación

1. EL Sistema_Premios_Castigos DEBERÁ calcular automáticamente la Puntuación_Total de cada persona
2. EL Sistema_Premios_Castigos DEBERÁ mostrar la Puntuación_Total actualizada en tiempo real
3. EL Sistema_Premios_Castigos DEBERÁ mostrar un ranking de personas ordenado por Puntuación_Total
4. CUANDO se modifique o elimine una asignación, EL Sistema_Premios_Castigos DEBERÁ recalcular la Puntuación_Total automáticamente
5. EL Sistema_Premios_Castigos DEBERÁ mostrar el desglose de premios y castigos que componen la Puntuación_Total de cada persona

### Requisito 6

**Historia de Usuario:** Como usuario, quiero ver una vista semanal con los puntos totales de cada persona durante la semana actual, para evaluar el desempeño reciente.

#### Criterios de Aceptación

1. EL Sistema_Premios_Castigos DEBERÁ proporcionar una Vista_Semanal accesible desde la interfaz principal
2. EL Sistema_Premios_Castigos DEBERÁ mostrar la Puntuación_Semanal de cada persona en la Vista_Semanal
3. EL Sistema_Premios_Castigos DEBERÁ calcular la Puntuación_Semanal considerando solo las asignaciones realizadas durante la Semana_Actual
4. EL Sistema_Premios_Castigos DEBERÁ mostrar las fechas de inicio y fin de la Semana_Actual en la Vista_Semanal
5. CUANDO cambie la semana, EL Sistema_Premios_Castigos DEBERÁ actualizar automáticamente la Vista_Semanal con los datos de la nueva Semana_Actual