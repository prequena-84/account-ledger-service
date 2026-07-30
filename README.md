## Justificación del Stack Tecnológico (Node.js / NestJS vs Java)

Para la construcción de este Core Bancario, se evaluó el uso de tecnologías tradicionales como Java (Spring Boot), pero se optó estratégicamente por **Node.js con NestJS (TypeScript)** por las siguientes razones arquitectónicas:

1. **Alta Concurrencia I/O (Non-Blocking):** En un entorno bancario distribuido, la mayoría del tiempo de procesamiento se gasta esperando respuestas de red (bases de datos, otros microservicios vía gRPC). El modelo asíncrono de un solo hilo de Node.js (Event Loop) maneja miles de conexiones concurrentes I/O de manera mucho más eficiente y con menor consumo de memoria RAM que el modelo tradicional de "un hilo por petición" de Java.

2. **Arquitectura Cloud-Native:** Node.js ofrece tiempos de arranque (Cold Starts) drásticamente menores en comparación con la JVM de Java. Esto lo hace ideal para entornos en la nube (GCP Cloud Run, Kubernetes) donde la auto-escalabilidad rápida (Scale-to-Zero y Scale-Up) es un requisito crítico.

3. **Ecosistema Enterprise con NestJS:** Al usar TypeScript y NestJS, mantenemos el rigor estructural de Java (Inversión de Control, Inyección de Dependencias, Decoradores, Arquitectura Hexagonal) pero ganamos la agilidad y el vasto ecosistema de paquetes de JavaScript, logrando un balance perfecto entre robustez y velocidad de desarrollo (Time-to-Market).

## Arranque del proyecto

Para Iniciar el proyecto se ejecutar el comando de creacion de la red de Docker donde se comunicaran internamente los microservicios:

```bash
docker network create bancaria-net
```

y posteriormetne se arranca los microservicios con el comando:

```bash - stage development build
docker compose build development
```

Al ejecutar este comando Docker espera que se levante la imagen de Docker de Postgres y Adminer para realizar la creacion de la base de datos. y los servicios en los puertos definidos en el docker-compose.yml

Luego se levanta el contenedor development,

```bash (con la bandera "-d" podemos cargar el modo detached)
docker compose up --build development 

ó

docker compose up -d --build development

```

Para ingresar al adminer lo podemos hacer en el navegador con la siguiente direccion: http://localhost:8090

Usuario:admin
Password: Ja2EJ-jDi4yvC@DqJiQfmWLP

Se ha exportado el ambiente de prueba de Postman en el json:
collection: Ecositema Transaccional Saga-Account
enviroment: development.postman_environment.json

Se repite el mismno proceso para levantar el microservicio "transaction-orchestrator-services" excepto que no es necesario correr de nuevo el comando "docker network create bancaria-net" ya que la red existe.