const postBtn2 = document.getElementById("postBtn");
const postBtnForm = document.getElementById("postBtnForm");
const form = document.getElementById("form");
const nombre = document.getElementById("nombreInput");
const precio = document.getElementById("precioInput");
const descripcion = document.getElementById("descripcionInput");
const articulosDiv = document.getElementById("articulos-div");
const player = document.getElementById("player");
const tomarFoto = document.getElementById("tomar-foto-btn");
const photoBtn = document.getElementById("photo-btn");
const camaraContenedor = document.getElementById("camara-contenedor");

const googleMapKey = "AIzaSyA5mjCwx1TRLuBAjwQw84WE6h5ErSe7Uj8";

let latitude = "";
let longitude = "";
let foto = "";

navigator.geolocation.getCurrentPosition((pos) => {
  latitude = pos.coords.latitude;
  longitude = pos.coords.longitude;
});

class Camara {
  constructor(videoNode) {
    this.videoNode = videoNode;
    console.log("Camara initialized");
  }

  encender() {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { width: 300, height: 300 },
      })
      .then((stream) => {
        this.videoNode.srcObject = stream;
        this.stream = stream;
      });
  }

  apagar() {
    this.videoNode.pause();

    if (this.stream) {
      this.stream.getTracks()[0].stop();
    }
  }

  tomarFoto() {
    let canvas = document.createElement("canvas");

    canvas.setAttribute("width", 300);
    canvas.setAttribute("height", 300);

    let context = canvas.getContext("2d");

    context.drawImage(this.videoNode, 0, 0, canvas.width, canvas.height);

    this.foto = context.canvas.toDataURL();
    console.log(this.foto);

    canvas = null;
    context = null;

    return this.foto;
  }
}

const db = new PouchDB("articulos");
const camara = new Camara(player);

const addArticulo = () => {
  if (nombre.value === "") {
    alert("Completa el campo nombre");
    return;
  }

  if (precio.value === "") {
    alert("Completa el campo precio");
    return;
  }

  if (descripcion.value === "") {
    alert("Completa el campo descripcion");
    return;
  }

  const articulo = {
    _id: new Date().toISOString(),
    nombre: nombre.value,
    precio: precio.value,
    descripcion: descripcion.value,
    foto: foto,
    latitude: latitude,
    longitude: longitude,
  };

  db.put(articulo).then(console.log("Insertado")).catch(console.log);
  showArticulos();
};

postBtn2.addEventListener("click", () => {
  postBtn2.classList.add("hidden");
  articulosDiv.classList.add("hidden");
  form.classList.remove("hidden");
});

postBtnForm.addEventListener("click", (e) => {
  e.preventDefault();
  addArticulo();
});

photoBtn.addEventListener("click", (e) => {
  e.preventDefault();
  camaraContenedor.classList.remove("hidden");
  photoBtn.classList.add("hidden");
  camara.encender();
});

tomarFoto.addEventListener("click", (e) => {
  e.preventDefault();
  foto = camara.tomarFoto();
  camara.apagar();
});

const comprarArticulo = (id) => {
  db.get(id)
    .then((doc) => {
      db.remove(doc);
    })
    .then((result) => {
      alert("Has comprado este articulo");
      showArticulos();
    });
};

const verArticulo = (id) => {
  articulosDiv.innerHTML = "";
  postBtn2.classList.add("hidden");

  db.get(id).then((doc) => {
    articulosDiv.innerHTML += `<div class="mx-auto mt-3 text-center">
      <div class="mx-auto px-5 mb-3">
        <div class="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          <div
            class="max-w-xl">
            <a href="#">
              <img class="rounded-t-lg px-5 py-2" src="${doc.foto}" alt="step3">
        </a>
              <div class="p-5">
                  <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">${doc.nombre}</h5>
                <div class="text-teal-700 mt-1 mb-2">${doc.descripcion}</div>
                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">$ ${doc.precio}</h5>
                <br />
                <br />
                <p>Ubicacion</p>
                <div class="pb-5">
                  <iframe
                    width="100%"
                    height="250"
                    frameborder="0"
                    src="https://www.google.com/maps/embed/v1/view?key=${googleMapKey}&center=${doc.latitude},${doc.longitude}&zoom=17">
                  </iframe>
                </div>

                <button onclick="comprarArticulo('${doc._id}')" class="inline-flex items-center py-2 px-3 text-sm font-medium text-white text-center rounded-lg bg-red-400">
                  Comprar articulo
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>`;
  });
};

const showArticulos = () => {
  nombre.value = "";
  precio.value = "";
  descripcion.value = "";

  camaraContenedor.classList.add("hidden");
  photoBtn.classList.remove("hidden");
  postBtn2.classList.remove("hidden");
  form.classList.add("hidden");
  articulosDiv.classList.remove("hidden");
  articulosDiv.innerHTML = "";

  db.allDocs({ include_docs: true, descending: false }).then((doc) => {
    doc.rows.map((elm) => {
      articulosDiv.innerHTML += `<div class="mx-auto mt-3 text-center">
        <div class="mx-auto px-5 mb-3">
          <div class="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            <div
              class="max-w-xl bg-white rounded-lg border border-red-400 shadow-md">
              <a href="#">
                <img class="rounded-t-lg px-5 py-2" src="${elm.doc.foto}" alt="step3">
          </a>
                <div class="p-5">
                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">${elm.doc.nombre}</h5>
                  <div class="text-xs font-bold uppercase text-teal-700 mt-1 mb-2">${elm.doc._id}</div>
                  <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">$ ${elm.doc.precio}</h5>
                  <button onclick="verArticulo('${elm.doc._id}')" class="inline-flex items-center py-2 px-3 text-sm font-medium text-white text-center rounded-lg bg-red-400">
                    Ver articulo
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>`;
    });
  });
};

showArticulos();
