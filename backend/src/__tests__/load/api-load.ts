import autocannon from 'autocannon';
import type { Result } from 'autocannon';

function runLoadTest() {
  console.log('Iniciando teste de carga de 30 segundos no endpoint CSRF Token...');

  const instance = autocannon({
    url: 'http://localhost:3000/api/csrf-token',
    connections: 100,
    pipelining: 10,
    duration: 30,
    method: 'GET',
  }, (err: unknown, result: Result) => {
    if (err) {
      console.error('Erro na execução do teste:', err);
      return;
    }
    
    console.log('\n--- Resultados do Teste de Carga ---');
    console.log(`Duração: ${result.duration}s`);
    console.log(`Conexões simultâneas: ${result.connections}`);
    console.log(`Requisições concluídas: ${result.requests.total}`);
    console.log(`Média de requisições/s: ${result.requests.average}`);
    console.log(`Latência Média: ${result.latency.average}ms`);
    console.log(`Latência p97.5: ${result.latency.p97_5}ms`);
    console.log(`Latência p99: ${result.latency.p99}ms`);
    console.log(`Erros/Timeouts: ${result.errors} / ${result.timeouts}`);
    console.log('------------------------------------\n');
  });

  autocannon.track(instance, { renderProgressBar: true });
}

runLoadTest();