export const TOPICS_CATALOG = {
    travel: {
        id: 'travel',
        category: 'Viagens & Culturas',
        title: 'Experiências Inesquecíveis',
        steps: [
            {
                stepNumber: 1,
                stageTitle: 'Etapa 1: Planejamento & Escolha',
                question: 'Você prefere planejar tudo com antecedência ou viajar no improviso?',
                transitionPhrase: 'To start off, I was wondering...',
                keywords: ['Book in advance', 'Itinerary', 'Budget-friendly'],
            },
            {
                stepNumber: 2,
                stageTitle: 'Etapa 2: Histórias & Perrengues',
                question: 'Qual foi o maior perrengue ou surpresa inesquecível que você já viveu viajando?',
                transitionPhrase: 'Speaking of trips, that reminds me of...',
                keywords: ['Flight delay', 'Lost luggage', 'Unexpected event'],
            },
            {
                stepNumber: 3,
                stageTitle: 'Etapa 3: Choque Cultural & Gastronomia',
                question: 'Qual costume local ou comida diferente mais te impressionou em algum lugar?',
                transitionPhrase: 'Talking about local experiences...',
                keywords: ['Culture shock', 'Local cuisine', 'Hospitality'],
            },
            {
                stepNumber: 4,
                stageTitle: 'Etapa 4: Próximos Destinos',
                question: 'Com base nas suas experiências, para onde seria a sua próxima viagem dos sonhos?',
                transitionPhrase: 'Looking ahead, if I had the chance...',
                keywords: ['Bucket list', 'Dream destination', 'Sightseeing'],
            },
        ],
    },
    career: {
        id: 'career',
        category: 'Trabalho & Tecnologia',
        title: 'O Futuro da Inteligência Artificial',
        steps: [
            {
                stepNumber: 1,
                stageTitle: 'Etapa 1: Uso no Dia a Dia',
                question: 'Como a tecnologia e ferramentas de IA têm mudado sua rotina de trabalho ou estudos?',
                transitionPhrase: 'In my daily routine, I noticed that...',
                keywords: ['Automation', 'Workflow', 'Productivity'],
            },
            {
                stepNumber: 2,
                stageTitle: 'Etapa 2: Vantagens & Desafios',
                question: 'Qual é a maior vantagem e o maior receio que você tem sobre o avanço da IA?',
                transitionPhrase: 'On the other hand, one big challenge is...',
                keywords: ['Efficiency', 'Job market', 'Data privacy'],
            },
            {
                stepNumber: 3,
                stageTitle: 'Etapa 3: Habilidades do Futuro',
                question: 'Quais habilidades humanas você acha que nunca poderão ser substituídas por máquinas?',
                transitionPhrase: 'When it comes to human skills...',
                keywords: ['Critical thinking', 'Empathy', 'Creativity'],
            },
            {
                stepNumber: 4,
                stageTitle: 'Etapa 4: Visão de Longo Prazo',
                question: 'Como você imagina que será a sua área de atuação daqui a 10 anos?',
                transitionPhrase: 'Looking into the future...',
                keywords: ['Innovation', 'Adaptability', 'Future trends'],
            },
        ],
    },
    hobbies: {
        id: 'hobbies',
        category: 'Estilo de Vida',
        title: 'Passatempos & Hábitos Diários',
        steps: [
            {
                stepNumber: 1,
                stageTitle: 'Etapa 1: Desconexão & Relaxamento',
                question: 'O que você costuma fazer para relaxar e desligar da rotina depois de um dia cansativo?',
                transitionPhrase: 'Usually, when I want to unwind, I...',
                keywords: ['Unwind', 'Leisure time', 'Daily routine'],
            },
            {
                stepNumber: 2,
                stageTitle: 'Etapa 2: Paixões & Interesses',
                question: 'Existe algum hobby antigo que você gostaria de retomar ou um novo que quer aprender?',
                transitionPhrase: 'I have always wanted to try...',
                keywords: ['Pick up a skill', 'Passionate about', 'Free time'],
            },
            {
                stepNumber: 3,
                stageTitle: 'Etapa 3: Hábitos de Saúde & Bem-Estar',
                question: 'Qual hábito simples mudou para melhor a sua energia física ou mental recentemente?',
                transitionPhrase: 'One small change that helped me was...',
                keywords: ['Mindfulness', 'Healthy habits', 'Work-life balance'],
            },
            {
                stepNumber: 4,
                stageTitle: 'Etapa 4: Fim de Semana Ideal',
                question: 'Como seria o seu final de semana perfeito se você pudesse escolher qualquer atividade?',
                transitionPhrase: 'My ideal weekend would definitely include...',
                keywords: ['Quality time', 'Outdoor activities', 'Recharge energy'],
            },
        ],
    },
};
export const getRandomTopic = () => {
    const keys = Object.keys(TOPICS_CATALOG);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return TOPICS_CATALOG[randomKey];
};
