import austinHicks from '@/assets/team/austin-hicks.png';
import { useState } from 'react';
import tamaHuang from '@/assets/team/tama-huang.jpg';
import choXue from '@/assets/team/cho-xue.jpg';
import margaretGuelzow from '@/assets/team/margaret-guelzow.jpg';
import ldSalmanson from '@/assets/team/ld-salmanson.jpg';
import tylerChristensen from '@/assets/team/tyler-christensen.jpg';
import qrTyler from '@/assets/team/qr-tyler.jpg';
import qrMargaret from '@/assets/team/qr-margaret.jpg';
import qrLd from '@/assets/team/qr-ld.jpg';
import qrTama from '@/assets/team/qr-tama.jpg';
import qrCho from '@/assets/team/qr-cho.jpg';
import qrAustin from '@/assets/team/qr-austin.png';

interface TeamMember {
  name: string;
  title: string;
  location: string;
  initials: string;
  linkedinUrl: string;
  photo: string;
  qrImage?: string;
}

const TEAM: TeamMember[] = [
  {
    name: 'L.D. Salmanson',
    title: 'CEO & Co-Founder',
    location: 'New York, NY',
    initials: 'LD',
    linkedinUrl: 'https://linkedin.com/in/placeholder',
    photo: ldSalmanson,
    qrImage: qrLd,
  },
  {
    name: 'Tama Huang',
    title: 'Chief Strategy Officer',
    location: 'Seattle, WA',
    initials: 'TH',
    linkedinUrl: 'https://linkedin.com/in/placeholder',
    photo: tamaHuang,
    qrImage: qrTama,
  },
  {
    name: 'Margaret Guelzow',
    title: 'Chief Client Officer',
    location: 'Minnesota, MN',
    initials: 'MG',
    linkedinUrl: 'https://linkedin.com/in/placeholder',
    photo: margaretGuelzow,
    qrImage: qrMargaret,
  },
  {
    name: 'Tyler Christensen',
    title: 'Chief Growth Officer',
    location: 'Chicago, IL',
    initials: 'TC',
    linkedinUrl: 'https://linkedin.com/in/placeholder',
    photo: tylerChristensen,
    qrImage: qrTyler,
  },
  {
    name: 'Cho Xue',
    title: 'Senior Director, AI Enablement',
    location: 'New York, NY',
    initials: 'CX',
    linkedinUrl: 'https://linkedin.com/in/placeholder',
    photo: choXue,
    qrImage: qrCho,
  },
  {
    name: 'Austin Hicks',
    title: 'Senior Strategic Account Manager',
    location: 'New York, NY',
    initials: 'AH',
    linkedinUrl: 'https://linkedin.com/in/placeholder',
    photo: austinHicks,
    qrImage: qrAustin,
  },
];

// Minimal inline QR placeholder — three corner squares + dot fill
// Replace linkedinUrl with real QR SVG per team member before Realcomm
const QRPlaceholder = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
    <rect width="52" height="52" fill="white" rx="3" />
    <g fill="currentColor">
      {/* TL corner */}
      <rect x="2"  y="2"  width="16" height="16" rx="2" />
      <rect x="4"  y="4"  width="12" height="12" fill="white" rx="1" />
      <rect x="6"  y="6"  width="8"  height="8"  rx="1" />
      {/* TR corner */}
      <rect x="34" y="2"  width="16" height="16" rx="2" />
      <rect x="36" y="4"  width="12" height="12" fill="white" rx="1" />
      <rect x="38" y="6"  width="8"  height="8"  rx="1" />
      {/* BL corner */}
      <rect x="2"  y="34" width="16" height="16" rx="2" />
      <rect x="4"  y="36" width="12" height="12" fill="white" rx="1" />
      <rect x="6"  y="38" width="8"  height="8"  rx="1" />
      {/* Data dots */}
      <rect x="20" y="2"  width="4"  height="4" />
      <rect x="26" y="2"  width="4"  height="4" />
      <rect x="20" y="8"  width="4"  height="4" />
      <rect x="26" y="14" width="4"  height="4" />
      <rect x="20" y="20" width="12" height="4" />
      <rect x="34" y="20" width="4"  height="4" />
      <rect x="40" y="20" width="8"  height="4" />
      <rect x="34" y="26" width="4"  height="8" />
      <rect x="40" y="28" width="8"  height="4" />
      <rect x="20" y="26" width="4"  height="4" />
      <rect x="26" y="26" width="4"  height="4" />
      <rect x="20" y="32" width="8"  height="4" />
      <rect x="20" y="38" width="4"  height="8" />
      <rect x="26" y="40" width="8"  height="4" />
      <rect x="36" y="34" width="4"  height="8" />
      <rect x="42" y="34" width="6"  height="4" />
      <rect x="44" y="40" width="4"  height="8" />
    </g>
  </svg>
);

interface TeamScreenProps {
  onContinue: () => void;
}

const TeamScreen = ({ onContinue }: TeamScreenProps) => {
  const [zoomedMember, setZoomedMember] = useState<TeamMember | null>(null);

  return (
    <div
      className="flex flex-col"
      style={{ position: 'absolute', inset: 0, background: 'hsl(var(--background))' }}
    >
      {/* Header */}
      <div className="bg-primary px-10 pt-5 pb-5 flex items-end justify-between flex-shrink-0">
        <div>
          <div className="text-[11px] font-semibold tracking-wide uppercase text-primary-foreground/70 mb-1">
            Meet the team
          </div>
          <div
            className="text-primary-foreground font-extrabold tracking-tight"
            style={{ fontSize: 'clamp(18px, 3vw, 26px)' }}
          >
            We're right here. Let's talk.
          </div>
        </div>
        <div className="pill-badge text-[10px]" style={{ background: 'hsl(var(--primary-deep))' }}>
          Step 5 of 6
        </div>
      </div>

      {/* Team cards — 2 columns × 3 rows */}
      <div className="flex-1 overflow-y-auto px-6 py-5 grid grid-cols-2 grid-rows-3 gap-3">
        {TEAM.map((member) => (
          <div
            key={member.name}
            className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 shadow-sm min-w-0"
          >
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 overflow-hidden flex-shrink-0">
              <img
                src={member.photo}
                alt={member.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-foreground truncate">{member.name}</div>
              <div className="text-[9px] font-semibold tracking-wide uppercase text-primary/70 mt-0.5 truncate">
                {member.title}
              </div>
              <div className="text-[10px] text-muted-foreground leading-snug mt-1 truncate">
                {member.location}
              </div>
            </div>

            {/* QR */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setZoomedMember(member)}
                data-sound="click"
                aria-label={`Enlarge ${member.name} LinkedIn QR code`}
                className="text-primary rounded-md overflow-hidden shadow-sm bg-white cursor-pointer transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {member.qrImage ? (
                  <img
                    src={member.qrImage}
                    alt={`${member.name} LinkedIn QR`}
                    className="w-11 h-11 object-contain"
                  />
                ) : (
                  <QRPlaceholder size={44} />
                )}
              </button>
              <span className="text-[8px] text-muted-foreground/50 font-mono tracking-wide text-center">
                LinkedIn
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-border bg-card flex-shrink-0 flex justify-end">
        <button
          onClick={onContinue}
          data-sound="click"
          className="bg-primary text-primary-foreground border-none rounded-xl px-8 py-3 font-sans text-xs font-bold tracking-wide uppercase cursor-pointer transition-all hover:bg-primary-light shadow-md hover:shadow-lg active:scale-[0.97]"
        >
          Complete checkout →
        </button>
      </div>

      {/* Zoomed QR overlay */}
      {zoomedMember && (
        <div
          onClick={() => setZoomedMember(null)}
          className="absolute inset-0 z-[200] flex items-center justify-center bg-foreground/70 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-3 max-w-[90%]"
          >
            <div className="text-center">
              <div className="text-sm font-bold text-foreground">{zoomedMember.name}</div>
              <div className="text-[10px] font-semibold tracking-wide uppercase text-primary/70 mt-0.5">
                {zoomedMember.title}
              </div>
            </div>
            <div className="text-primary rounded-lg overflow-hidden bg-white p-3 shadow-inner">
              {zoomedMember.qrImage ? (
                <img
                  src={zoomedMember.qrImage}
                  alt={`${zoomedMember.name} LinkedIn QR`}
                  className="w-72 h-72 object-contain"
                />
              ) : (
                <QRPlaceholder size={288} />
              )}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono tracking-wide">
              Scan with your phone camera
            </div>
            <button
              type="button"
              onClick={() => setZoomedMember(null)}
              data-sound="click"
              className="mt-1 bg-primary text-primary-foreground border-none rounded-lg px-5 py-2 text-[11px] font-bold tracking-wide uppercase cursor-pointer transition-all hover:bg-primary-light active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamScreen;
