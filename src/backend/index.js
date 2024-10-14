//=======[ Settings, Imports & Data ]==========================================

var PORT    = 3000;

var express = require('express');
var app = express();
const utils = require('./mysql-connector');

console.log('utils.query:', typeof utils.query);

// to parse application/json
app.use(express.json()); 
// to serve static files
app.use(express.static('/home/node/app/static/'));

//=======[ Main module code ]==================================================

// Function to handle SQL errors
function handleSQLError(res, error) {
    console.error('Error en la consulta SQL:', error);
    res.status(409).send({ error: error.sqlMessage });
}


// Get all devices
app.get('/devices', function(req, res, next) {
    utils.query("SELECT * FROM Devices", (error,respuesta,fields) => {
        if(error){
            handleSQLError(res, error);
        }else{
            res.status(200).json(respuesta);
        }
    });
 });


// Get a device by id
app.get('/device/:id', (req,res) => {
    const query = "SELECT id, description FROM Devices WHERE id = ?"
    utils.query(query, [req.params.id],(error,respuesta,fields) => {
        if(error){
            handleSQLError(res, error);
        }else{
            if (respuesta.length >0) {
                res.status(200).json(respuesta[0]);
            } else {
                res.status(404).json({ error: "Dispositivo no encontrado"});
            }
        }
        
    });
});

// Insert a new device
app.post('/device/new', (req,res) => {
    console.log(req.body)
    const { name, description, state, type } = req.body;
    if (name && description && state !== undefined && type !== undefined) {
        // Verify if ID exist
        const checkQuery = "SELECT * FROM Devices WHERE id = ?";
        utils.query(checkQuery, [req.body.id], (error, result) => {
            if (error) {
                handleSQLError(res, error);
            } else if (result.length > 0) {
                res.status(409).json({ error: "El ID ya existe" });
            } else {
                // SQL query with prepared statements to prevent SQL injection
                const insertQuery = "INSERT INTO Devices (name, description, state, type) VALUES (?, ?, ?, ?)";
                utils.query(insertQuery, [name, description, state, type], (error, respuesta, fields) => {
                    if (error) {
                        handleSQLError(res, error);
                    } else {
                        res.status(201).json({ mensaje: "Dispositivo creado exitosamente!"});
                    }
                });
            }
        });
    } else {
        res.status(400).json({ error: "Datos incompletos para crear el dispositivo"});
    }
});

// Update the status of a device
app.put('/device/state', (req, res) => {
    const { id, state, name, description } = req.body;
    // Input validation
    if (id && state !== undefined) {
        // SQL query with prepared parameters
        const query = "UPDATE Devices SET state = ?, name = ?, description = ? WHERE id = ?";        
        utils.query(query, [state, name, description, id], (error) => {
            if (error) {
                handleSQLError(res, error);
            } else {
                res.status(204).send(); // 204 No Content, with out response
            }
        });
    } else {
        // Respond with an error if data is missing
        res.status(400).json({ error: "Falta el estado para actualizar" });
    }
});

app.put('/device/states', (req, res) => {
    const { id, state } = req.body;
    // Input validation
    if (id && state !== undefined) {
        // SQL query with prepared parameters
        const query = "UPDATE Devices SET state = ? WHERE id = ?";        
        utils.query(query, [state, id], (error) => {
            if (error) {
                handleSQLError(res, error);
            } else {
                res.status(204).send(); // 204 No Content, with out response
            }
        });
    } else {
        // Respond with an error if data is missing
        res.status(400).json({ error: "Falta el estado para actualizar" });
    }
});

// Delete device by id
app.delete('/device/:id', (req, res) => {
    const query = "DELETE FROM Devices WHERE id = ?";
    utils.query(query, [req.params.id], (error) => {
        if (error){
            handleSQLError(res, error);
        } else{
            res.status(204).send();
        }
    });
});



app.get('/usuario',function(req,res){

    res.send("[{id:1,name:'mramos'},{id:2,name:'fperez'}]")
});
//Insert
app.post('/usuario',function(req,res){
    console.log(req.body.id);
    if(req.body.id!=undefined && req.body.name!=undefined){
        //insert en la tabla
        res.send();
    }else{
        let mensaje = {mensaje:'El id o el name no estaban cargados'}
        res.status(400).send(JSON.stringify(mensaje));
    }
    
});

app.post('/device/',function(req,res){
    const query = "UPDATE Devices SET state = ? WHERE id = ?"
    utils.query(query, [req.body.status, req.body.id], (error, resp) => {
            if(error){
                console.log(error.sqlMessage)
                res.status(409).send(error.sqlMessage);
            } else{
                res.send("ok " + resp);
            }
    });
});


/*
app.get('/devices/', function(req, res, next) {
    
    devices = [
        { 
            'id': 1, 
            'name': 'Lampara 1', 
            'description': 'Luz living', 
            'state': 0, 
            'type': 1, 
        },
        { 
            'id': 2, 
            'name': 'Ventilador 1', 
            'description': 'Ventilador Habitacion', 
            'state': 1, 
            'type': 2, 
        }, { 
            'id': 3, 
            'name': 'Luz Cocina 1', 
            'description': 'Cocina', 
            'state': 1, 
            'type': 2, 
        },
    ]
    res.send(JSON.stringify(devices)).status(200);
});
*/

app.listen(PORT, function(req, res) {
    console.log("NodeJS API running correctly");
});

//=======[ End of file ]=======================================================
