import autocannon from 'autocannon';

function runLoadTest() {
  console.log('Iniciando teste de carga de 30 segundos no endpoint CSRF Token...');

  const instance = autocannon({
    url: 'http://localhost:3000/api/csrf-token',
    connections: 100,
    pipelining: 10,
    duration: 30,
    method: 'GET',
  });

  autocannon.track(instance, { renderProgressBar: true });

  instance.on('done', (result) => {
    console.log('\n--- Resultados do Teste de Carga ---');
    console.log(`Duração: ${result.duration}s`);
    console.log(`Conexões simultâneas: ${result.connections}`);
    console.log(`Requisições concluídas: ${result.requests.total}`);
    console.log(`Média de requisições/s: ${result.requests.average}`);
    console.log(`Latência Média: ${result.latency.average}ms`);
    console.log(`Latência p95: ${result.latency.p95}ms`);
    console.log(`Latência p99: ${result.latency.p99}ms`);
    console.log(`Erros/Timeouts: ${result.errors} / ${result.timeouts}`);
    console.log('------------------------------------\n');
  });
}

runLoadTest();
