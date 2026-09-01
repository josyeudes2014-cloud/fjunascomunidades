import { createFileRoute, Link } from '@tanstack/react-router';
import { FormEvent, useMemo, useState } from 'react';

export const Route = createFileRoute('/')({
  component: ChampionshipRegistrationPage,
});

type Registration = {
  id: string;
  teamName: string;
  players: string;
  ages: string;
  address: string;
  responsibleName: string;
  responsibleWhatsapp: string;
  createdAt: string;
};

const STORAGE_KEY = 'fju_championship_registrations';
const ADMIN_WHATSAPP = '5521982025641';

function onlyNumbers(value: string) {
  return value.replace(/\D/g, '');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function buildAdminMessage(registration: Registration) {
  return [
    'Nova inscrição para o campeonato FJU nas comunidades',
    '',
    `Time: ${registration.teamName}`,
    `Responsável: ${registration.responsibleName}`,
    `WhatsApp do responsável: ${registration.responsibleWhatsapp}`,
    `Endereço: ${registration.address}`,
    '',
    'Jogadores:',
    registration.players,
    '',
    'Idades:',
    registration.ages,
    '',
    `Inscrição feita em: ${formatDate(registration.createdAt)}`,
  ].join('\n');
}

function buildConfirmationMessage(registration: Registration) {
  return [
    `Olá, ${registration.responsibleName}!`,
    '',
    `A inscrição do time ${registration.teamName} no campeonato FJU nas comunidades foi registrada com sucesso.`,
    '',
    'Em breve a organização poderá entrar em contato com mais informações.',
    '',
    'Deus abençoe!',
  ].join('\n');
}

function getStoredRegistrations(): Registration[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Registration[]) : [];
  } catch {
    return [];
  }
}

function saveRegistration(registration: Registration) {
  const currentRegistrations = getStoredRegistrations();
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([registration, ...currentRegistrations]),
  );
}

function ChampionshipRegistrationPage() {
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState('');
  const [ages, setAges] = useState('');
  const [address, setAddress] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [responsibleWhatsapp, setResponsibleWhatsapp] = useState('');
  const [lastRegistration, setLastRegistration] = useState<Registration | null>(null);

  const adminWhatsappUrl = useMemo(() => {
    if (!lastRegistration) return '';

    return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
      buildAdminMessage(lastRegistration),
    )}`;
  }, [lastRegistration]);

  const confirmationWhatsappUrl = useMemo(() => {
    if (!lastRegistration) return '';

    const responsiblePhone = onlyNumbers(lastRegistration.responsibleWhatsapp);
    if (!responsiblePhone) return '';

    const phoneWithCountry = responsiblePhone.startsWith('55')
      ? responsiblePhone
      : `55${responsiblePhone}`;

    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(
      buildConfirmationMessage(lastRegistration),
    )}`;
  }, [lastRegistration]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const registration: Registration = {
      id: crypto.randomUUID(),
      teamName: teamName.trim(),
      players: players.trim(),
      ages: ages.trim(),
      address: address.trim(),
      responsibleName: responsibleName.trim(),
      responsibleWhatsapp: responsibleWhatsapp.trim(),
      createdAt: new Date().toISOString(),
    };

    saveRegistration(registration);
    setLastRegistration(registration);

    setTeamName('');
    setPlayers('');
    setAges('');
    setAddress('');
    setResponsibleName('');
    setResponsibleWhatsapp('');

    window.open(
      `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
        buildAdminMessage(registration),
      )}`,
      '_blank',
      'noopener,noreferrer',
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-emerald-950 via-green-900 to-zinc-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_30%)]" />
        <div className="relative mx-auto flex min-h-[420px] max-w-6xl flex-col items-center justify-center px-6 py-16 text-center">
          <span className="mb-5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-100 backdrop-blur">
            Campeonato de Futebol
          </span>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Inscrição oficial dos times para o FJU nas comunidades
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50">
            Preencha a ficha com atenção. Depois do envio, a organização recebe os dados pelo WhatsApp e o time pode receber a confirmação do cadastro.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#ficha"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-green-950 shadow-lg transition hover:bg-emerald-50"
            >
              Fazer inscrição
            </a>
            <Link
              to="/inscritos"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              Ver lista de inscritos
            </Link>
          </div>
        </div>
      </section>

      <section id="ficha" className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">
            Ficha de inscrição
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground">
            Cadastre seu time
          </h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Informe os dados do time, jogadores, idades e endereço. Ao finalizar, uma mensagem pronta será aberta no WhatsApp da administração.
          </p>

          <div className="mt-8 space-y-4 rounded-2xl bg-muted p-5">
            <div>
              <p className="text-sm font-semibold text-foreground">WhatsApp da organização</p>
              <p className="mt-1 text-lg font-black text-emerald-700">(21) 98202-5641</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Link direto da lista</p>
              <Link to="/inscritos" className="mt-1 inline-flex text-sm font-bold text-emerald-700 hover:underline">
                Abrir inscritos sem senha
              </Link>
            </div>
          </div>
        </aside>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-bold text-foreground">Nome do time</span>
                <input
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  required
                  placeholder="Ex: Comunidade FC"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-bold text-foreground">Nome do responsável</span>
                <input
                  value={responsibleName}
                  onChange={(event) => setResponsibleName(event.target.value)}
                  required
                  placeholder="Quem está fazendo a inscrição"
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15"
                />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-sm font-bold text-foreground">WhatsApp do responsável</span>
              <input
                value={responsibleWhatsapp}
                onChange={(event) => setResponsibleWhatsapp(event.target.value)}
                required
                placeholder="Ex: (21) 99999-9999"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15"
              />
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-bold text-foreground">Nomes dos jogadores</span>
              <textarea
                value={players}
                onChange={(event) => setPlayers(event.target.value)}
                required
                rows={6}
                placeholder="Digite um jogador por linha"
                className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15"
              />
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-bold text-foreground">Idade dos jogadores</span>
              <textarea
                value={ages}
                onChange={(event) => setAges(event.target.value)}
                required
                rows={4}
                placeholder="Ex: João - 17 anos, Pedro - 18 anos..."
                className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15"
              />
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-bold text-foreground">Endereço / comunidade</span>
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                required
                rows={3}
                placeholder="Informe rua, número, bairro ou comunidade"
                className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-emerald-700 px-6 py-4 text-base font-black text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600/20"
            >
              Enviar inscrição pelo WhatsApp
            </button>
          </form>

          {lastRegistration ? (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
              <h3 className="text-lg font-black">Inscrição registrada com sucesso!</h3>
              <p className="mt-2 text-sm leading-6">
                O cadastro do time {lastRegistration.teamName} foi salvo neste dispositivo. Se a janela do WhatsApp não abriu, use os botões abaixo.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a
                  href={adminWhatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  Reenviar para o administrador
                </a>
                {confirmationWhatsappUrl ? (
                  <a
                    href={confirmationWhatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-emerald-700 px-5 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    Enviar confirmação ao time
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
