import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

export const Route = createFileRoute('/inscritos')({
  component: RegistrationsListPage,
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
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

function buildListMessage(registrations: Registration[]) {
  if (registrations.length === 0) {
    return 'Ainda não há times inscritos no campeonato FJU nas comunidades.';
  }

  return [
    'Lista de inscritos - Campeonato FJU nas comunidades',
    '',
    ...registrations.map((registration, index) =>
      [
        `${index + 1}. ${registration.teamName}`,
        `Responsável: ${registration.responsibleName}`,
        `WhatsApp: ${registration.responsibleWhatsapp}`,
        `Endereço: ${registration.address}`,
        `Jogadores: ${registration.players.replace(/\n/g, ', ')}`,
        `Idades: ${registration.ages.replace(/\n/g, ', ')}`,
        `Data: ${formatDate(registration.createdAt)}`,
      ].join('\n'),
    ),
  ].join('\n\n');
}

function RegistrationsListPage() {
  const [registrations, setRegistrations] = useState<Registration[]>(() => getStoredRegistrations());

  const totalPlayers = useMemo(() => {
    return registrations.reduce((total, registration) => {
      const players = registration.players
        .split('\n')
        .map((player) => player.trim())
        .filter(Boolean);

      return total + players.length;
    }, 0);
  }, [registrations]);

  const whatsappListUrl = useMemo(() => {
    return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
      buildListMessage(registrations),
    )}`;
  }, [registrations]);

  function handleRefresh() {
    setRegistrations(getStoredRegistrations());
  }

  function handleClearList() {
    const confirmed = window.confirm('Tem certeza que deseja apagar a lista salva neste dispositivo?');

    if (!confirmed) return;

    window.localStorage.removeItem(STORAGE_KEY);
    setRegistrations([]);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-gradient-to-br from-zinc-950 via-emerald-950 to-green-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-100">
                Acesso direto sem senha
              </span>
              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
                Lista de inscritos
              </h1>
              <p className="mt-4 max-w-2xl leading-7 text-emerald-50">
                Consulte os times cadastrados para o campeonato FJU nas comunidades.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-green-950 shadow-lg transition hover:bg-emerald-50"
            >
              Voltar para inscrição
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Times</p>
            <p className="mt-2 text-4xl font-black text-foreground">{registrations.length}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Jogadores</p>
            <p className="mt-2 text-4xl font-black text-foreground">{totalPlayers}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Organização</p>
            <p className="mt-2 text-xl font-black text-emerald-700">(21) 98202-5641</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            Atualizar lista
          </button>
          <a
            href={whatsappListUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-emerald-700 px-5 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
          >
            Enviar lista pelo WhatsApp
          </a>
          <button
            type="button"
            onClick={handleClearList}
            className="inline-flex items-center justify-center rounded-full border border-destructive/30 px-5 py-3 text-sm font-bold text-destructive transition hover:bg-destructive/10"
          >
            Limpar lista deste dispositivo
          </button>
        </div>

        <div className="mt-8 space-y-5">
          {registrations.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
              <h2 className="text-2xl font-black text-foreground">Nenhum time inscrito ainda</h2>
              <p className="mt-3 text-muted-foreground">
                Quando uma inscrição for feita neste dispositivo, ela aparecerá aqui.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
              >
                Abrir ficha de inscrição
              </Link>
            </div>
          ) : (
            registrations.map((registration, index) => (
              <article
                key={registration.id}
                className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
              >
                <div className="flex flex-col gap-3 border-b border-border bg-muted p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
                      Inscrição #{registrations.length - index}
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-foreground">{registration.teamName}</h2>
                  </div>
                  <p className="rounded-full bg-background px-4 py-2 text-sm font-semibold text-muted-foreground">
                    {formatDate(registration.createdAt)}
                  </p>
                </div>

                <div className="grid gap-6 p-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold text-muted-foreground">Responsável</p>
                      <p className="mt-1 font-semibold text-foreground">{registration.responsibleName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-muted-foreground">WhatsApp</p>
                      <p className="mt-1 font-semibold text-foreground">{registration.responsibleWhatsapp}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-muted-foreground">Endereço / comunidade</p>
                      <p className="mt-1 whitespace-pre-line font-semibold text-foreground">{registration.address}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold text-muted-foreground">Jogadores</p>
                      <p className="mt-1 whitespace-pre-line rounded-2xl bg-muted p-4 text-sm leading-6 text-foreground">
                        {registration.players}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-muted-foreground">Idades</p>
                      <p className="mt-1 whitespace-pre-line rounded-2xl bg-muted p-4 text-sm leading-6 text-foreground">
                        {registration.ages}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
