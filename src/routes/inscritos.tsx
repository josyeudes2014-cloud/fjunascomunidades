import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { FjuLogo } from '../components/FjuLogo';

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

function buildCsv(registrations: Registration[]) {
  const QUOTE = String.fromCharCode(34);
  const escapeCsv = (value: string) => {
    const escaped = value.split(QUOTE).join(QUOTE + QUOTE);
    return QUOTE + escaped + QUOTE;
  };

  const header = ['Time', 'Responsável', 'WhatsApp', 'Endereço', 'Jogadores', 'Idades', 'Data da inscrição'];

  const rows = registrations.map((registration) =>
    [
      registration.teamName,
      registration.responsibleName,
      registration.responsibleWhatsapp,
      registration.address,
      registration.players,
      registration.ages,
      formatDate(registration.createdAt),
    ]
      .map(escapeCsv)
      .join(';'),
  );

  return [header.map(escapeCsv).join(';'), ...rows].join('\n');
}

function countPlayers(registration: Registration) {
  return registration.players
    .split('\n')
    .map((player) => player.trim())
    .filter(Boolean).length;
}

function RegistrationsListPage() {
  const [registrations, setRegistrations] = useState<Registration[]>(() => getStoredRegistrations());
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const totalPlayers = useMemo(() => {
    return registrations.reduce((total, registration) => total + countPlayers(registration), 0);
  }, [registrations]);

  const averagePlayers = useMemo(() => {
    return registrations.length > 0
      ? (totalPlayers / registrations.length).toFixed(1).replace('.', ',')
      : '0';
  }, [registrations.length, totalPlayers]);

  const filteredRegistrations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return registrations;

    return registrations.filter((registration) =>
      [registration.teamName, registration.responsibleName, registration.address].some(
        (value) => value.toLowerCase().includes(term),
      ),
    );
  }, [registrations, searchTerm]);

  const whatsappListUrl = useMemo(() => {
    return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
      buildListMessage(registrations),
    )}`;
  }, [registrations]);

  function handleRefresh() {
    setRegistrations(getStoredRegistrations());
    setSearchTerm('');
  }

  function handleClearList() {
    const confirmed = window.confirm('Tem certeza que deseja apagar a lista salva neste dispositivo?');

    if (!confirmed) return;

    window.localStorage.removeItem(STORAGE_KEY);
    setRegistrations([]);
  }

  function handleExportCsv() {
    const csv = `\uFEFF${buildCsv(registrations)}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'inscritos-fju.csv';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  async function handleCopyList() {
    if (!navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(buildListMessage(registrations));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Não é possível copiar automaticamente; o usuário pode usar o botão do WhatsApp.
    }
  }

  return (
    <main className='min-h-screen overflow-x-hidden bg-background text-foreground'>
      <style>{`
        .field-lines {
          background-image:
            linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 70px 70px;
        }
        .fade-up {
          animation: fadeUp 0.7s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header className='sticky top-0 z-50 border-b border-white/10 bg-emerald-950/90 backdrop-blur'>
        <div className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4'>
          <Link to='/' className='flex items-center gap-3'>
            <FjuLogo className='h-11 w-11' />
            <div>
              <p className='text-base font-black uppercase tracking-wide text-white'>FJU</p>
              <p className='text-[10px] font-bold uppercase tracking-[0.25em] text-yellow-300'>Nas comunidades</p>
            </div>
          </Link>
          <Link
            to='/'
            className='inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-black text-green-950 transition hover:bg-yellow-300'
          >
            ← Fazer inscrição
          </Link>
        </div>
      </header>

      <section className='relative overflow-hidden border-b border-border bg-gradient-to-br from-emerald-950 via-green-900 to-zinc-950 text-white'>
        <div className='field-lines absolute inset-0 opacity-60' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.15),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.2),transparent_35%)]' />
        <div className='relative mx-auto max-w-6xl px-6 py-14'>
          <span className='inline-flex items-center gap-2 rounded-full border border-yellow-300/30 bg-yellow-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-yellow-200 backdrop-blur'>
            ⚽ Acesso direto sem senha
          </span>
          <h1 className='mt-6 text-4xl font-black tracking-tight sm:text-5xl'>Lista de inscritos</h1>
          <p className='mt-4 max-w-2xl leading-7 text-emerald-50'>
            Confira os times cadastrados para o campeonato FJU nas comunidades. As inscrições feitas neste dispositivo aparecem aqui automaticamente.
          </p>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-6 py-10'>
        <div className='grid gap-4 sm:grid-cols-3'>
          <div className='fade-up rounded-3xl border border-border bg-card p-6 shadow-sm'>
            <p className='text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground'>Times</p>
            <p className='mt-2 text-4xl font-black text-foreground'>{registrations.length}</p>
          </div>
          <div className='fade-up rounded-3xl border border-border bg-card p-6 shadow-sm' style={{ animationDelay: '0.1s' }}>
            <p className='text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground'>Jogadores</p>
            <p className='mt-2 text-4xl font-black text-foreground'>{totalPlayers}</p>
            <p className='mt-1 text-sm font-semibold text-muted-foreground'>média de {averagePlayers} por time</p>
          </div>
          <div className='fade-up rounded-3xl border border-border bg-card p-6 shadow-sm' style={{ animationDelay: '0.2s' }}>
            <p className='text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground'>Organização</p>
            <p className='mt-2 text-xl font-black text-emerald-700'>(21) 98202-5641</p>
          </div>
        </div>

        <div className='mt-6 flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={handleRefresh}
            className='inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800'
          >
            Atualizar lista
          </button>
          <a
            href={whatsappListUrl}
            target='_blank'
            rel='noreferrer'
            className='inline-flex items-center justify-center rounded-full border border-emerald-700 px-5 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50'
          >
            Enviar lista pelo WhatsApp
          </a>
          <button
            type='button'
            onClick={handleCopyList}
            className='inline-flex items-center justify-center rounded-full border border-emerald-700 px-5 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50'
          >
            {copied ? 'Lista copiada!' : 'Copiar lista'}
          </button>
          <button
            type='button'
            onClick={handleExportCsv}
            className='inline-flex items-center justify-center rounded-full border border-emerald-700 px-5 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50'
          >
            Exportar CSV
          </button>
          <button
            type='button'
            onClick={handleClearList}
            className='inline-flex items-center justify-center rounded-full border border-destructive/30 px-5 py-3 text-sm font-bold text-destructive transition hover:bg-destructive/10'
          >
            Limpar lista deste dispositivo
          </button>
        </div>

        <div className='mt-8'>
          <input
            type='search'
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder='Buscar por time, responsável ou comunidade...'
            className='w-full rounded-2xl border border-input bg-card px-5 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15 sm:w-96'
          />

          <div className='mt-2 text-sm font-semibold text-muted-foreground'>
            {searchTerm.trim()
              ? `Exibindo ${filteredRegistrations.length} de ${registrations.length} time${registrations.length === 1 ? '' : 's'}`
              : `${registrations.length} time${registrations.length === 1 ? '' : 's'} cadastrado${registrations.length === 1 ? '' : 's'}`}
          </div>
        </div>

        <div className='mt-6 space-y-5'>
          {registrations.length === 0 ? (
            <div className='fade-up rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-sm'>
              <span className='text-5xl'>⚽</span>
              <h2 className='mt-4 text-2xl font-black text-foreground'>Nenhum time inscrito ainda</h2>
              <p className='mt-3 text-muted-foreground'>
                Quando uma inscrição for feita neste dispositivo, ela aparecerá aqui.
              </p>
              <Link
                to='/'
                className='mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800'
              >
                Abrir ficha de inscrição
              </Link>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className='rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-sm'>
              <h2 className='text-2xl font-black text-foreground'>Nenhum time encontrado</h2>
              <p className='mt-3 text-muted-foreground'>
                Nenhuma inscrição corresponde a esta busca. Tente outro termo.
              </p>
            </div>
          ) : (
            filteredRegistrations.map((registration, index) => (
              <article
                key={registration.id}
                className='fade-up overflow-hidden rounded-3xl border border-border bg-card shadow-sm'
                style={{ animationDelay: `${Math.min(index * 0.06, 0.6)}s` }}
              >
                <div className='flex flex-col gap-3 border-b border-border bg-muted p-6 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <p className='text-sm font-bold uppercase tracking-[0.2em] text-emerald-700'>
                      Inscrição #{registrations.length - registrations.indexOf(registration)}
                    </p>
                    <h2 className='mt-1 text-2xl font-black text-foreground'>{registration.teamName}</h2>
                  </div>
                  <p className='rounded-full bg-background px-4 py-2 text-sm font-semibold text-muted-foreground'>
                    {formatDate(registration.createdAt)}
                  </p>
                </div>

                <div className='grid gap-6 p-6 lg:grid-cols-2'>
                  <div className='space-y-4'>
                    <div>
                      <p className='text-sm font-bold text-muted-foreground'>Responsável</p>
                      <p className='mt-1 font-semibold text-foreground'>{registration.responsibleName}</p>
                    </div>
                    <div>
                      <p className='text-sm font-bold text-muted-foreground'>WhatsApp</p>
                      <p className='mt-1 font-semibold text-foreground'>{registration.responsibleWhatsapp}</p>
                    </div>
                    <div>
                      <p className='text-sm font-bold text-muted-foreground'>Endereço / comunidade</p>
                      <p className='mt-1 whitespace-pre-line font-semibold text-foreground'>{registration.address}</p>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <p className='text-sm font-bold text-muted-foreground'>Jogadores</p>
                      <p className='mt-1 whitespace-pre-line rounded-2xl bg-muted p-4 text-sm leading-6 text-foreground'>
                        {registration.players}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm font-bold text-muted-foreground'>Idades</p>
                      <p className='mt-1 whitespace-pre-line rounded-2xl bg-muted p-4 text-sm leading-6 text-foreground'>
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

      <footer className='border-t border-border bg-emerald-950 py-10 text-center text-white'>
        <FjuLogo className='mx-auto h-12 w-12' />
        <p className='mt-3 text-sm font-black uppercase tracking-[0.25em] text-yellow-300'>FJU nas Comunidades</p>
        <Link
          to='/'
          className='mt-5 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-green-950 transition hover:bg-yellow-300'
        >
          ← Voltar para a inscrição
        </Link>
      </footer>
    </main>
  );
}
