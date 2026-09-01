import { createFileRoute, Link } from '@tanstack/react-router';
import { FormEvent, useMemo, useState } from 'react';
import { FjuLogo } from '../components/FjuLogo';

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

const COMMUNITY_IMAGES = [
  '/uploads/images.jpeg',
  '/uploads/download.jpeg',
  '/uploads/images_1_.jpeg',
  '/uploads/images_2_.jpeg',
  '/uploads/images_3_.jpeg',
  '/uploads/images_4_.jpeg',
  '/uploads/download_1_.jpeg',
  '/uploads/images_5_.jpeg',
  '/uploads/images_6_.jpeg',
  '/uploads/images_7_.jpeg',
  '/uploads/images_8_.jpeg',
  '/uploads/images_9_.jpeg',
  '/uploads/images_10_.jpeg',
  '/uploads/images_11_.jpeg',
  '/uploads/images_12_.jpeg',
  '/uploads/images_13_.jpeg',
  '/uploads/images_14_.jpeg',
  '/uploads/images_15_.jpeg',
];

const MARQUEE_IMAGES = [...COMMUNITY_IMAGES, ...COMMUNITY_IMAGES];

function onlyNumbers(value: string) {
  return value.replace(/\D/g, '');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatPhoneNumber(value: string) {
  const digits = onlyNumbers(value).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isValidPhoneNumber(value: string) {
  const digits = onlyNumbers(value);
  return digits.length >= 10 && digits.length <= 13;
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
  const [phoneError, setPhoneError] = useState('');
  const [lastRegistration, setLastRegistration] = useState<Registration | null>(null);

  const playerCount = players
    .split('\n')
    .map((player) => player.trim())
    .filter(Boolean).length;

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

    if (!isValidPhoneNumber(responsibleWhatsapp)) {
      setPhoneError('Informe um WhatsApp válido com DDD, ex: (21) 99999-9999');
      return;
    }

    setPhoneError('');

    const registration: Registration = {
      id: crypto.randomUUID(),
      teamName: teamName.trim(),
      players: players.trim(),
      ages: ages.trim(),
      address: address.trim(),
      responsibleName: responsibleName.trim(),
      responsibleWhatsapp: formatPhoneNumber(responsibleWhatsapp),
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

  const inputClassName =
    'w-full rounded-2xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15';

  const textareaClassName =
    'w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15';

  return (
    <main className='min-h-screen overflow-x-hidden bg-background text-foreground'>
      <style>{`
        .field-lines {
          background-image:
            linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 70px 70px;
        }
        .ball {
          animation: ballBounce 3.2s ease-in-out infinite;
        }
        .ball-slow {
          animation: ballBounce 4.6s ease-in-out infinite reverse;
        }
        @keyframes ballBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-45px) rotate(120deg); }
          50% { transform: translateY(0) rotate(240deg); }
          75% { transform: translateY(-24px) rotate(360deg); }
        }
        .float-slow {
          animation: floatSlow 5s ease-in-out infinite;
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50% { transform: translateY(-18px) rotate(8deg); }
        }
        .marquee-track {
          animation: marqueeScroll 55s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .pulse-ring {
          animation: pulseRing 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.55); }
          50% { box-shadow: 0 0 0 14px rgba(250, 204, 21, 0); }
        }
        .fade-up {
          animation: fadeUp 0.7s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .success-enter {
          animation: successEnter 0.35s ease both;
        }
        @keyframes successEnter {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <header className='sticky top-0 z-50 border-b border-white/10 bg-emerald-950/90 backdrop-blur'>
        <div className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4'>
          <a href='#' className='flex items-center gap-3'>
            <FjuLogo className='h-11 w-11' />
            <div>
              <p className='text-base font-black uppercase tracking-wide text-white'>FJU</p>
              <p className='text-[10px] font-bold uppercase tracking-[0.25em] text-yellow-300'>Nas comunidades</p>
            </div>
          </a>
          <div className='flex items-center gap-2'>
            <Link
              to='/inscritos'
              className='hidden rounded-full border border-white/25 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10 sm:inline-flex'
            >
              📋 Inscritos
            </Link>
            <a
              href='#inscricao'
              className='inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-black text-green-950 transition hover:bg-yellow-300'
            >
              ⚽ Inscrever
            </a>
          </div>
        </div>
      </header>

      <section className='relative overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-zinc-950 text-white'>
        <div className='field-lines absolute inset-0 opacity-60' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.3),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.18),transparent_30%)]' />
        <div className='pointer-events-none absolute inset-0' aria-hidden='true'>
          <div className='absolute right-[6%] top-[16%] hidden lg:block'>
            <span className='ball block text-[110px] leading-none drop-shadow-2xl'>⚽</span>
          </div>
          <div className='absolute right-[16%] bottom-[10%] hidden md:block'>
            <span className='float-slow block text-7xl leading-none drop-shadow-xl'>🏆</span>
          </div>
          <div className='absolute left-[4%] top-[52%] hidden lg:block'>
            <span className='ball-slow block text-8xl leading-none drop-shadow-xl'>⚽</span>
          </div>
        </div>

        <div className='relative mx-auto flex min-h-[640px] max-w-6xl flex-col items-center justify-center px-6 py-20 text-center'>
          <FjuLogo className='h-24 w-24 sm:h-28 sm:w-28' />

          <span className='mt-8 inline-flex items-center gap-2 rounded-full border border-yellow-300/30 bg-yellow-300/10 px-5 py-2 text-xs font-black uppercase tracking-[0.3em] text-yellow-200 backdrop-blur sm:text-sm'>
            ⚽ Campeonato de futebol das comunidades
          </span>

          <h1 className='mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl'>
            A bola rola <span className='text-yellow-300'>nas comunidades</span> e o seu time pode ser campeão
          </h1>

          <p className='mt-6 max-w-2xl text-base leading-8 text-emerald-50 sm:text-lg'>
            O FJU nas Comunidades está organizando um campeonato para unir jogadores, famílias e moradores. Preencha a ficha, envie pelo WhatsApp e entre para a lista oficial.
          </p>

          <div className='mt-10 flex flex-col gap-4 sm:flex-row'>
            <a
              href='#inscricao'
              className='pulse-ring inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-black text-green-950 shadow-2xl transition hover:scale-105 hover:bg-yellow-300'
            >
              ⚽ Inscrever meu time
            </a>
            <Link
              to='/inscritos'
              className='inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/25 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur transition hover:bg-white/20'
            >
              📋 Ver lista de inscritos
            </Link>
          </div>

          <div className='mt-12 grid w-full max-w-3xl grid-cols-3 gap-4 rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur'>
            <div className='text-center'>
              <p className='text-2xl font-black text-yellow-300 sm:text-3xl'>100%</p>
              <p className='mt-1 text-[11px] font-bold uppercase tracking-widest text-emerald-100 sm:text-xs'>Gratuito</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-black text-yellow-300 sm:text-3xl'>⚽</p>
              <p className='mt-1 text-[11px] font-bold uppercase tracking-widest text-emerald-100 sm:text-xs'>Feito para a comunidade</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-black text-yellow-300 sm:text-3xl'>💬</p>
              <p className='mt-1 text-[11px] font-bold uppercase tracking-widest text-emerald-100 sm:text-xs'>Confirmação no WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      <section className='relative overflow-hidden border-y border-border bg-card py-4'>
        <p className='mb-4 text-center text-xs font-black uppercase tracking-[0.35em] text-emerald-700'>
          Nossas comunidades em campo
        </p>
        <div className='relative overflow-hidden'>
          <div className='marquee-track flex w-max gap-4'>
            {MARQUEE_IMAGES.map((src, index) => (
              <img
                key={index}
                src={src}
                alt='FJU nas comunidades'
                loading='lazy'
                className='h-40 w-60 shrink-0 rounded-2xl object-cover shadow-md'
              />
            ))}
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-6 py-20'>
        <div className='text-center'>
          <span className='text-sm font-black uppercase tracking-[0.3em] text-emerald-600'>Como participar</span>
          <h2 className='mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl'>Do cadastro ao campo em três passos</h2>
          <p className='mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground'>
            Sem burocracia: preencha a ficha, envie e aguarde a confirmação da organização.
          </p>
        </div>

        <div className='mt-12 grid gap-6 md:grid-cols-3'>
          <div className='fade-up rounded-3xl border border-border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg'>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-2xl shadow-lg shadow-emerald-700/25'>📝</div>
            <h3 className='mt-6 text-xl font-black text-foreground'>1. Preencha a ficha</h3>
            <p className='mt-3 leading-7 text-muted-foreground'>Nome do time, lista de jogadores, idades e o endereço da comunidade.</p>
          </div>
          <div className='fade-up rounded-3xl border border-border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg' style={{ animationDelay: '0.15s' }}>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-2xl shadow-lg shadow-emerald-700/25'>💬</div>
            <h3 className='mt-6 text-xl font-black text-foreground'>2. Envio automático</h3>
            <p className='mt-3 leading-7 text-muted-foreground'>A ficha gera uma mensagem pronta que abre no WhatsApp da organização.</p>
          </div>
          <div className='fade-up rounded-3xl border border-border bg-card p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg' style={{ animationDelay: '0.3s' }}>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-2xl shadow-lg shadow-emerald-700/25'>🏆</div>
            <h3 className='mt-6 text-xl font-black text-foreground'>3. Vai ter bola rolando</h3>
            <p className='mt-3 leading-7 text-muted-foreground'>Depois da confirmação, é só preparar as chuteiras e vestir a camisa da comunidade.</p>
          </div>
        </div>
      </section>

      <section className='bg-gradient-to-b from-emerald-950 via-green-900 to-zinc-950 py-20 text-white'>
        <div className='mx-auto max-w-6xl px-6'>
          <div className='text-center'>
            <span className='text-sm font-black uppercase tracking-[0.3em] text-yellow-300'>FJU nas comunidades</span>
            <h2 className='mt-4 text-3xl font-black tracking-tight sm:text-4xl'>A união faz o time</h2>
            <p className='mx-auto mt-4 max-w-2xl leading-7 text-emerald-50'>
              Momentos e encontros que mostram o quanto a comunidade é forte quando entra em campo junta.
            </p>
          </div>

          <div className='mt-12 grid grid-cols-2 gap-4 md:grid-cols-4'>
            {COMMUNITY_IMAGES.slice(0, 8).map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`FJU nas comunidades ${index + 1}`}
                loading='lazy'
                className={`h-40 w-full rounded-2xl object-cover shadow-lg transition duration-300 hover:scale-[1.03] sm:h-48 ${index % 2 === 0 ? 'md:mt-6' : ''}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section id='inscricao' className='mx-auto max-w-6xl px-6 py-20'>
        <div className='grid gap-10 lg:grid-cols-[0.85fr_1.15fr]'>
          <aside className='relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm'>
            <div className='pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-emerald-600/10' />
            <div className='pointer-events-none absolute -bottom-14 -left-14 h-44 w-44 rounded-full bg-yellow-400/10' />

            <span className='relative text-sm font-black uppercase tracking-[0.3em] text-emerald-600'>Inscrição oficial</span>
            <h2 className='relative mt-4 text-3xl font-black tracking-tight text-foreground'>Cadastre seu time agora</h2>
            <p className='relative mt-4 leading-7 text-muted-foreground'>
              É grátis e leva menos de dois minutos. Ao enviar, a organização recebe tudo pelo WhatsApp e o time já entra na lista oficial.
            </p>

            <div className='relative mt-8 space-y-4'>
              <div className='flex items-start gap-4 rounded-2xl bg-muted p-4'>
                <span className='text-2xl'>📞</span>
                <div>
                  <p className='text-sm font-black text-foreground'>WhatsApp da organização</p>
                  <p className='mt-1 text-lg font-black text-emerald-700'>(21) 98202-5641</p>
                </div>
              </div>
              <div className='flex items-start gap-4 rounded-2xl bg-muted p-4'>
                <span className='text-2xl'>📋</span>
                <div>
                  <p className='text-sm font-black text-foreground'>Lista de inscritos</p>
                  <Link to='/inscritos' className='mt-1 inline-flex text-sm font-bold text-emerald-700 hover:underline'>
                    Ver quem já está inscrito
                  </Link>
                </div>
              </div>
              <div className='flex items-start gap-4 rounded-2xl bg-muted p-4'>
                <span className='text-2xl'>🗺️</span>
                <div>
                  <p className='text-sm font-black text-foreground'>Sua comunidade conta</p>
                  <p className='mt-1 text-sm leading-6 text-muted-foreground'>Reúna os craques da região e mostre a força do futebol de comunidade.</p>
                </div>
              </div>
            </div>
          </aside>

          <div className='rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8'>
            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='grid gap-5 sm:grid-cols-2'>
                <label className='block space-y-2'>
                  <span className='flex items-center gap-2 text-sm font-bold text-foreground'>
                    <span className='text-lg'>👕</span> Nome do time
                  </span>
                  <input
                    value={teamName}
                    onChange={(event) => setTeamName(event.target.value)}
                    required
                    placeholder='Ex: Comunidade FC'
                    className={inputClassName}
                  />
                </label>

                <label className='block space-y-2'>
                  <span className='flex items-center gap-2 text-sm font-bold text-foreground'>
                    <span className='text-lg'>🙋</span> Nome do responsável
                  </span>
                  <input
                    value={responsibleName}
                    onChange={(event) => setResponsibleName(event.target.value)}
                    required
                    placeholder='Quem está fazendo a inscrição'
                    className={inputClassName}
                  />
                </label>
              </div>

              <label className='block space-y-2'>
                <span className='flex items-center gap-2 text-sm font-bold text-foreground'>
                  <span className='text-lg'>📱</span> WhatsApp do responsável
                </span>
                <input
                  value={responsibleWhatsapp}
                  onChange={(event) => {
                    setResponsibleWhatsapp(formatPhoneNumber(event.target.value));
                    if (phoneError) setPhoneError('');
                  }}
                  required
                  inputMode='tel'
                  autoComplete='tel'
                  maxLength={15}
                  placeholder='Ex: (21) 99999-9999'
                  aria-invalid={phoneError ? true : undefined}
                  className={`w-full rounded-2xl border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-4 ${
                    phoneError
                      ? 'border-destructive focus:border-destructive focus:ring-destructive/15'
                      : 'border-input focus:border-emerald-600 focus:ring-emerald-600/15'
                  }`}
                />
                {phoneError ? (
                  <p className='text-sm font-semibold text-destructive'>{phoneError}</p>
                ) : (
                  <p className='text-xs text-muted-foreground'>
                    O WhatsApp será usado pela organização e para enviar a confirmação da inscrição.
                  </p>
                )}
              </label>

              <label className='block space-y-2'>
                <span className='flex items-center gap-2 text-sm font-bold text-foreground'>
                  <span className='text-lg'>⚽</span> Nomes dos jogadores
                </span>
                <textarea
                  value={players}
                  onChange={(event) => setPlayers(event.target.value)}
                  required
                  rows={6}
                  placeholder='Digite um jogador por linha'
                  className={textareaClassName}
                />
                <p className='text-xs font-medium text-muted-foreground'>
                  {playerCount > 0
                    ? `${playerCount} jogador${playerCount === 1 ? '' : 'es'} listado${playerCount === 1 ? '' : 's'}`
                    : 'Ainda não há jogadores listados'}
                </p>
              </label>

              <label className='block space-y-2'>
                <span className='flex items-center gap-2 text-sm font-bold text-foreground'>
                  <span className='text-lg'>🎂</span> Idade dos jogadores
                </span>
                <textarea
                  value={ages}
                  onChange={(event) => setAges(event.target.value)}
                  required
                  rows={4}
                  placeholder='Ex: João - 17 anos, Pedro - 18 anos...'
                  className={textareaClassName}
                />
              </label>

              <label className='block space-y-2'>
                <span className='flex items-center gap-2 text-sm font-bold text-foreground'>
                  <span className='text-lg'>🏘️</span> Endereço da comunidade
                </span>
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  required
                  placeholder='Ex: Rua das Flores, 123 - Comunidade Boa Esperança'
                  className={inputClassName}
                />
              </label>

              <button
                type='submit'
                className='w-full rounded-full bg-emerald-700 px-6 py-4 text-base font-black text-white shadow-lg shadow-emerald-700/25 transition hover:scale-[1.01] hover:bg-emerald-800'
              >
                Enviar inscrição pelo WhatsApp
              </button>
              <p className='text-center text-xs leading-5 text-muted-foreground'>
                Ao enviar, uma mensagem pronta abre no WhatsApp da organização com os dados do time.
              </p>
            </form>
          </div>
        </div>
      </section>

      <footer className='border-t border-border bg-emerald-950 py-12 text-center text-white'>
        <FjuLogo className='mx-auto h-12 w-12' />
        <p className='mt-3 text-sm font-black uppercase tracking-[0.25em] text-yellow-300'>FJU nas Comunidades</p>
        <p className='mt-2 text-sm text-emerald-100/70'>Campeonato de futebol das comunidades</p>
        <Link
          to='/inscritos'
          className='mt-5 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-green-950 transition hover:bg-yellow-300'
        >
          📋 Ver lista de inscritos
        </Link>
      </footer>

      {lastRegistration ? (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm'>
          <div className='success-enter w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl'>
            <div className='text-center'>
              <span className='text-5xl'>🎉</span>
              <h3 className='mt-4 text-2xl font-black text-foreground'>Inscrição enviada!</h3>
              <p className='mt-2 leading-6 text-muted-foreground'>
                A ficha do time {lastRegistration.teamName} foi registrada neste dispositivo e a mensagem foi aberta no WhatsApp.
              </p>
              <div className='mt-5 rounded-2xl bg-muted p-4 text-left text-sm leading-6 text-foreground'>
                {buildConfirmationMessage(lastRegistration)}
              </div>
              {confirmationWhatsappUrl ? (
                <a
                  href={confirmationWhatsappUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-800'
                >
                  Enviar confirmação no WhatsApp
                </a>
              ) : null}
              <a
                href={adminWhatsappUrl}
                target='_blank'
                rel='noreferrer'
                className='mt-3 inline-flex w-full items-center justify-center rounded-full border border-emerald-700 px-6 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50'
              >
                Reenviar ficha para a organização
              </a>
              <button
                type='button'
                onClick={() => setLastRegistration(null)}
                className='mt-3 w-full rounded-full px-6 py-3 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground'
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
