import { COUNTRIES } from './constants';
import { Race, RaceState, Driver, Team, LiveDriverState, TyreCompound, WeatherCondition, RaceResult, NewsArticle, DriverStanding, IncidentType } from './types';
// FIX: The 'translations' object is not exported from the main i18n index file. It should be imported directly from './i18n/translations'.
import { Language, TranslationKey } from './i18n';
import { translations } from './i18n/translations';

export const getCountryByCode = (code: string) => {
    return COUNTRIES.find(c => c.code === code);
};

export const getCountryFlagUrl = (code: string): string => {
    if (!code) return '';
    return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
};

export const formatTime = (seconds: number): string => {
    if (seconds <= 0 || typeof seconds !== 'number') return "0:00.000";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toFixed(3).padStart(6, '0')}`;
};

export const parseTimeToSeconds = (timeString: string): number => {
    if (!timeString || !timeString.includes(':')) {
        const asFloat = parseFloat(timeString);
        return isNaN(asFloat) ? 90 : asFloat;
    }
    const parts = timeString.split(':');
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    if (isNaN(minutes) || isNaN(seconds)) {
        return 90; // Default fallback
    }
    return (minutes * 60) + seconds;
};

export const getInitials = (name: string, limit: number = 3): string => {
    if (!name) return '?';
    const words = name.replace(/[^a-zA-Z0-9\s]/g, '').split(' ').filter(Boolean);
    if (words.length === 0) return '?';
    if (words.length === 1) return words[0].substring(0, limit).toUpperCase();
    
    return words.slice(0, limit).map(word => word[0]).join('').toUpperCase();
};


// --- FUNÇÕES DE CLIMA ---

export const determineWeather = (chances: Race['weatherChances']): WeatherCondition => {
    const rand = Math.random();
    if (rand < chances.Dry) {
        return 'Dry';
    } else if (rand < chances.Dry + chances.LightRain) {
        return 'LightRain';
    } else {
        return 'HeavyRain';
    }
};

export const getNextWeatherState = (currentWeather: WeatherCondition, chances: Race['weatherChances']): WeatherCondition => {
    // 97% de chance de o clima permanecer o mesmo a cada volta para criar estabilidade
    if (Math.random() < 0.97) {
        return currentWeather;
    }
    // Se mudar, determina o novo clima com base nas probabilidades da pista
    return determineWeather(chances);
};


// --- BANCO DE COMENTÁRIOS ---

const selectRandom = (phrases: string[]) => phrases[Math.floor(Math.random() * phrases.length)];

export const getPeriodicCommentary = (raceState: RaceState, drivers: Driver[], teams: Team[], lang: Language): string => {
    const leader = raceState.drivers.find(d => d.position === 1);
    if (!leader) return lang === 'en-US' ? "The race is in full swing!" : "A corrida está a todo vapor!";

    const leaderDriver = drivers.find(d => d.id === leader.driverId)!;
    const leaderTeam = teams.find(t => t.id === leaderDriver.teamId)!;

    const secondPlace = raceState.drivers.find(d => d.position === 2);
    let battleComment = '';
    if (secondPlace) {
        const gap = parseFloat(secondPlace.gapToLeader.replace('+', ''));
        if (gap < 1.0) {
             const secondDriver = drivers.find(d => d.id === secondPlace.driverId)!;
             battleComment = lang === 'en-US' 
                ? `The battle for the lead is fierce! ${secondDriver.name} is less than a second behind ${leaderDriver.name}!`
                : `A batalha pela liderança está acirrada! ${secondDriver.name} está a menos de um segundo de ${leaderDriver.name}!`;
        }
    }

    const phrases = {
        'pt-BR': [
            `${leaderDriver.name} continua a liderar a corrida com uma performance sólida.`,
            `A estratégia da ${leaderTeam.name} parece estar funcionando perfeitamente até agora.`,
            `O ritmo da corrida está intenso, com os pilotos buscando cada milissegundo.`,
            `Vemos algumas disputas interessantes se formando no meio do pelotão.`,
            `A gestão de pneus será crucial nas próximas voltas.`,
            `A consistência é a chave aqui, e ${leaderDriver.name} está mostrando como se faz.`,
            `Os tempos de volta estão caindo à medida que a pista melhora.`,
            battleComment,
        ],
        'en-US': [
            `${leaderDriver.name} continues to lead the race with a solid performance.`,
            `${leaderTeam.name}'s strategy seems to be working perfectly so far.`,
            `The pace is intense, with drivers fighting for every millisecond.`,
            `We're seeing some interesting battles forming in the midfield.`,
            `Tyre management will be crucial in the upcoming laps.`,
            `Consistency is key here, and ${leaderDriver.name} is showing how it's done.`,
            `Lap times are dropping as the track condition improves.`,
            battleComment,
        ],
    };
    
    return selectRandom(phrases[lang].filter(p => p));
};


export const getDnfCommentary = (driverName: string, teamName: string, lang: Language): string => {
    const phrases = {
        'pt-BR': [
            `Que desastre para ${driverName}! Ele está fora da corrida!`,
            `Problemas para a ${teamName}! ${driverName} abandona a corrida.`,
            `É o fim da linha para ${driverName}. Uma grande decepção para a equipe.`,
            `Fumaça saindo do carro de ${driverName}! Ele para na pista e está fora.`,
            `Coração partido para ${driverName} e a ${teamName}, que terminam o dia mais cedo.`,
        ],
        'en-US': [
            `What a disaster for ${driverName}! He is out of the race!`,
            `Trouble for ${teamName}! ${driverName} retires from the race.`,
            `It's the end of the line for ${driverName}. A huge disappointment for the team.`,
            `Smoke coming from ${driverName}'s car! He stops on track and is out.`,
            `Heartbreak for ${driverName} and ${teamName}, their day ends early.`,
        ],
    };
    return selectRandom(phrases[lang]);
};

export const getIncidentCommentary = (driverName: string, incidentType: IncidentType, lang: Language): string => {
    const key: TranslationKey = `incidentCommentary_${incidentType}`;
    const comment = translations[key]?.[lang] || (lang === 'en-US' ? 'An incident has occurred.' : 'Um incidente ocorreu.');
    return comment.replace('{{driverName}}', driverName);
}

export const getIncidentClearedCommentary = (driverName: string, lang: Language): string => {
    const comment = translations['incident_cleared']?.[lang] || (lang === 'en-US' ? 'The issue is resolved.' : 'O problema foi resolvido.');
    return comment.replace('{{driverName}}', driverName);
}

export const getPitStopCommentary = (driverName: string, newTyre: TyreCompound, lang: Language): string => {
    const tyreMap = {
        [TyreCompound.Soft]: { 'pt-BR': 'macios', 'en-US': 'softs' },
        [TyreCompound.Medium]: { 'pt-BR': 'médios', 'en-US': 'mediums' },
        [TyreCompound.Hard]: { 'pt-BR': 'duros', 'en-US': 'hards' },
        [TyreCompound.Intermediate]: { 'pt-BR': 'intermediários', 'en-US': 'intermediates' },
        [TyreCompound.Wet]: { 'pt-BR': 'de chuva', 'en-US': 'wets' },
    };
    const tyreName = tyreMap[newTyre][lang];

    const phrases = {
        'pt-BR': [
            `${driverName} entra nos boxes! Uma parada rápida para a equipe.`,
            `Hora do pit stop para ${driverName}. Ele volta para a pista com pneus ${tyreName} novos.`,
            `Estratégia em ação! ${driverName} faz sua parada e busca ganhar posições.`,
            `Os mecânicos trabalham rápido no carro de ${driverName}. Ele já está de volta à pista!`,
            `Uma parada crucial para ${driverName}. Vamos ver como essa troca para pneus ${tyreName} afeta sua corrida.`,
        ],
        'en-US': [
            `${driverName} is in the pits! A quick stop for the team.`,
            `Pit stop time for ${driverName}. He's back on track with a fresh set of ${tyreName}.`,
            `Strategy in action! ${driverName} makes his stop, looking to gain positions.`,
            `The mechanics work quickly on ${driverName}'s car. He's already back on the track!`,
            `A crucial stop for ${driverName}. Let's see how this switch to ${tyreName} tyres affects his race.`,
        ],
    };
    return selectRandom(phrases[lang]);
};

export const getWeatherChangeCommentary = (newWeather: WeatherCondition, lang: Language): string => {
    const messages = {
        'LightRain': { 'pt-BR': "Atenção, começam a cair as primeiras gotas de chuva na pista! As equipes precisam ficar de olho nos radares.", 'en-US': "Attention, the first drops of rain are starting to fall on the track! Teams need to keep an eye on the radar." },
        'HeavyRain': { 'pt-BR': "A chuva aperta muito! A pista está encharcada e as condições são extremamente difíceis agora.", 'en-US': "The rain is getting heavier! The track is soaked and conditions are extremely difficult now." },
        'Dry': { 'pt-BR': "A chuva parou e o sol está aparecendo! A pista deve começar a secar em breve, formando um trilho seco.", 'en-US': "The rain has stopped and the sun is coming out! The track should start to dry soon, forming a dry line." },
    };
    return messages[newWeather]?.[lang] || (lang === 'en-US' ? 'Change in weather conditions.' : "Mudança nas condições climáticas.");
};

export const getRaceStartCommentary = (lang: Language): string => {
    return lang === 'en-US' ? "The lights go out and away we go! The race has begun!" : "As luzes se apagam e lá vamos nós! A corrida começou!";
};

export const getSafetyCarDeployedCommentary = (lang: Language): string => {
    return lang === 'en-US' ? "Safety Car deployed! The cars will bunch up behind the safety car." : "Safety Car na pista! Os carros se agruparão atrás do carro de segurança.";
}
export const getSafetyCarInCommentary = (lang: Language): string => {
    return lang === 'en-US' ? "The Safety Car is in this lap! The race will be resumed." : "O Safety Car entrará nos boxes nesta volta! A corrida será reiniciada.";
}
export const getRedFlagCommentary = (lang: Language): string => {
    return lang === 'en-US' ? "RED FLAG! The session has been stopped due to a major incident." : "BANDEIRA VERMELHA! A sessão foi interrompida devido a um grande incidente.";
}
export const getGreenFlagCommentary = (lang: Language): string => {
    return lang === 'en-US' ? "Green flag! We are racing again!" : "Bandeira verde! A corrida está de volta!";
}

export const DNF_REASONS = {
    'pt-BR': [
        "Falha no Motor",
        "Problema nos Freios",
        "Acidente",
        "Suspensão Quebrada",
        "Problema na Caixa de Câmbio",
        "Pane Elétrica",
        "Dano na Asa Dianteira",
        "Pneu Furado",
        "Superaquecimento",
    ],
    'en-US': [
        "Engine Failure",
        "Brake Problem",
        "Crash",
        "Broken Suspension",
        "Gearbox Issue",
        "Electrical Fault",
        "Front Wing Damage",
        "Puncture",
        "Overheating",
    ],
};

export const getRandomDnfReason = (lang: Language): string => {
    return DNF_REASONS[lang][Math.floor(Math.random() * DNF_REASONS[lang].length)];
};


// --- NEWS GENERATION ---

export const generateRaceNews = (
    raceResults: RaceResult[],
    drivers: Driver[],
    teams: Team[],
    race: Race,
    raceIndex: number,
    seasonYear: number,
    driverStandings: DriverStanding[],
    lang: Language
): NewsArticle[] => {
    const articles: NewsArticle[] = [];
    const date = lang === 'en-US' ? `Round ${raceIndex + 1}, ${seasonYear}` : `Etapa ${raceIndex + 1}, ${seasonYear}`;

    const winnerResult = raceResults.find(r => r.position === 1);
    if (!winnerResult) return []; // No winner, no news

    const winner = drivers.find(d => d.id === winnerResult.driverId)!;
    const winnerTeam = teams.find(t => t.id === winner.teamId)!;

    // 1. Winner's Story
    const winnerHeadlines = {
        'pt-BR': [
            `${winner.name} domina no ${race.name}!`,
            `Vitória magistral de ${winner.name} em ${race.country}!`,
            `${winnerTeam.name} no topo do pódio com ${winner.name}!`,
        ],
        'en-US': [
            `${winner.name} dominates at the ${race.name}!`,
            `Masterful victory for ${winner.name} in ${race.country}!`,
            `${winnerTeam.name} on the top step with ${winner.name}!`,
        ],
    };
    const winnerBodies = {
        'pt-BR': [
            `Numa exibição de pura habilidade e velocidade, ${winner.name} conquistou uma vitória impressionante no ${race.name} hoje. O piloto da ${winnerTeam.name} liderou a maior parte da corrida, mostrando um ritmo forte e uma estratégia impecável para terminar no degrau mais alto do pódio.`,
            `Hoje foi o dia de ${winner.name}. O piloto da ${winnerTeam.name} entregou uma performance impecável para vencer o ${race.name}, superando seus rivais com ultrapassagens ousadas e um controle de corrida exemplar. É uma grande vitória para a equipe e para o piloto.`,
        ],
        'en-US': [
            `In a display of pure skill and speed, ${winner.name} clinched an impressive victory at the ${race.name} today. The ${winnerTeam.name} driver led most of the race, showing strong pace and a flawless strategy to finish on the top step of the podium.`,
            `Today was ${winner.name}'s day. The ${winnerTeam.name} driver delivered a flawless performance to win the ${race.name}, overcoming his rivals with daring overtakes and exemplary race management. It's a great win for the team and the driver.`,
        ],
    };
    articles.push({
        id: crypto.randomUUID(),
        raceIndex,
        date,
        headline: selectRandom(winnerHeadlines[lang]),
        body: selectRandom(winnerBodies[lang]),
    });

    // 2. Surprise Podium Story (if applicable)
    const podiumFinishers = raceResults.filter(r => r.position > 1 && r.position <= 3);
    for (const p of podiumFinishers) {
        const driver = drivers.find(d => d.id === p.driverId)!;
        const team = teams.find(t => t.id === driver.teamId)!;
        // Consider it a surprise if a "weaker" team gets a podium
        if (team.aerodynamics < 85 && Math.random() < 0.7) {
            const surpriseHeadlines = {
                'pt-BR': [
                    `Pódio chocante para ${driver.name} em ${race.country}!`,
                    `${team.name} celebra resultado incrível com ${driver.name}!`,
                    `Surpresa no ${race.name}: ${driver.name} garante um lugar no pódio!`,
                ],
                'en-US': [
                    `Shock podium for ${driver.name} in ${race.country}!`,
                    `${team.name} celebrates incredible result with ${driver.name}!`,
                    `Surprise at the ${race.name}: ${driver.name} secures a podium finish!`,
                ],
            };
            const surpriseBodies = {
                'pt-BR': [
                    `Contra todas as probabilidades, ${driver.name} levou seu carro da ${team.name} a um incrível P${p.position}, garantindo um lugar no pódio no ${race.name}. A equipe comemorou euforicamente um resultado que superou todas as expectativas.`,
                    `O momento do dia pertence a ${driver.name} e à ${team.name}. Com uma pilotagem fantástica e uma estratégia arriscada que valeu a pena, o piloto garantiu um pódio inesperado, trazendo alegria e pontos valiosos para a equipe.`,
                ],
                'en-US': [
                    `Against all odds, ${driver.name} drove his ${team.name} car to an incredible P${p.position}, securing a spot on the podium at the ${race.name}. The team celebrated euphorically a result that exceeded all expectations.`,
                    `The moment of the day belongs to ${driver.name} and ${team.name}. With fantastic driving and a risky strategy that paid off, the driver secured an unexpected podium, bringing joy and valuable points to the team.`,
                ],
            };
            articles.push({
                id: crypto.randomUUID(),
                raceIndex,
                date,
                headline: selectRandom(surpriseHeadlines[lang]),
                body: selectRandom(surpriseBodies[lang]),
            });
            break; // Only one surprise story
        }
    }
    
    // 3. Championship Story
    if (raceIndex > 3 && Math.random() < 0.8) { // Only after a few races
        const championshipLeader = drivers.find(d => d.id === driverStandings[0].driverId)!;
        const leaderStanding = driverStandings[0];
        const secondPlaceStanding = driverStandings[1];
        const pointsGap = leaderStanding.points - secondPlaceStanding.points;

        if (championshipLeader.id === winner.id) {
             articles.push({
                id: crypto.randomUUID(),
                raceIndex,
                date,
                headline: lang === 'en-US' ? `${winner.name} extends championship lead with victory!` : `${winner.name} amplia liderança no campeonato com vitória!`,
                body: lang === 'en-US' 
                    ? `In addition to the race win, ${winner.name} also took a major step in the title fight. With the 25 points, the driver now has a ${pointsGap}-point lead over the second place, consolidating his position at the top of the standings.`
                    : `Além da vitória na corrida, ${winner.name} também deu um passo importante na luta pelo título. Com os 25 pontos, o piloto agora tem uma vantagem de ${pointsGap} pontos sobre o segundo colocado, consolidando sua posição no topo da tabela.`,
            });
        }
    }

    return articles;
};