function Validador(event) {
  // Evita que a página recarregue se a função for chamada dentro de um <form>
  if (event) event.preventDefault();

  const login = document.getElementById('login').value;
  const senha = document.getElementById('senha').value;

  const usuarios = {
    "rh1": { senha: "123", perfil: "rh" },
    "gestor1": { senha: "123", perfil: "gestor" },
    "func1": { senha: "123", perfil: "colaborador" }
  };

  const usuario = usuarios[login];

  if (usuario && usuario.senha === senha) {
    if (usuario.perfil === "rh") {
      window.location.href = "rh.html";
    } else if (usuario.perfil === "gestor") {
      window.location.href = "gestor.html";
    } else {
      window.location.href = "funcionario.html";
    }
  } else {
    alert("Login ou senha inválidos");
  }
}
