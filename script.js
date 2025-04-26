document.addEventListener('DOMContentLoaded', carregarAgendamentos);

document.getElementById('form-agendamento').addEventListener('submit', function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const data = document.getElementById('data').value;
    const inicio = document.getElementById('inicio').value;
    const fim = document.getElementById('fim').value;
    const status = document.getElementById('status').value;
    const valor = calcularValor(inicio, fim);

    const novoAgendamento = { nome, data, inicio, fim, status, valor };

    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    agendamentos.push(novoAgendamento);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    adicionarNaLista(novoAgendamento);
    document.getElementById('form-agendamento').reset();
});

function carregarAgendamentos() {
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    agendamentos.forEach(adicionarNaLista);
}

function adicionarNaLista(agendamento) {
    const lista = document.getElementById('lista-agendamentos');

    const li = document.createElement('li');
    li.className = 'agendamento';
    li.innerHTML = `
        <strong>${agendamento.nome}</strong><br>
        Data: ${agendamento.data}<br>
        Início: ${agendamento.inicio}<br>
        Fim: ${agendamento.fim}<br>
        Status: ${agendamento.status}<br>
        Valor: R$ ${agendamento.valor}
        <br>
        <button onclick="editarAgendamento(this)">Editar</button>
        <button onclick="excluirAgendamento(this)">Excluir</button>
    `;
    lista.appendChild(li);
}

function editarAgendamento(botao) {
    const item = botao.parentElement;
    const partes = item.innerText.split('\n');

    document.getElementById('nome').value = partes[0];
    document.getElementById('data').value = partes[1].replace('Data: ', '');
    document.getElementById('inicio').value = partes[2].replace('Início: ', '');
    document.getElementById('fim').value = partes[3].replace('Fim: ', '');
    document.getElementById('status').value = partes[4].replace('Status: ', '');

    excluirAgendamento(botao);
}

function excluirAgendamento(botao) {
    const item = botao.parentElement;
    item.remove();

    const agendamentos = Array.from(document.querySelectorAll('.agendamento')).map(li => {
        const partes = li.innerText.split('\n');
        return {
            nome: partes[0],
            data: partes[1].replace('Data: ', ''),
            inicio: partes[2].replace('Início: ', ''),
            fim: partes[3].replace('Fim: ', ''),
            status: partes[4].replace('Status: ', ''),
            valor: partes[5].replace('Valor: R$ ', '')
        };
    });

    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
}

function calcularValor(inicio, fim) {
    const [horaInicio, minutoInicio] = inicio.split(':').map(Number);
    const [horaFim, minutoFim] = fim.split(':').map(Number);

    const inicioEmMinutos = horaInicio * 60 + minutoInicio;
    const fimEmMinutos = horaFim * 60 + minutoFim;

    const duracao = (fimEmMinutos - inicioEmMinutos) / 60;
    return (duracao * 20).toFixed(2);
}
