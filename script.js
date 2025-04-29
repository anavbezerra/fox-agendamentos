document.addEventListener('DOMContentLoaded', function() {
    carregarAgendamentos();

    // Definir a data mínima para o campo de data no formato YYYY-MM-DD
    const hoje = new Date();
    const dataHoje = hoje.toISOString().split('T')[0]; // Formata para o padrão YYYY-MM-DD
    document.getElementById('data').setAttribute('min', dataHoje); // Impede datas passadas

    // Deixar o campo de data vazio inicialmente (sem valor)
    document.getElementById('data').value = ""; // Limpa o campo de data
});

document.getElementById('form-agendamento').addEventListener('submit', function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const data = document.getElementById('data').value;
    const inicio = document.getElementById('inicio').value;
    const fim = document.getElementById('fim').value;
    const status = document.getElementById('status').value;
    const valor = calcularValor(inicio, fim);

    // Verificar se a data é válida
    const dataAtual = new Date();
    const dataAgendamento = new Date(data);

    // Resetar a hora para as 00:00:00 de ambas as datas
    dataAtual.setHours(0, 0, 0, 0); 
    dataAgendamento.setHours(0, 0, 0, 0); 

    // Verificar se a data escolhida já passou
    if (dataAgendamento < dataAtual) {
        alert("Não é possível agendar para uma data que já passou.");
        return;  
    }

    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];

    // Verificação se já existe um agendamento para o mesmo horário
    const horarioOcupado = agendamentos.some(agendamento => {
        return agendamento.data === data &&
            ((inicio >= agendamento.inicio && inicio < agendamento.fim) || 
            (fim > agendamento.inicio && fim <= agendamento.fim) || 
            (inicio <= agendamento.inicio && fim >= agendamento.fim));
    });

    if (horarioOcupado) {
        alert("Este horário já está ocupado para esta data. Escolha outro horário.");
        return;  
    }

    // Checando se estamos editando um agendamento ou criando um novo
    const dataOriginal = document.getElementById('data').getAttribute('data-original');
    if (dataOriginal) {
        // Editando um agendamento
        agendamentos = agendamentos.map(agendamento => {
            if (agendamento.data === dataOriginal) {
                return { nome, data, inicio, fim, status, valor }; // Substituindo o agendamento antigo
            }
            return agendamento; // Mantendo os outros inalterados
        });
        alert("Agendamento atualizado com sucesso!");
    } else {
        // Criando um novo agendamento
        const novoAgendamento = { nome, data, inicio, fim, status, valor };
        agendamentos.push(novoAgendamento);
    }

    // Atualizando o localStorage com os novos dados
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    carregarAgendamentos();

    // Resetando o formulário
    document.getElementById('form-agendamento').reset();
    document.getElementById('data').removeAttribute('data-original'); // Remover atributo para não editar mais

    // Resetando a data para hoje após agendamento
    resetarData();
});

function carregarAgendamentos() {
    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    agendamentos.sort((a, b) => new Date(a.data) - new Date(b.data));

    const lista = document.getElementById('lista-agendamentos');
    lista.innerHTML = '';

    agendamentos.forEach(agendamento => {
        const dataFormatada = formatarData(agendamento.data);

        const li = document.createElement('li');
        li.className = 'agendamento';
        li.innerHTML = `
            <strong>${agendamento.nome}</strong><br>
            Data: ${dataFormatada}<br>
            Início: ${agendamento.inicio}<br>
            Fim: ${agendamento.fim}<br>
            Status: ${agendamento.status}<br>
            Valor: R$ ${agendamento.valor}
            <br>
            <button onclick="editarAgendamento(this)">Editar</button>
            <button onclick="excluirAgendamento(this)">Excluir</button>
        `;
        lista.appendChild(li);
    });
}

function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function editarAgendamento(botao) {
    const item = botao.parentElement;
    const partes = item.innerText.split('\n');

    document.getElementById('nome').value = partes[0].trim();
    document.getElementById('data').value = partes[1].replace('Data: ', '').trim();
    document.getElementById('inicio').value = partes[2].replace('Início: ', '').trim();
    document.getElementById('fim').value = partes[3].replace('Fim: ', '').trim();
    document.getElementById('status').value = partes[4].replace('Status: ', '').trim();

    // Salvar a data original para uso futuro
    document.getElementById('data').setAttribute('data-original', partes[1].replace('Data: ', '').trim());
}

function excluirAgendamento(botao) {
    const item = botao.parentElement;
    item.remove();

    let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const nomeAgendamento = item.querySelector('strong').textContent;
    agendamentos = agendamentos.filter(agendamento => agendamento.nome !== nomeAgendamento);

    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    carregarAgendamentos();

    // Resetando a data para hoje após exclusão de agendamento
    resetarData();
}

function resetarData() {
    // Resetando o campo de data para vazio
    document.getElementById('data').value = "";
}

function calcularValor(inicio, fim) {
    const [horaInicio, minutoInicio] = inicio.split(':').map(Number);
    const [horaFim, minutoFim] = fim.split(':').map(Number);

    const inicioEmMinutos = horaInicio * 60 + minutoInicio;
    const fimEmMinutos = horaFim * 60 + minutoFim;

    const duracao = (fimEmMinutos - inicioEmMinutos) / 60;
    return (duracao * 20).toFixed(2);
}
