// Módulos requeridos
const express = require("express");
const cors = require("cors");
const mariadb = require("mariadb");
require("dotenv").config();

// Instancia de Express
const app = express();

// Middleware
app.use(cors({

    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true

}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar puerto de escucha
app.listen(3000, "0.0.0.0", () => {

    console.log("Servidor escuchando en el puerto 3000");

});

// Conexión a BBDD
const pool = mariadb.createPool({

    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5

});


// GET /api/usuarios -> Devuelve todos los usuarios
app.get("/api/usuarios", async (req, res) => {

    let conn;

    try {

        conn = await pool.getConnection();
        await conn.query("USE users_groups;");

        const result = await conn.query("SELECT * FROM users;");

        res.json(result);
        
    } catch (error) {

        res.status(500).json({ error: `Ha habido un error al devolver los datos de los usuarios: ${error}` });

    } finally {

        if (conn) conn.end();

    }

});

// GET /api/usuarios/:id -> Devuelve un usuario en concreto
app.get("/api/usuarios/:id", async (req, res) => {

    let conn;

    try {

        conn = await pool.getConnection();
        await conn.query("USE users_groups;");

        const userId = req.params.id

        const result = await conn.query(`SELECT * FROM users WHERE id = ${userId};`);

        res.json(result);
        
    } catch (error) {

        res.status(500).json({ error: `Ha habido un error al devolver los datos del usuario: ${error}` });

    } finally {

        if (conn) conn.end();

    }

});

// POST /api/usuarios -> Añade un usuario a la base de datos
app.post("/api/usuarios/", async (req, res) => {

    let conn;

    try {

        conn = await pool.getConnection();
        await conn.query("USE users_groups;");


        const name = req.body.name;
        await conn.query("INSERT INTO users (name) VALUES (?);", [name]);

        res.status(201).json({ success: "Los datos se han insertado correctamente" });
        
    } catch (error) {

        res.status(500).json({ error: `Ha habido un error al añadir el usuario a la base de datos: ${error}` });

    } finally {

        if (conn) conn.end();

    }

});

// DELETE /api/usuarios/:id -> Elimina un usuario de la base de datos
app.delete("/api/usuarios/:id", async (req, res) => {

    let conn;

    try {

        conn = await pool.getConnection();
        await conn.query("USE users_groups;");

        const userId = req.params.id

        await conn.query(`DELETE FROM users WHERE id = ${userId};`);

        res.status(200).json({ success: "Los datos se han eliminado correctamente" });
        
    } catch (error) {

        res.status(500).json({ error: `Ha habido un error al eliminar el usuario de la base de datos: ${error}` });

    } finally {

        if (conn) conn.end();

    }

});

// PUT /api/usuarios/:id -> Cambia el nombre del usuario
app.put("/api/usuarios/:id", async (req, res) => {

    let conn;

    try {

        conn = await pool.getConnection();
        await conn.query("USE users_groups;");

        const newName = req.body.name;

        await conn.query(`UPDATE users SET name = (?) WHERE id = ${req.params.id};`, [newName]);

        res.status(200).json({ success: "Se ha modificado correctamente el nombre del usuario" });

    } catch (error) {

        res.status(500).json({ error: `Ha habido un error al modificar el usuario: ${error}` });

    } finally {

        if (conn) conn.end;

    }

});

// GET /api/grupos -> Devuelve todos los grupos junto con sus usuarios
app.get("/api/grupos", async (req, res) => {

    let conn;

    try {

        conn = await pool.getConnection();
        await conn.query("USE users_groups;");

        const result = await conn.query("SELECT * FROM groups;");

        res.json(result);
        
    } catch (error) {

        res.status(500).json({ error: `Ha habido un error al devolver los datos de los grupos: ${error}` });

    } finally {

        if (conn) conn.end();

    }

});

// GET /api/grupos/:id -> Devuelve un grupo en concreto junto con sus usuarios
app.get("/api/grupos/:id", async (req, res) => {

    let conn;

    try {

        conn = await pool.getConnection();
        await conn.query("USE users_groups;");

        const groupId = req.params.id;

        const groupResult = await conn.query(`SELECT * FROM groups WHERE id = ?;`, [groupId]);

        if (groupResult.length === 0) {

            return res.status(404).json({ error: "El grupo no existe" });

        }

        const group = groupResult[0];

        const usersResult = await conn.query(`

            SELECT u.id, u.name 
            FROM users u 
            INNER JOIN users_groups ug ON u.id = ug.user_id 
            WHERE ug.group_id = ?;
        `, [groupId]

        );

        const response = {

            ...group,
            usuarios: usersResult
            
        };

        res.json(response);
        
    } catch (error) {

        res.status(500).json({ error: `Ha habido un error al devolver los datos del grupo: ${error}` });

    } finally {

        if (conn) conn.end();

    }

});

// POST /api/grupos/ -> Añade un grupo a la base de datos
app.post("/api/grupos", async (req, res) => {

    let conn;

    try {

        conn = await pool.getConnection();
        await conn.query("USE users_groups;");


        const name = req.body.name;
        await conn.query("INSERT INTO groups (name) VALUES (?);", [name]);

        res.status(201).json({ success: "Los datos se han insertado correctamente" });
        
    } catch (error) {

        res.status(500).json({ error: `Ha habido un error al añadir el grupo a la base de datos: ${error}` });

    } finally {

        if (conn) conn.end();

    }

});

// DELETE /api/grupos/:id -> Elimina un grupo de la base de datos
app.delete("/api/grupos/:id", async (req, res) => {

    let conn;

    try {

        conn = await pool.getConnection();
        await conn.query("USE users_groups;");

        const groupId = req.params.id;

        await conn.query(`DELETE FROM groups WHERE id = ${groupId};`);

        res.status(200).json({ success: "Los datos se han eliminado correctamente" });
        
    } catch (error) {

        res.status(500).json({ error: `Ha habido un error al eliminar el grupo de la base de datos: ${error}` });

    } finally {

        if (conn) conn.end();

    }

});

// POST /api/grupos/:id_grupo/:id_usuario -> Añade un usuario a un grupo
app.post("/api/grupos/:id_grupo/:id_usuario", async (req, res) => {

    let conn;

    try {

        conn = await pool.getConnection();
        await conn.query("USE users_groups;");

        const groupId = parseInt(req.params.id_grupo, 10);
        const userId = parseInt(req.params.id_usuario, 10);

        if (Number.isNaN(groupId) || Number.isNaN(userId)) {

            return res.status(400).json({ error: "Los ids de grupo/usuario deben ser numéricos" });

        }

        const result = await conn.query("INSERT INTO users_groups (user_id, group_id) VALUES (?, ?);", [userId, groupId]);

        if (result && (result.affectedRows === 1 || result.insertId)) {

            return res.status(201).json({ success: "Usuario añadido al grupo correctamente" });
            
        }

        res.status(500).json({ error: "No se pudo añadir el usuario al grupo" });
        
    } catch (error) {

        res.status(500).json({ error: `Ha habido un error al añadir el usuario al grupo: ${error}` });

    } finally {

        if (conn) conn.end();

    }

});

// DELETE /api/grupos/:id_grupo/:id_usuario -> Elimina un usuario de un grupo
app.delete("/api/grupos/:id_grupo/:id_usuario", async (req, res) => {

    let conn;

    try {

        conn = await pool.getConnection();
        await conn.query("USE users_groups;");

        const groupId = parseInt(req.params.id_grupo, 10);
        const userId = parseInt(req.params.id_usuario, 10);

        if (Number.isNaN(groupId) || Number.isNaN(userId)) {

            return res.status(400).json({ error: "Los ids de grupo/usuario deben ser numéricos" });

        }

        const result = await conn.query("DELETE FROM users_groups WHERE user_id = ? AND group_id = ?;", [userId, groupId]);

        if (result && result.affectedRows && result.affectedRows > 0) {

            return res.status(200).json({ success: "Usuario eliminado del grupo correctamente" });

        }

        res.status(404).json({ error: "La relación usuario-grupo no existe" });
        
    } catch (error) {

        res.status(500).json({ error: `Ha habido un error al eliminar el usuario del grupo: ${error}` });

    } finally {

        if (conn) conn.end();

    }

});

// PUT /api/grupos/:id -> Cambia el nombre del grupo
app.put("/api/grupos/:id", async (req, res) => {

    let conn;

    try {

        conn = await pool.getConnection();
        await conn.query("USE users_groups");

        const newName = req.body.name;

        await conn.query(`UPDATE groups SET name = (?) WHERE id = ${req.params.id};`, [newName]);

        res.status(200).json({ success: "Se ha modificado correctamente el nombre del grupo" })

    } catch (error) {

        res.status(500).json({ error: `Ha habido un error al modificar el nombre del grupo: ${error}` });

    } finally {

        if (conn) conn.end();

    }

});

// Esperar a que la base de datos esté lista
async function waitForDB() {

    let connected = false;

    console.log("Esperando a que MariaDB esté lista...");

    while (!connected) {

        try {

            const conn = await pool.getConnection();
            await conn.ping();
            conn.release();
            connected = true;
            console.log("MariaDB está lista.");

        } catch (err) {

            console.log("MariaDB no está lista. Reintentando en 2 segundos...");
            await new Promise(res => setTimeout(res, 2000));

        }

    }
    
}

// Inicializar base de datos en caso de que no esté creada
async function startDatabase() {
    
    let conn;

    try {

        conn = await pool.getConnection();

        await conn.query("CREATE DATABASE IF NOT EXISTS users_groups;");

        await conn.query("USE users_groups;")

        await conn.query("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(30) NOT NULL);");

        await conn.query("CREATE TABLE IF NOT EXISTS groups (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(30) NOT NULL);");

        await conn.query("CREATE TABLE IF NOT EXISTS users_groups (user_id INT NOT NULL, group_id INT NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE ON UPDATE CASCADE);")

    } catch (error) {

        console.log(`Ha habido un error al inicializar la base de datos: ${error}`);

    } finally {

        if (conn) conn.end();

    }

}

waitForDB().then(() => startDatabase());