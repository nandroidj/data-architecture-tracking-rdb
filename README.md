# data-architecture-tracking-rdb

Se pretende realizar un sistema de geolocalización mediante pequeños dispositivos diseñados para tal fin, los cuales llamaremos dispositivos de seguimiento de aquí en adelante. Dicho sistema será aplicado al seguimiento de vehículos.


## pgAdmin - Setup

1. Crear el `docker-compose`,

```
version: "3"

services: 
  postgres:
    image: postgres:13
    init: true
    environment: 
      - POSTGRES_DB=${DB_DATABASE}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - ./postgres:/var/lib/postgresql/data
    ports: 
      - "5432:5432"
    restart: always

  pgadmin:
    image: dpage/pgadmin4
    init: true
    environment: 
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASWORD}
    ports:
      - "80:80"
    depends_on: 
      - postgres 
```

2. Crear el archivo `.env`,

```
export DB_HOST=localhost 
export DB_DATABASE=postgres

export DB_USER=root
export DB_PASSWORD=root

export PGADMIN_EMAIL="nando@iglesias.corp"
export PGADMIN_PASWORD="Password123"
```

3. Lanzar el comando `docker-compose up` donde docker se encargara de descargar las imagenes de postgres y pgadmin definidas y montara los contendores.

4. Tal como se define en el archivo `docker-compose`, dirigirse a la url `localhost:80` donde se encuentra disponible el servicio de pgAdmin.

5. Ingresar a la plataforma con las credenciales definidas en las variables de entorno (`.env`).

6. En la barra izquierda, `Browser`, hacer click derecho sobre el icono **Servers**, y luego realizar los siguientes pasos, `Servers -> Reegister -> Server`. 

  - Solapa general: asignarle un nombre al servidor.

  - Solapa connection:

      * hostname: postgres (es el nombre declarado al servicio de base de datos en docker-compose)

      * username y password: ingresar el valor a las variables de entorno definidas en el `.env

7. En el icono del servidor creado realizar click derecho y luego seguir los siguientes pasos, `Create -> Database`. Een la solapa General asignarle un nombre a la base de datos.

8. Hacer click izquierdo sobre la db creada y luego presionar el boton **Query Tool**. Posteriormente, en la solapa *Query Editor* ingresar el modelo de datos a crear en lenguaje *SQL* y finalmente presionar el boton **Execute/Refresh**. 

9. En efecto, se crea el siguiente modelo de datos relacional:

```

-- user
CREATE TABLE public.user (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	document DECIMAL(9),
	lastname VARCHAR(20),
	firstname VARCHAR(60),
	address VARCHAR(60)
);

ALTER TABLE ONLY public.user
ADD CONSTRAINT user_pkey 
PRIMARY KEY (id);


-- tracking_device
CREATE TABLE public.tracking_device (
	id uuid DEFAULT gen_random_uuid() NOT NULL
);

ALTER TABLE ONLY public.tracking_device
ADD CONSTRAINT tracking_device_pkey 
PRIMARY KEY (id);


-- measurement
CREATE TABLE measurement (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	timestamp TIMESTAMP DEFAULT now() NOT NULL,
	lat NUMERIC (10,6),
	lng NUMERIC (10,6)
);

ALTER TABLE ONLY public.measurement
ADD CONSTRAINT measurement_pkey 
PRIMARY KEY (id);


-- user_tracking_device
CREATE TABLE user_tracking_device (
	user_id uuid NOT NULL,
	device_id uuid NOT NULL
);

ALTER TABLE ONLY public.user_tracking_device
ADD CONSTRAINT user_tracking_device_pkey 
PRIMARY KEY (user_id, device_id);

ALTER TABLE ONLY public.user_tracking_device
ADD CONSTRAINT user_fkey 
FOREIGN KEY (user_id)
REFERENCES public.user(id)
ON UPDATE RESTRICT ON DELETE RESTRICT;
	
ALTER TABLE ONLY public.user_tracking_device
ADD CONSTRAINT device_fkey 
FOREIGN KEY (device_id)
REFERENCES public.tracking_device(id)
ON UPDATE RESTRICT ON DELETE RESTRICT;
	

-- tracking_device_measurement
CREATE TABLE tracking_device_measurement (
	device_id uuid NOT NULL,
	measurement_id uuid NOT NULL
);

ALTER TABLE public.tracking_device_measurement
ADD CONSTRAINT tdm_pkey 
PRIMARY KEY (device_id, measurement_id);

ALTER TABLE public.tracking_device_measurement
ADD CONSTRAINT tdm_device_fkey 
FOREIGN KEY (device_id)
REFERENCES public.tracking_device(id)
ON UPDATE RESTRICT ON DELETE RESTRICT;

ALTER TABLE  public.tracking_device_measurement
ADD CONSTRAINT tdm_measurement_fkey 
FOREIGN KEY (measurement_id)
REFERENCES public.measurement(id)
ON UPDATE RESTRICT ON DELETE RESTRICT;

```


10. Dentro de la base de datos creada, en la seccion **Schemas** se puede visualizar el/los schemas creados y dentro de cada uno las tablas confeccionadas en *SQL*, entre otras utilidades.

* *Aclaración*: Cada vez que se levanten los contendores se tendrá que **registrar nuevamente el server** desde la GUI de pgAdmin y en efecto, se podr√°n ver los datos persistidos.


11. A partir del modelo de datos propuesto, se general el diagrama entidad-relación (*ERD*),

![Diagrama *ERD*](https://github.com/nandroidj/data-architecture-tracking-rdb/blob/main/docs/data-architecture-tracking-rdb.png)

12. Posteriormente, se procede a poblar las tablas propuestas,


* Tabla `tracking_device`

```
DO $FN$
BEGIN
  FOR counter IN 1..10 LOOP
    RAISE NOTICE 'Counter: %', counter;

    EXECUTE $$ 
		INSERT INTO 
			public.tracking_device
		VALUES (gen_random_uuid()) 
		RETURNING id $$ 
      USING counter;
  END LOOP;
END;
$FN$
```


* Tabla `users`

```
INSERT INTO
	public.user
VALUES
	(gen_random_uuid(), 12345678, 'Santos', 'Mario', 'Cucha Cucha 1234'),
	(gen_random_uuid(), 22345678, 'Medina', 'Gabriel', 'El Cairo 1234'),
	(gen_random_uuid(), 32345678, 'Lamponne', 'Pablo', 'Agacha Al 800'),
	(gen_random_uuid(), 42345678, 'Ravenna', 'Emilio', 'La dieta milagrosa 3200'),
	(gen_random_uuid(), 52345678, 'Szifron', 'Damian', 'Ramos me guia 438');
```


* Tabla `measurement`

```
DO $FN$
BEGIN
  FOR counter IN 1..100 LOOP
    RAISE NOTICE 'Counter: %', counter;

    EXECUTE $$ 
		INSERT INTO public.measurement
		VALUES (gen_random_uuid(), now(), random() * 100, random() * 100) 
		RETURNING id $$ 
      USING counter;
  END LOOP;
END;
$FN$
```






















