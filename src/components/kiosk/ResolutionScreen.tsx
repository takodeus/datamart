interface ResolutionScreenProps {
  onTalk: () => void;
  onSkipToReceipt: () => void;
}

const ResolutionScreen = ({ onTalk, onSkipToReceipt }: ResolutionScreenProps) => {
  return (
    <div className="flex flex-col justify-center items-center" style={{ position: 'absolute', inset: 0, background: 'hsl(var(--primary))', padding: '24px 40px' }}>
      <div className="max-w-[600px] w-full flex flex-col items-start">
        <div className="text-[11px] font-semibold tracking-wide uppercase text-primary-foreground/60 mb-3">
          cherre.com — unified real estate data
        </div>

        <div className="text-primary-foreground font-black leading-none tracking-tight mb-4" style={{ fontSize: 'clamp(32px, 5.5vw, 64px)' }}>
          One item.<br />One definition.<br />One answer.
        </div>

        <div className="text-primary-foreground/80 font-normal leading-relaxed max-w-[480px] mb-6" style={{ fontSize: 'clamp(13px, 1.6vw, 16px)' }}>
          Cherre maps every data point to a unified ontology built for real estate. No reconciliation. No ambiguity. No 6-hour spreadsheet.
        </div>

        {/* Stats */}
        <div className="flex rounded-2xl overflow-hidden w-full max-w-[480px] mb-6 bg-primary-foreground/25 backdrop-blur-sm">
          {[
            { num: '4B+', label: 'Legal entities resolved' },
            { num: '160M', label: 'Parcels mapped' },
            { num: '120+', label: 'Data vendors connected' },
          ].map((stat, i) => (
            <div key={i} className={`flex-1 px-6 py-5 ${i < 2 ? 'border-r border-primary-foreground/20' : ''}`}>
              <div className="text-primary-foreground font-black leading-none tracking-tight mb-1" style={{ fontSize: 'clamp(20px, 2.8vw, 28px)' }}>
                {stat.num}
              </div>
              <div className="text-[10px] font-semibold tracking-wide uppercase text-primary-foreground/50">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Row */}
        <div className="flex items-center gap-8 w-full max-w-[480px]">
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={onTalk}
              data-sound="click"
              className="bg-primary-foreground text-primary border-none rounded-xl px-10 py-4 font-sans text-[13px] font-extrabold tracking-wide uppercase cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.97] shadow-md"
            >
              Talk to the team
            </button>
            <button
              onClick={onSkipToReceipt}
              data-sound="click"
              className="text-primary-foreground/60 hover:text-primary-foreground text-[11px] font-semibold tracking-wide uppercase cursor-pointer transition-colors border border-primary-foreground/20 hover:border-primary-foreground/50 rounded-xl px-6 py-4"
            >
              Complete checkout →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolutionScreen;
