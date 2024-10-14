class Main implements EventListenerObject {
    private nombre: string = "matias";
    private users: Array<Usuario> = new Array();
    private devices: Array<Device> = [];

    constructor() {
        this.users.push(new Usuario('mramos', '123132'));
        
        let btn = this.recuperarElemento("btn");
        btn.addEventListener('click', this);
        let btnBuscar = this.recuperarElemento("btnBuscar");
        btnBuscar.addEventListener('click', this);
        let btnLogin = this.recuperarElemento("btnLogin");
        btnLogin.addEventListener('click', this);
        let btnPost = this.recuperarElemento("btnPost");
        btnPost.addEventListener('click', this);

        let btnAddDevice = this.recuperarElemento("btnAddDevice");
        btnAddDevice.addEventListener('click', this);
        let btnShowAddDevice = this.recuperarElemento("btnShowAddDevice");
        btnShowAddDevice.addEventListener('click', this);
    }

    handleEvent(object: Event): void {
        const elementId = (<HTMLElement>object.target).id;

        // Handler State switch
        if (elementId.startsWith("cb_")) {
            // Change state Switch
            let inputElement = <HTMLInputElement>object.target;
            let deviceId = parseInt(inputElement.getAttribute("idBd")!);
            let newState = inputElement.checked;

            this.actualizarEstadoDispositivo(deviceId, newState);
            return;
        }

        // Others handlers
        const handlers: { [key: string]: () => void} = {
            'btn': () => {
                let divLogin = this.recuperarElemento("divLogin");
                divLogin.hidden = false;
            },
            'btnBuscar': () => this.buscarDevices(),
            'btnShowAddDevice': () => {
                let modalElem = document.getElementById('addDeviceModal');
                if (modalElem){
                    let modalInstance = M.Modal.getInstance(modalElem);
                    if (modalInstance) {
                        modalInstance.open();
                    
                    // Clean modal data
                    (<HTMLInputElement>document.getElementById("nameDevice")).value = "";
                    (<HTMLInputElement>document.getElementById("descriptionDevice")).value = "";
                    (<HTMLInputElement>document.getElementById("typeDevice")).value = "";
                    (<HTMLInputElement>document.getElementById("stateDevice")).checked = false;
                    } else {
                        console.error("No se pudo inicializar el modal para agregar dispositivo");
                    }
                }
            },
            'btnAddDevice': () => {                
                let nombreDispositivo: string = this.recuperarElemento("nameDevice").value;
                let descriptionDispositivo: string = this.recuperarElemento("descriptionDevice").value;
                let tipoDispositivo: number = Number(this.recuperarElemento("typeDevice").value);
                let estadoDispositivo: boolean = Boolean(this.recuperarElemento("stateDevice").checked);
                
                let newDevice = {
                    name: nombreDispositivo,
                    description: descriptionDispositivo,
                    type:  tipoDispositivo,
                    state: estadoDispositivo
                };
                console.log(newDevice)
                // Device newDevice = new Device (idDispositivo, nombreDispositivo, descriptionDispositivo, estadoDispositivo, tipoDispositivo)

                let xmlHttp = new XMLHttpRequest();
                xmlHttp.open("POST", "http://localhost:8000/device/new", true);
                xmlHttp.setRequestHeader("Content-Type", "application/json");

                xmlHttp.onreadystatechange = () => {
                    if (xmlHttp.readyState === 4) {
                        if (xmlHttp.status === 200) {
                            console.log("Dispositivo agregado exitosamente", xmlHttp.responseText);

                            // Close modal
                            let modalElem = document.getElementById('addDeviceModal');
                            let modalInstance = M.Modal.getInstance(modalElem);
                            if (modalInstance) {
                                modalInstance.close();
                            }

                        } else {
                            console.error("Error en la solicitud", xmlHttp.responseText);
                        }
                    }
                };

                xmlHttp.send(JSON.stringify(newDevice));
                // Update list devices
                this.buscarDevices();
            },
            'btnLogin': () => {
                console.log("login")
                let iUser = this.recuperarElemento("userName");
                let iPass = this.recuperarElemento("userPass");
                let usuarioNombre: string = iUser.value;
                let usuarioPassword: string = iPass.value;
                
                if (usuarioNombre.length >= 4 && usuarioPassword.length >= 6) {
                    console.log("Voy al servidor... ejecuto consulta")
                    let usuario: Usuario = new Usuario(usuarioNombre, usuarioPassword);
                    let checkbox = this.recuperarElemento("cbRecor");
                    
                    console.log(usuario, checkbox.checked);
                    iUser.disabled = true;
                    (<HTMLInputElement>object.target).disabled = true;
                    let divLogin = this.recuperarElemento("divLogin");
                    divLogin.hidden = true;
                } else {
                    alert("El usuario o la contraseña son icorrectas");
                }
            }
        };

        

        const handler = handlers[(<HTMLElement>object.target).id];
        if (handler) {
            handler();
        } else {
            console.error("No se encontro un manejador para el evento")
        }
    }

    private buscarDevices(): void {
        let xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    let ul = this.recuperarElemento("list")
                    let listaDevices: string = '';
                   
                    let lista: Array<Device> = JSON.parse(xmlHttp.responseText);
                    
                    for (let item of lista) {
                        listaDevices += `
                        <li class="collection-item avatar">
                            <img src="./static/images/lightbulb.png" alt="" class="circle">
                            <div style="flex-grow: 1; margin-left: 15px;">
                                <span class="title" style="font-weight: bold;">${item.name}</span>
                                <p>${item.description}</p>
                                <div class="switch">
                                    <label>
                                        Off`;
                                        if (item.state) {
                                            listaDevices +=`<input idBd="${item.id}" id="cb_${item.id}" type="checkbox" checked>`
                                        } else {
                                            listaDevices +=`<input idBd="${item.id}"  name="chk" id="cb_${item.id}" type="checkbox">`
                                        }
                                        listaDevices +=`

                                        <span class="lever"></span>
                                        On
                                    </label>
                                </div>
                            </div>
                            <div style="flex-shrink: 0; display: flex; flex-direction: column; gap: 5px;">
                                <button id="edit_${item.id}" class="btn-small waves-effect waves-light blue" style="margin-left:10px;">Editar</button>
                                <button id="delete_${item.id}" class="btn-small waves-effect waves-light red" style="margin-left:10px;">Eliminar</button>
                            </div>
                        </li>`;
                    }

                        ul.innerHTML = listaDevices;

                        // Add events for buttons Edit and Delete
                        for(let item of lista) {
                            let btnEditar = this.recuperarElemento("edit_" + item.id);
                            let btnEliminar = this.recuperarElemento("delete_" + item.id);

                            btnEditar.addEventListener("click", (event) => this.editarDevice(item.id));
                            btnEliminar.addEventListener("click", (event) => this.eliminarDevice(item.id));
                        }

                        for (let item of lista) {
                            let cb = this.recuperarElemento("cb_" + item.id);
                            cb.addEventListener("click", this);
                        }
                } else {
                    alert("ERROR en la consulta");
                }
            }
            
        }

        xmlHttp.open("GET", "http://localhost:8000/devices", true);

        xmlHttp.send();
    }

    private recuperarElemento(id: string):HTMLInputElement {
        return <HTMLInputElement>document.getElementById(id);
    }

    private eliminarDevice(id: number): void {
        let confirmar = confirm("¿Estas seguro de que deseas eliminar este dispositivo?");
        if (confirmar) {
            let xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = () => {
                if (xmlHttp.readyState == 4) {
                    if (xmlHttp.status == 204) {
                        console.log("Dispositivo eliminado exitosamente");
                        this.buscarDevices(); // Try again search devices
                    } else {
                        console.error("Error al eliminar", xmlHttp.responseText);
                    }
                }
            };

            xmlHttp.open("DELETE", `http://localhost:8000/device/${id}`, true);
            xmlHttp.setRequestHeader("Content-Type", "application/json");
            xmlHttp.send();
        }
    }

    private editarDevice(id: number): void {
        // Get modal
        let modalElem = document.getElementById('editDeviceModal');
        let modalInstance = M.Modal.getInstance(modalElem);

        // Complete info
        let nombreInput= <HTMLInputElement>this.recuperarElemento("editNameDevice");
        let descriptionInput = <HTMLInputElement>this.recuperarElemento("editDescriptionDevice");
        let tipoInput = <HTMLInputElement>this.recuperarElemento("editTypeDevice");
        let estadoCheckbox = <HTMLInputElement>this.recuperarElemento("editStateDevice");
        
        let dispositivo = this.obtenerDispositivoPorId(id);

        if (dispositivo) {
            nombreInput.value = dispositivo.name;
            descriptionInput.value = dispositivo.description;
            tipoInput.value = dispositivo.type.toString();
            estadoCheckbox.checked = dispositivo.state;
        }
        
        // Update labels
        M.updateTextFields();

        // Open modal
        modalInstance.open();

        // Add event to save changes
        let btnGuardar = this.recuperarElemento("saveEditDevice");
        btnGuardar.onclick = () => {
            this.guardarCambiosDispositivo(id);
        };
    }

    private obtenerDispositivoPorId(id: number): Device | undefined {
        // Share device
        let dispositivo = this.devices.find(device => device.id === id);
        if (!dispositivo) {
            console.error(`Dispositivo con ID ${id} no encontrado`);
        }
        return dispositivo;
    }

    private guardarCambiosDispositivo(id: number): void {
        let nombre= (<HTMLInputElement>this.recuperarElemento("editNameDevice")).value;
        let descripcion = (<HTMLInputElement>this.recuperarElemento("editDescriptionDevice")).value;
        let tipo = parseInt((<HTMLInputElement>this.recuperarElemento("editTypeDevice")).value);
        let estado = (<HTMLInputElement>this.recuperarElemento("editStateDevice")).checked;

        // Validated with inputs
        if (!nombre || !descripcion || isNaN(tipo)) {
            alert("Los campos nombre, descripción y tipo son obligatorios.");
            return;
        }

        // Create object
        let updatedDevice = {
            id: id,
            name: nombre,
            description: descripcion,
            type: tipo,
            state: estado ? 1 : 0
        };

        console.log("Datos enviados:", updatedDevice);

        // XML Request
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 204) {
                    console.log("Dispositivo actualizado exitosamente");
                    this.buscarDevices(); // Intentar buscar dispositivos nuevamente
                } else {
                    console.error("Error al actualizar", xmlHttp.responseText);
                }
            }
        };

        xmlHttp.open("PUT", "http://localhost:8000/device/state", true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");
        xmlHttp.send(JSON.stringify(updatedDevice));
    }

    private actualizarEstadoDispositivo(deviceId: number, newState: boolean): void {
        let updatedDevice = {
            id: deviceId,
            state: newState ? 1 : 0
        };
        
        console.log("Actualizando estado:", updatedDevice);
        
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 204) {
                    console.log("Estado del dispositivo actualizado exitosamente");
                    this.buscarDevices(); // Intentar buscar dispositivos nuevamente para refrescar la lista
                } else {
                    console.error("Error al actualizar el estado del dispositivo", xmlHttp.responseText);
                }
            }
        };

        // Realizar una solicitud PUT solo con el nuevo estado
        xmlHttp.open("PUT", `http://localhost:8000/device/states`, true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");
        xmlHttp.send(JSON.stringify(updatedDevice));

    }   
    
}



window.addEventListener('load', () => {
    
    let main: Main = new Main();
    
});

document.addEventListener('DOMContentLoaded', function() {
    let modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
});

